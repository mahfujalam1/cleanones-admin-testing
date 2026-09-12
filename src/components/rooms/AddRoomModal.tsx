"use client";

import React, { useEffect, useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import { TbDoor, TbPlus } from "react-icons/tb";
import { Select } from "@/components/ui/select";
import { createRoom, getRoomLocations, type RoomTaskInput } from "@/services/actions/rooms";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import { getPlaceholderTranslation } from "@/lib/translations";

interface Props {
  onClose: () => void;
  onAdd: () => void;
}

const controlClass =
  "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const newTask = (): RoomTaskInput => ({
  name: "",
  frequency_type: "daily",
  duration: 15,
  is_photo_req: false,
  photo: [],
  days_of_week: ["Mon", "Fri"],
  days_of_month: [1, 15],
});

export function AddRoomModal({ onClose, onAdd }: Props) {
  const t = getDashboardTranslation(getLocale(usePathname()));
  const p = getPlaceholderTranslation(getLocale(usePathname()));
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("suite");
  const [cleanType, setCleanType] = useState("standard");
  const [tasks, setTasks] = useState<RoomTaskInput[]>([newTask()]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [locationId, setLocationId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getRoomLocations().then((result) => {
      if (!result.success) return setError(result.error);
      setLocations(result.data.locations);
      setLocationId(result.data.locations[0]?.id ?? "");
    });
    const esc = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const updateTask = (index: number, update: Partial<RoomTaskInput>) =>
    setTasks((items) => items.map((item, i) => (i === index ? { ...item, ...update } : item)));

  const totalDuration = tasks.reduce((acc, t) => acc + (Number(t.duration) || 0), 0);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!locationId) return setError(t.locations.title);
    if (!roomName.trim()) return setError(t.rooms.title);
    if (
      tasks.some((task) => {
        const photos = task.photo || [];
        return (
          !task.name.trim() ||
          (task.is_photo_req && (!photos.length || photos.some((photo) => !photo.name.trim())))
        );
      })
    )
      return setError(t.common.required);

    setSaving(true);
    setError("");

    const formattedTasks = tasks.map((t) => {
      const freq = t.frequency_type === "daily" ? "every_visit" : t.frequency_type;
      const isPhotoReq = Boolean(t.is_photo_req);
      const photo = isPhotoReq
        ? (t.photo || [])
          .filter((p) => p.name.trim() !== "")
          .map((p) => ({ ...(p.id ? { id: p.id } : {}), name: p.name.trim() }))
        : [];

      const taskObj: RoomTaskInput = {
        name: t.name.trim(),
        frequency_type: freq,
        is_photo_req: isPhotoReq,
        duration_minutes: Number(t.duration) || 0,
        photo,
      };

      if (freq === "weekly") {
        const days = (t.days_of_week || ["Mon", "Fri"]).map((d) => d.toLowerCase());
        taskObj.days_of_week = Array.from(new Set(days));
      } else if (freq === "monthly") {
        const dates = (t.days_of_month || [1, 15]).map(Number);
        taskObj.days_of_month = Array.from(new Set(dates)).sort((a, b) => a - b);
      }

      return taskObj;
    });

    const result = await createRoom(locationId, {
      clean_type: cleanType,
      duration: totalDuration || 30,
      monthly_cleaning_frequency: 4,
      room_name: roomName.trim(),
      room_type: roomType,
      floor: 1,
      tasks: formattedTasks,
    });
    setSaving(false);
    if (!result.success) return setError(result.error);
    onAdd();
  };

  return (
    <div
      onClick={onClose}
      className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5 shrink-0 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-500 border border-sky-100 shrink-0">
              <TbDoor className="text-2xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.rooms.addRoom}</h2>
              <p className="text-xs text-slate-400">{t.rooms.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-6 py-5 text-xs text-slate-700 flex-1">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          {/* Location * & Room Name * */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${t.locations.title} *`}>
              <Select
                value={locationId}
                onValueChange={setLocationId}
                options={locations.map((item) => ({ value: item.id, label: item.name }))}
                placeholder={t.locations.title}
                required
              />
            </Field>

            <Field label={`${t.rooms.title} *`}>
              <input
                required
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder={p.name}
                className={controlClass}
              />
            </Field>
          </div>

          {/* Room Type * & Clean Type * */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${t.common.status} *`}>
              <Select
                value={roomType}
                onValueChange={setRoomType}
                options={[
                  { value: "suite", label: "Suite" },
                  { value: "office", label: "Office" },
                  { value: "washroom", label: "Washroom / Restroom" },
                  { value: "kitchen", label: "Kitchen / Breakroom" },
                  { value: "bedroom", label: "Bedroom" },
                  { value: "hallway", label: "Hallway / Corridor" },
                  { value: "meeting_room", label: "Meeting Room" },
                  { value: "other", label: "Other" },
                ]}
                placeholder={t.rooms.title}
                required
              />
            </Field>

            <Field label={`${t.common.status} *`}>
              <Select
                value={cleanType}
                onValueChange={setCleanType}
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "deep", label: "Deep Clean" },
                  { value: "regular", label: "Regular" },
                  { value: "disinfection", label: "Disinfection" },
                  { value: "custom", label: "Custom" },
                ]}
                placeholder={t.common.status}
                required
              />
            </Field>
          </div>

          {/* Tasks Container Box */}
          <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t.common.tasks}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add task and photo requirements. Room duration is calculated automatically from these.
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-2">
                  {t.common.duration}: <span className="font-bold text-slate-900">{totalDuration} min</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTasks((items) => [...items, newTask()])}
                className="flex items-center gap-1.5 rounded-lg bg-[#0ea5e9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284c7] transition-colors shadow-sm cursor-pointer shrink-0"
              >
                <TbPlus className="text-sm" /> {t.common.tasks}
              </button>
            </div>

            {!tasks.length && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
                {t.common.noDataFound}
              </p>
            )}

            {tasks.map((task, taskIndex) => (
              <div
                key={taskIndex}
                className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-bold text-slate-800">Task {taskIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => setTasks((items) => items.filter((_, i) => i !== taskIndex))}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Task Name *">
                    <input
                      required
                      value={task.name}
                      onChange={(e) => updateTask(taskIndex, { name: e.target.value })}
                      placeholder={p.task}
                      className={controlClass}
                    />
                  </Field>

                  <Field label="Frequency Type *">
                    <Select
                      value={task.frequency_type}
                      onValueChange={(val) => updateTask(taskIndex, { frequency_type: val })}
                      options={[
                        { value: "daily", label: "Daily" },
                        { value: "weekly", label: "Weekly" },
                        { value: "monthly", label: "Monthly" },
                      ]}
                    />
                  </Field>

                  <Field label="Duration (min)">
                    <input
                      type="number"
                      min={1}
                      value={task.duration ?? ""}
                      onChange={(e) =>
                        updateTask(taskIndex, {
                          duration: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder={p.number}
                      className={controlClass}
                    />
                  </Field>
                </div>

                {/* Conditional Weekdays grid for Weekly frequency */}
                {task.frequency_type === "weekly" && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      Week days *
                    </label>
                    <div className="grid grid-cols-7 gap-1.5">
                      {[
                        { value: "Mon", label: "Mon" },
                        { value: "Tue", label: "Tue" },
                        { value: "Wed", label: "Wed" },
                        { value: "Thu", label: "Thu" },
                        { value: "Fri", label: "Fri" },
                        { value: "Sat", label: "Sat" },
                        { value: "Sun", label: "Sun" },
                      ].map((day) => {
                        const isSelected = (task.days_of_week || []).includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              const current = task.days_of_week || [];
                              const next = current.includes(day.value)
                                ? current.filter((d) => d !== day.value)
                                : [...current, day.value];
                              updateTask(taskIndex, { days_of_week: next });
                            }}
                            className={`h-9 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${isSelected
                                ? "border-sky-500 bg-sky-500 text-white shadow-xs"
                                : "border-gray-300 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Conditional Dates of Month grid for Monthly frequency */}
                {task.frequency_type === "monthly" && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      Dates of the month *
                    </label>
                    <div className="grid grid-cols-9 gap-1.5">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((dateNum) => {
                        const isSelected = (task.days_of_month || []).includes(dateNum);
                        return (
                          <button
                            key={dateNum}
                            type="button"
                            onClick={() => {
                              const current = task.days_of_month || [];
                              const next = current.includes(dateNum)
                                ? current.filter((d) => d !== dateNum)
                                : [...current, dateNum];
                              updateTask(taskIndex, { days_of_month: next });
                            }}
                            className={`h-8 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${isSelected
                                ? "border-sky-500 bg-sky-500 text-white shadow-xs"
                                : "border-gray-300 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                          >
                            {dateNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={task.is_photo_req}
                    onChange={(e) => {
                      const photos = task.photo || [];
                      updateTask(taskIndex, {
                        is_photo_req: e.target.checked,
                        photo: e.target.checked
                          ? photos.length
                            ? photos
                            : [{ name: "" }]
                          : [],
                      });
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  Photo required
                </label>

                {task.is_photo_req && (
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                    {(task.photo || []).map((photo, photoIndex) => (
                      <div key={photoIndex} className="flex items-center gap-2">
                        <input
                          required
                          value={photo.name}
                          onChange={(e) =>
                            updateTask(taskIndex, {
                              photo: (task.photo || []).map((item, index) =>
                                index === photoIndex ? { ...item, name: e.target.value } : item
                              ),
                            })
                          }
                          placeholder={p.photo}
                          className={controlClass}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateTask(taskIndex, {
                              photo: (task.photo || []).filter((_, index) => index !== photoIndex),
                            })
                          }
                          className="text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        updateTask(taskIndex, {
                          is_photo_req: true,
                          photo: [...(task.photo || []), { name: "" }],
                        })
                      }
                      className="flex items-center gap-1 text-xs font-semibold text-[#0ea5e9] hover:underline cursor-pointer pt-1"
                    >
                      <TbPlus className="text-sm" /> Add Photo
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {t.common.cancel}
          </button>
          <button
            disabled={saving}
            className="rounded-lg bg-[#0ea5e9] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0284c7] transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? t.settings.saving : t.rooms.addRoom}
          </button>
        </footer>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700">{label}</label>
      <div>{children}</div>
    </div>
  );
}

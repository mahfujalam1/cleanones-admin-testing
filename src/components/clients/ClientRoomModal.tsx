"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MdOutlineClose, MdPlusOne } from "react-icons/md";
import { TbDoor, TbPlus } from "react-icons/tb";
import { Select } from "@/components/ui/select";
import { getLocale } from "@/lib/locale";
import { taskModalTranslations } from "./ClientLocationsPanel";
import { getPlaceholderTranslation } from "@/lib/translations";
import { getDashboardTranslation } from "@/lib/translations";
import {
  createRoom,
  updateRoom,
  type RoomInput,
  type RoomTaskInput,
  type RoomDetails,
} from "@/services/actions/rooms";

const controlClass =
  "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const blankTask = (): RoomTaskInput => ({
  name: "",
  frequency_type: "daily",
  duration: 15,
  is_photo_req: false,
  photo: [],
  days_of_week: ["Mon", "Fri"],
  days_of_month: [1, 15],
});

const defaultRoom: RoomInput = {
  room_name: "",
  room_type: "suite",
  clean_type: "standard",
  duration: 30,
  monthly_cleaning_frequency: 4,
  tasks: [],
};

interface ClientRoomModalProps {
  locationId: string;
  locationName: string;
  initialData?: RoomDetails | null;
  onClose: () => void;
  onSaved: (room?: RoomDetails) => void;
  onError: (msg: string) => void;
}

export function ClientRoomModal({
  locationId,
  locationName,
  initialData,
  onClose,
  onSaved,
  onError,
}: ClientRoomModalProps) {
  const isEdit = Boolean(initialData);
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = taskModalTranslations[locale] || taskModalTranslations.en;
  const dashboardT = getDashboardTranslation(locale);
  const p = getPlaceholderTranslation(locale);

  const [form, setForm] = useState<RoomInput>(() => {
    if (initialData) {
      return {
        room_name: initialData.room_name || "",
        room_type: initialData.room_type || "suite",
        clean_type: initialData.clean_type || "standard",
        duration: initialData.duration || 30,
        monthly_cleaning_frequency: initialData.monthly_cleaning_frequency || 4,
        floor: initialData.floor || 1,
        tasks: (initialData.tasks || []).map((t) => {
          const freq =
            t.frequency_type === "every_visit"
              ? "daily"
              : t.frequency_type || "daily";

          const rawWeekly = t.days_of_week || ["mon", "fri"];
          const weeklyDaysFormatted = rawWeekly.map((d: string) => {
            const s = String(d).toLowerCase();
            return s.charAt(0).toUpperCase() + s.slice(1);
          });

          const rawMonthly = t.days_of_month || [1, 15];

          return {
            id: t.id,
            name: t.name || "",
            frequency_type: freq,
            duration: t.duration_minutes ?? t.duration ?? 15,
            is_photo_req: Boolean(t.is_photo_req || t.photo?.length),
            photo: (t.photo || []).map((p: any) => ({
              id: p.id,
              name: typeof p === "string" ? p : p.name || "",
            })),
            days_of_week: weeklyDaysFormatted,
            days_of_month: rawMonthly,
          };
        }),
      };
    }
    return {
      ...defaultRoom,
      tasks: [blankTask()],
    };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateTask = (index: number, update: Partial<RoomTaskInput>) => {
    setForm((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => (i === index ? { ...task, ...update } : task)),
    }));
  };

  const addTask = () => {
    setForm((prev) => ({
      ...prev,
      tasks: [...prev.tasks, blankTask()],
    }));
  };

  const removeTask = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const totalDuration = form.tasks.reduce(
    (acc, task) => acc + (Number(task.duration) || 0),
    0
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.room_name.trim()) return setError(t.taskName);
    if (form.tasks.some((t) => !t.name.trim())) return setError(t.noTasks);

    setSaving(true);
    setError("");

    const formattedTasks = form.tasks.map((t) => {
      const freq = t.frequency_type === "daily" ? "every_visit" : t.frequency_type;
      const isPhotoReq = Boolean(t.is_photo_req);
      const photo = isPhotoReq
        ? (t.photo || [])
          .filter((p) => p.name.trim() !== "")
          .map((p) => ({ ...(p.id ? { id: p.id } : {}), name: p.name.trim() }))
        : [];

      const taskObj: RoomTaskInput = {
        ...(t.id ? { id: t.id } : {}),
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

    const payload: RoomInput = {
      room_name: form.room_name.trim(),
      room_type: form.room_type,
      clean_type: form.clean_type,
      floor: form.floor || 1,
      duration: totalDuration || form.duration || 30,
      monthly_cleaning_frequency: form.monthly_cleaning_frequency || 4,
      tasks: formattedTasks,
    };

    const result =
      isEdit && initialData
        ? await updateRoom(initialData.id, payload)
        : await createRoom(locationId, payload);

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onSaved(result.data);
    onClose();
  };


  return (
    <div
      onClick={onClose}
      className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        {/* Header matching screenshot */}
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5 shrink-0 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-500 border border-sky-100 shrink-0">
              <TbDoor className="text-2xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEdit ? t.editRoom : dashboardT.rooms.addRoom}
              </h2>
              <p className="text-xs text-slate-400">{t.tasksTitle}</p>
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

        {/* Body Form */}
        <div className="space-y-4 overflow-y-auto px-6 py-5 text-xs text-slate-700 flex-1">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          {/* Row 1: Location (Disabled input) & Room Name * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={`${t.locationsBreadcrumb} *`}>
              <input
                disabled
                value={locationName || "Default Location"}
                className="h-10 w-full rounded-md border border-gray-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none cursor-not-allowed"
              />
            </Field>

            <Field label={t.taskName.replace("Task Name *", "Room Name *")}>
              <input
                required
                value={form.room_name}
                onChange={(e) => setForm({ ...form, room_name: e.target.value })}
                placeholder={p.name}
                className={controlClass}
              />
            </Field>
          </div>

          {/* Row 2: Room Type * & Clean Type * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={`${t.editRoom} *`}>
              <Select
                value={form.room_type}
                onValueChange={(val) => setForm({ ...form, room_type: val })}
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
                placeholder={t.editRoom}
                required
              />
            </Field>

            <Field label={`${t.cleaningPlanCardTitle} *`}>
              <Select
                value={form.clean_type}
                onValueChange={(val) => setForm({ ...form, clean_type: val })}
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "deep", label: "Deep Clean" },
                  { value: "regular", label: "Regular" },
                  { value: "disinfection", label: "Disinfection" },
                  { value: "custom", label: "Custom" },
                ]}
                placeholder={t.cleaningPlanCardTitle}
                required
              />
            </Field>
          </div>

          {/* Tasks Container Box */}
          <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t.tasksTitle}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.noTasks}
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-2">
                  {t.duration}: <span className="font-bold text-slate-900">{totalDuration} min</span>
                </p>
              </div>

              <button
                type="button"
                onClick={addTask}
                className="flex items-center gap-1.5 rounded-lg bg-[#0ea5e9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284c7] transition-colors shadow-sm cursor-pointer shrink-0"
              >
                <TbPlus className="text-sm" /> {t.addTask}
              </button>
            </div>

            {!form.tasks.length && (
              <p className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
                {t.noTasks}
              </p>
            )}

            {form.tasks.map((task, taskIndex) => (
              <div
                key={taskIndex}
                className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {/* Task Header: Task 1 + Remove text link */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-bold text-slate-800">Task {taskIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeTask(taskIndex)}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    {t.remove}
                  </button>
                </div>

                {/* 3-Column Grid: Task Name *, Frequency Type *, Duration (min) */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label={t.taskName}>
                    <input
                      required
                      value={task.name}
                      onChange={(e) => updateTask(taskIndex, { name: e.target.value })}
                      placeholder={t.addTaskPlaceholder}
                      className={controlClass}
                    />
                  </Field>

                  <Field label={t.frequencyType}>
                    <Select
                      value={task.frequency_type}
                      onValueChange={(val) => updateTask(taskIndex, { frequency_type: val })}
                      options={[
                        { value: "daily", label: t.daily },
                        { value: "weekly", label: t.weekly },
                        { value: "monthly", label: t.monthly },
                      ]}
                    />
                  </Field>

                  <Field label={t.durationMin}>
                    <input
                      type="number"
                      min={1}
                      value={task.duration ?? ""}
                      onChange={(e) =>
                        updateTask(taskIndex, {
                          duration: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder={t.durationPlaceholder}
                      className={controlClass}
                    />
                  </Field>
                </div>

                {/* Conditional Weekdays grid for Weekly frequency */}
                {task.frequency_type === "weekly" && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      {t.weekDays}
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
                            {t.days[day.value] || day.label}
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
                      {t.datesOfMonth}
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

                {/* Photo required checkbox */}
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
                  {t.photoRequired}
                </label>

                {/* Required Photo Section */}
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
                          placeholder={t.requiredPhotoNamePlaceholder}
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
                          {t.remove}
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
                      <TbPlus className="text-sm" /> {t.addPhoto}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            disabled={saving}
            className="rounded-lg bg-[#0ea5e9] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0284c7] transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? (isEdit ? t.saveRoom : dashboardT.rooms.addRoom) : isEdit ? t.saveRoom : dashboardT.rooms.addRoom}
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

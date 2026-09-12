"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdOutlineClose, MdErrorOutline } from "react-icons/md";
import { TbClipboardList, TbPencil } from "react-icons/tb";
import {
  createCleaningPlan,
  getCleaningPlan,
  getPlanRooms,
  updateCleaningPlan,
  type PlanInput,
  type PlanRoomOption,
  type PlanTaskInput,
} from "@/services/actions/cleaningPlans";
import { getClientOptions, type ClientOption } from "@/services/actions/locations";
import { getRoomLocations } from "@/services/actions/rooms";
import { Select } from "@/components/ui/select";
import { DatePicker, todayIso } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { TaskEditor, newTask } from "./TaskEditor";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import { getPlaceholderTranslation } from "@/lib/translations";

const controlClass =
  "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

const days = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

const noRepeat = "Does not repeat";

const isoDate = (value?: string) => (value ? value.slice(0, 10) : "");

const to24h = (value?: string) => {
  const match = value ? /^(\d{1,2}):(\d{2})(?:\s*([AaPp])\.?[Mm]\.?)?/.exec(value.trim()) : null;
  if (!match) return "08:00";
  let hour = Number(match[1]);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "a" && hour === 12) hour = 0;
  if (meridiem === "p" && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, "0")}:${match[2]}`;
};

const formatTimeString = (timeStr?: string) => {
  if (!timeStr) return "08:00 AM";
  const trimmed = timeStr.trim();
  if (trimmed.toUpperCase().includes("AM") || trimmed.toUpperCase().includes("PM")) {
    return trimmed;
  }
  const parts = trimmed.split(":");
  let hour = parseInt(parts[0] || "8", 10);
  const minute = parts[1] || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
};

export function CreatePlanModal({
  onClose,
  onAdd,
  planId,
}: {
  onClose: () => void;
  onAdd: () => void;
  planId?: string;
}) {
  const t = getDashboardTranslation(getLocale(usePathname()));
  const p = getPlaceholderTranslation(getLocale(usePathname()));
  const isEdit = Boolean(planId);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState("");
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [locationId, setLocationId] = useState("");
  const [rooms, setRooms] = useState<PlanRoomOption[]>([]);
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [repeatShift, setRepeatShift] = useState(noRepeat);
  const [repeatUntil, setRepeatUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [tasks, setTasks] = useState<PlanTaskInput[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const hydrating = useRef(isEdit);
  const firstClient = useRef(true);
  const firstLocation = useRef(true);

  const today = useMemo(() => todayIso(), []);
  const minDate = isEdit ? undefined : today;

  useEffect(() => {
    void getClientOptions(1, 100).then((r) =>
      r.success ? setClients(r.data.clients ?? []) : setError(r.error)
    );
  }, []);

  useEffect(() => {
    if (!planId) return;
    void getCleaningPlan(planId).then((r) => {
      setLoading(false);
      if (!r.success) {
        setError(r.error);
        hydrating.current = false;
        return;
      }
      const plan = r.data;
      setTitle(plan.title ?? "");
      setDate(isoDate(plan.date));
      setStartTime(to24h(plan.start_time));
      setRepeatShift(plan.repeat_shift || noRepeat);
      setRepeatUntil(isoDate(plan.repeat_until));
      setNotes(plan.shift_notes ?? "");
      setWorkingDays(plan.working_days ?? []);
      setTasks(
        (plan.additional_tasks ?? []).map((task) => ({
          id: task.id,
          name: task.name,
          schedule_type: "fixed_date",
          frequency_type: "fixed_date",
          fixed_date: task.fixed_date || "",
          duration: task.duration,
          is_photo_req: task.is_photo_req,
          photo: (task.photo ?? []).map((photo) => ({ id: photo.id, name: photo.name })),
        }))
      );
      setRooms(
        (plan.rooms ?? []).map((room) => ({
          room_id: room.room_id,
          room_name: room.room_name,
          room_type: room.room_type,
          task_number: room.task_number,
          photo_number: room.total_photos_required,
        }))
      );
      setRoomIds(plan.room_ids?.length ? plan.room_ids : (plan.rooms ?? []).map((room) => room.room_id));
      hydrating.current = false;
    });
  }, [planId]);

  useEffect(() => {
    if (firstClient.current) {
      firstClient.current = false;
      if (!clientId) return;
    }
    setLocationId("");
    setLocations([]);
    if (!hydrating.current) {
      setRooms([]);
      setRoomIds([]);
    }
    if (clientId)
      void getRoomLocations(clientId).then((r) =>
        r.success ? setLocations(r.data.locations ?? []) : setError(r.error)
      );
  }, [clientId]);

  useEffect(() => {
    if (firstLocation.current) {
      firstLocation.current = false;
      if (!locationId) return;
    }
    if (!locationId) {
      if (!isEdit) {
        setRooms([]);
        setRoomIds([]);
      }
      return;
    }
    void getPlanRooms({ clientId, locationId, limit: 100 }).then((r) => {
      if (!r.success) return setError(r.error);
      const fetched = r.data.rooms ?? [];
      setRooms((current) => [
        ...current.filter((room) => roomIds.includes(room.room_id) && !fetched.some((item) => item.room_id === room.room_id)),
        ...fetched,
      ]);
    });
  }, [clientId, locationId]);

  useEffect(() => {
    if (hydrating.current) return;
    if (repeatShift === "Every day") setWorkingDays(days.map((day) => day.value));
    else if (repeatShift === "Standard working week") setWorkingDays(["mon", "tue", "wed", "thu", "fri"]);
    else setWorkingDays([]);
  }, [repeatShift]);

  const updateTask = (index: number, update: Partial<PlanTaskInput>) =>
    setTasks((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...update } : item)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && (!clientId || !locationId)) return setError(t.common.required);
    if (!title || !date || !roomIds.length) return setError(t.common.required);
    if (!repeatUntil) return setError(t.common.required);
    if (!isEdit && date < today) return setError(t.common.required);
    // Note: `working_days` is not read anywhere by the backend's shift-generation logic (which
    // room/additional tasks are due depends entirely on their own frequency_type/days_of_week/
    // schedule_type fields) — it used to be a required selection here for no functional benefit;
    // that requirement has been removed rather than blocking plan creation on a no-op field.
    if (repeatShift !== noRepeat && repeatUntil && repeatUntil < date)
      return setError("Repeat until must be on or after the plan date.");
    if (tasks.some((task) => !task.name.trim())) {
      return setError(t.common.required);
    }

    const formattedStartTime = formatTimeString(startTime);
    setSaving(true);
    setError("");

    const formattedTasks = tasks.map((t) => {
      const freqType = "fixed_date";
      const validPhotos = (t.photo || [])
        .filter((p) => p.name && p.name.trim() !== "")
        .map((p) => ({ ...(p.id ? { id: p.id } : {}), name: p.name.trim() }));

      const isPhotoReq = Boolean(t.is_photo_req && validPhotos.length > 0);

      const taskItem: PlanTaskInput = {
        ...(t.id ? { id: t.id } : {}),
        name: t.name.trim(),
        frequency_type: freqType,
        // Backend distinguishes fixed-date vs recurring additional tasks via `schedule_type`
        // (defaulting to 'recurring' when absent) — TaskEditor already sets this on `t`, but it
        // was being dropped here when building the outgoing task, so every additional task
        // silently became 'recurring' (due on every visit) regardless of its fixed_date.
        schedule_type: t.schedule_type || "fixed_date",
        is_photo_req: isPhotoReq,
        photo: validPhotos,
      };

      if (freqType === "fixed_date" && t.fixed_date) {
        taskItem.fixed_date = t.fixed_date;
      }
      if (t.duration) {
        taskItem.duration_minutes = Number(t.duration);
        taskItem.duration = Number(t.duration);
      }

      return taskItem;
    });

    const payload: PlanInput = {
      title: title.trim(),
      room_ids: roomIds,
      date,
      start_time: formattedStartTime,
      repeat_shift: repeatShift || "Does not repeat",
      ...(repeatUntil ? { repeat_until: repeatUntil } : {}),
      working_days: workingDays,
      shift_notes: notes.trim(),
      additional_tasks: formattedTasks,
    };

    const result = planId
      ? await updateCleaningPlan(planId, { ...payload, ...(locationId ? { location_id: locationId } : {}) })
      : await createCleaningPlan(payload);

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
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-slate-200 p-5 bg-white shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-500 shrink-0">
            {isEdit ? <TbPencil className="text-xl" /> : <TbClipboardList className="text-xl" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-900">
              {isEdit ? t.common.edit : t.plans.addPlan}
            </h2>
            <p className="text-xs text-slate-400">
              {t.plans.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        {loading ? (
          <div className="p-16 text-center text-sm text-slate-400">{t.notifications.marking}</div>
        ) : (
          <div className="space-y-4 overflow-y-auto p-6 text-xs">
            {/* Client & Location Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={isEdit ? t.clients.title : `${t.clients.title} *`}>
                <Select
                  required={!isEdit}
                  value={clientId}
                  onValueChange={setClientId}
                  placeholder={isEdit ? t.clients.title : t.clients.searchPlaceholder}
                  options={clients.map((c) => ({
                    value: c.id,
                    label: c.company_name || c.primary_contact_name,
                  }))}
                />
              </Field>

              <Field label={isEdit ? t.locations.title : `${t.locations.title} *`}>
                <Select
                  required={!isEdit}
                  disabled={!clientId}
                  value={locationId}
                  onValueChange={setLocationId}
                  placeholder={clientId ? t.locations.searchPlaceholder : t.clients.title}
                  options={locations.map((l) => ({ value: l.id, label: l.name }))}
                />
              </Field>
            </div>

            {/* Rooms Box */}
            <Field label={`${t.rooms.title} *`}>
              <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-lg border border-gray-300 bg-slate-50/70 p-2.5">
                {!rooms.length ? (
                  <Empty text={locationId ? t.rooms.noRoomsFound : t.clients.title} />
                ) : (
                  rooms.map((room) => (
                    <label
                      key={room.room_id}
                      className="flex items-center gap-2.5 rounded-md border border-gray-200 bg-white p-2.5 text-xs transition-colors hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={roomIds.includes(room.room_id)}
                        onChange={() =>
                          setRoomIds((ids) =>
                            ids.includes(room.room_id)
                              ? ids.filter((id) => id !== room.room_id)
                              : [...ids, room.room_id]
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <span className="flex-1 font-semibold text-slate-800">{room.room_name}</span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {room.task_number} {t.common.tasks} · {room.photo_number} {t.common.photos}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </Field>

            {/* Plan Title */}
            <Field label={`${t.plans.title} *`}>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={p.name}
                className={controlClass}
              />
            </Field>

            {/* Date & Start Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={`${t.roster.startDate} *`}>
                <DatePicker value={date} onValueChange={setDate} min={minDate} />
              </Field>
              <Field label={`${t.roster.startTime} *`}>
                <TimePicker value={startTime} onValueChange={setStartTime} />
              </Field>
            </div>

            {/* End Date */}
            <Field label={`${t.roster.endDate} *`}>
              <DatePicker
                value={repeatUntil}
                onValueChange={setRepeatUntil}
                min={date || minDate}
                placeholder={p.date}
              />
              <p className="mt-1.5 text-[11px] text-slate-400 font-normal leading-relaxed">
                Set the end date for this cleaning plan. For a single visit, use the same date as the start date.
              </p>
            </Field>



            {repeatShift !== noRepeat && (
              <Field label="Working days *">
                <div className="grid grid-cols-7 gap-1.5">
                  {days.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() =>
                        setWorkingDays((values) =>
                          values.includes(day.value)
                            ? values.filter((v) => v !== day.value)
                            : [...values, day.value]
                        )
                      }
                      className={`h-9 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${workingDays.includes(day.value)
                        ? "border-sky-500 bg-sky-500 text-white shadow-xs"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </Field>
            )}

            {/* Description */}
            <Field label={t.extraServices.description}>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={p.notes}
                className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </Field>

            {/* Additional Tasks Section */}
            <TaskEditor
              tasks={tasks}
              setTasks={setTasks}
              updateTask={updateTask}
              minDate={date || minDate}
              maxDate={repeatUntil || date || minDate}
            />

          </div>
        )}

        {/* Footer Buttons & Sticky Error Section */}
        <footer className="border-t border-slate-200 p-4 bg-slate-50 shrink-0 space-y-3">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 shadow-xs animate-in fade-in">
              <MdErrorOutline className="text-base shrink-0" />
              <span className="flex-1 leading-snug">{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                title={t.common.cancel}
              >
                <MdOutlineClose className="text-sm" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="rounded-lg bg-sky-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-600 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {saving
                ? isEdit
                  ? t.settings.updating
                  : t.settings.saving
                : isEdit
                  ? t.common.edit
                  : t.plans.addPlan}
            </button>
          </div>
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

function Empty({ text }: { text: string }) {
  return <p className="p-4 text-center text-xs text-slate-400">{text}</p>;
}

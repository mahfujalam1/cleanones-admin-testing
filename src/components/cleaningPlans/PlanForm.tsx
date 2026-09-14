"use client";

import { useEffect, useState } from "react";
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import { FormModal } from "@/components/shared/FormModal";
import {
  CheckboxField,
  DateField,
  FieldLabel,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/shared/Field";
import { ClientLocationPicker, ClientPicker } from "@/components/shared/Pickers";
import { apiError } from "@/redux/api/apiError";
import { roomTaskCount, useGetRoomsQuery } from "@/redux/api/endpoints/rooms.api";
import {
  useCreateCleaningPlanMutation,
  useGetCleaningPlanQuery,
  useUpdateCleaningPlanMutation,
  type CleaningPlan,
} from "@/redux/api/endpoints/cleaningPlans.api";
import {
  useCreateAdditionalTaskMutation,
  type AdditionalTask,
} from "@/redux/api/endpoints/additionalTasks.api";
import { refDoc, refId } from "@/redux/api/types";
import { todayIso } from "@/components/ui/date-picker";

/** Half-hour slots; the API stores the start as one timestamp, not a separate time field. */
const TIME_SLOTS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 ? "30" : "00";
  const value = `${String(hours).padStart(2, "0")}:${minutes}`;
  const suffix = hours < 12 ? "AM" : "PM";
  const display = `${String(hours % 12 || 12).padStart(2, "0")}:${minutes} ${suffix}`;
  return { value, label: display };
});

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "");

/** "3 tasks" beside a room, falling back to its type when the count was not sent. */
const taskLabel = (room: Parameters<typeof roomTaskCount>[0] & { room_type: string }) => {
  const count = roomTaskCount(room);
  return count === null ? room.room_type : `${count} ${count === 1 ? "task" : "tasks"}`;
};

const toTimeInput = (value?: string) => {
  if (!value) return "08:00";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "08:00";
  const minutes = parsed.getMinutes() < 30 ? "00" : "30";
  return `${String(parsed.getHours()).padStart(2, "0")}:${minutes}`;
};

/** Combines the date and time fields into the single timestamp the API stores. */
const toTimestamp = (date: string, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const parsed = new Date(date);
  parsed.setHours(hours, minutes, 0, 0);
  return parsed.toISOString();
};

type TaskDraft = {
  key: string;
  name: string;
  duration_minutes: string;
  is_photo_required: boolean;
  /** Titles only — the worker fills in `photo_url` and `is_uploaded` when they finish. */
  photo_requirements: string[];
  date: string;
};

let draftCounter = 0;
const newDraft = (date: string): TaskDraft => ({
  key: `draft-${(draftCounter += 1)}`,
  name: "",
  duration_minutes: "",
  is_photo_required: false,
  photo_requirements: [],
  date,
});

export function PlanForm({ plan, onClose, onCreated }: {
  plan?: CleaningPlan;
  onClose: () => void;
  /** Handed the new plan so the caller can offer to add tasks to it. */
  onCreated?: (plan: CleaningPlan) => void;
}) {
  const isEdit = plan !== undefined;

  // Query full cleaning plan from GET /cleaning-plan/single-cleaning-plan/{id}
  const { data: singlePlan, isLoading: loadingSinglePlan } = useGetCleaningPlanQuery(
    plan?._id ?? "",
    { skip: !isEdit || !plan?._id }
  );

  const [client, setClient] = useState(() => refId(plan?.client));
  const [location, setLocation] = useState(() => refId(plan?.location));
  const [rooms, setRooms] = useState<string[]>(() => (plan?.rooms ?? []).map(refId).filter(Boolean));
  const [title, setTitle] = useState(plan?.title ?? "");
  const [startDate, setStartDate] = useState(toDateInput(plan?.date_time));
  const [startTime, setStartTime] = useState(toTimeInput(plan?.date_time));
  const [endDate, setEndDate] = useState(toDateInput(plan?.end_date));
  const [description, setDescription] = useState(plan?.description ?? "");
  const [drafts, setDrafts] = useState<TaskDraft[]>([]);
  const [error, setError] = useState("");
  const [savingTasks, setSavingTasks] = useState(false);

  // When single cleaning plan data is retrieved, populate the form defaults
  useEffect(() => {
    if (!singlePlan) return;
    if (singlePlan.title) setTitle(singlePlan.title);
    if (singlePlan.client) setClient(refId(singlePlan.client));
    if (singlePlan.location) setLocation(refId(singlePlan.location));
    const roomIds = (singlePlan.rooms ?? []).map(refId).filter(Boolean);
    if (roomIds.length > 0) {
      setRooms(roomIds);
    }
    if (singlePlan.date_time) {
      setStartDate(toDateInput(singlePlan.date_time));
      setStartTime(toTimeInput(singlePlan.date_time));
    }
    if (singlePlan.end_date) {
      setEndDate(toDateInput(singlePlan.end_date));
    }
    if (singlePlan.description || singlePlan.note) {
      setDescription(singlePlan.description || singlePlan.note || "");
    }
  }, [singlePlan]);

  /**
   * A plan cannot start in the past, and cannot end before it starts. An existing plan keeps its
   * own start as the floor, so editing one that began earlier does not fight the calendar.
   */
  const earliestStart = isEdit && startDate && startDate < todayIso() ? startDate : todayIso();
  const earliestEnd = startDate || earliestStart;

  const { data: roomPage, isFetching: loadingRooms } = useGetRoomsQuery(
    { locationId: location, limit: 100, sort: "name" },
    { skip: !location },
  );
  const available = roomPage?.result ?? [];

  const [createPlan, { isLoading: creating }] = useCreateCleaningPlanMutation();
  const [updatePlan, { isLoading: updating }] = useUpdateCleaningPlanMutation();
  const [createTask] = useCreateAdditionalTaskMutation();

  const editDraft = (key: string, patch: Partial<TaskDraft>) =>
    setDrafts((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const toggleRoom = (id: string) =>
    setRooms((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  // Existing additional tasks populated from singlePlan
  const existingTasks = (singlePlan?.additional_tasks ?? [])
    .map((task) => refDoc<AdditionalTask>(task))
    .filter(Boolean) as AdditionalTask[];

  const submit = async () => {
    if (!client || !location) {
      setError("Pick a client and location.");
      return;
    }
    if (rooms.length === 0) {
      setError("Pick at least one room.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Set both a start and an end date.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("The end date cannot be before the start date.");
      return;
    }

    const missingPhotos = drafts.find(
      (draft) =>
        draft.name.trim() &&
        draft.is_photo_required &&
        !draft.photo_requirements.some((title) => title.trim()),
    );
    if (missingPhotos) {
      setError(`Name at least one photo for "${missingPhotos.name.trim()}", or turn photos off.`);
      return;
    }

    const body = {
      title: title.trim(),
      client,
      location,
      rooms,
      date_time: toTimestamp(startDate, startTime),
      end_date: new Date(endDate).toISOString(),
      description: description.trim() || undefined,
    };

    try {
      if (isEdit) {
        await updatePlan({ id: plan._id, body }).unwrap();

        // Each additional task is its own record pointing back at the plan.
        const named = drafts.filter((draft) => draft.name.trim());
        if (named.length) {
          setSavingTasks(true);
          for (const draft of named) {
            await createTask({
              cleaning_plan_id: plan._id,
              name: draft.name.trim(),
              duration_minutes: draft.duration_minutes.trim() ? Number(draft.duration_minutes) : 0,
              is_photo_required: draft.is_photo_required,
              photo_requirements: draft.is_photo_required
                ? draft.photo_requirements
                    .map((title) => title.trim())
                    .filter(Boolean)
                    .map((title) => ({
                      title,
                      photo_url: "",
                      is_uploaded: false,
                    }))
                : [],
              date_time: draft.date
                ? toTimestamp(draft.date, startTime || "08:00")
                : toTimestamp(startDate || todayIso(), startTime || "08:00"),
            }).unwrap();
          }
        }
        onClose();
      } else {
        const created = await createPlan(body).unwrap();
        onCreated?.(created);
      }
    } catch (cause) {
      setError(apiError(cause));
    } finally {
      setSavingTasks(false);
    }
  };

  return (
    <FormModal
      title={isEdit ? "Edit cleaning plan" : "Add cleaning plan"}
      subtitle={isEdit ? (singlePlan?.title || plan?.title || "Cleaning Plan") : "Cleaning Plans"}
      submitLabel={isEdit ? "Save changes" : "Create plan"}
      saving={creating || updating || savingTasks}
      error={error}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      {isEdit && loadingSinglePlan ? (
        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          </div>
          <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <ClientPicker
              value={client}
              onChange={(value) => {
                setClient(value);
                setLocation("");
                setRooms([]);
                setError("");
              }}
              required
            />
            <ClientLocationPicker
              clientId={client}
              value={location}
              onChange={(value) => {
                setLocation(value);
                setRooms([]);
                setError("");
              }}
              required
            />
          </div>

          <div>
            <FieldLabel htmlFor="plan-rooms" label="Rooms" required />
            <div
              id="plan-rooms"
              className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1"
            >
              {!location ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">Pick a location first</p>
              ) : loadingRooms && available.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">Loading rooms…</p>
              ) : available.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">This location has no rooms</p>
              ) : (
                available.map((room) => (
                  <label
                    key={room._id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={rooms.includes(room._id)}
                      onChange={() => {
                        toggleRoom(room._id);
                        setError("");
                      }}
                      className="h-4 w-4 rounded border-slate-300 accent-primary"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{room.name}</span>
                    <span className="shrink-0 text-[11px] text-slate-400">{taskLabel(room)}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <TextField label="Plan name" value={title} onChange={setTitle} required />

          <div className="grid gap-4 sm:grid-cols-2">
            <DateField
              label="Start date"
              value={startDate}
              onChange={(value) => {
                setStartDate(value);
                // An end date that now sits before the start would be invalid, so it is cleared.
                if (endDate && endDate < value) setEndDate("");
                setError("");
              }}
              required
              min={earliestStart}
            />
            <SelectField
              label="Start time"
              value={startTime}
              options={TIME_SLOTS}
              onChange={setStartTime}
              required
            />
          </div>

          <div>
            <DateField label="End date" value={endDate} onChange={setEndDate} required min={earliestEnd} />
            <p className="mt-1.5 text-[11px] text-slate-400">
              For a single visit, use the same date as the start date.
            </p>
          </div>

          <TextareaField
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Add notes or instructions…"
            rows={3}
          />

          {/* Additional tasks attach to a plan that already exists, so they only appear when editing. */}
          {isEdit && (
            <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Additional tasks
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {drafts.length === 0 ? "None added yet" : `${drafts.length} to add on save`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrafts((current) => [...current, newDraft(startDate)])}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-primary/40 bg-white px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-sky-50"
                >
                  <MdAdd className="text-sm" /> Task
                </button>
              </div>

              {existingTasks.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Existing tasks on this plan ({existingTasks.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {existingTasks.map((task) => (
                      <div
                        key={task._id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                      >
                        <span className="font-medium text-slate-900">{task.name}</span>
                        {task.duration_minutes ? (
                          <span className="text-[11px] text-slate-400">{task.duration_minutes}m</span>
                        ) : null}
                        <span
                          className={`rounded px-1 py-0.5 text-[10px] font-semibold ${
                            task.is_approved
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {task.is_approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drafts.map((draft, index) => (
                <div key={draft.key} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Task {index + 1}</span>
                    <button
                      type="button"
                      aria-label={`Remove task ${index + 1}`}
                      onClick={() => setDrafts((current) => current.filter((item) => item.key !== draft.key))}
                      className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <MdDeleteOutline className="text-base" />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Task name"
                      value={draft.name}
                      onChange={(value) =>
                        setDrafts((current) =>
                          current.map((item) => (item.key === draft.key ? { ...item, name: value } : item)),
                        )
                      }
                      required
                    />
                    <DateField
                      label="Date"
                      value={draft.date}
                      onChange={(value) =>
                        setDrafts((current) =>
                          current.map((item) => (item.key === draft.key ? { ...item, date: value } : item)),
                        )
                      }
                      min={earliestEnd}
                      max={endDate || undefined}
                    />
                  </div>

                  <div className="mt-3">
                    <TextField
                      label="Duration (minutes)"
                      type="number"
                      min={1}
                      value={draft.duration_minutes}
                      onChange={(value) =>
                        setDrafts((current) =>
                          current.map((item) =>
                            item.key === draft.key ? { ...item, duration_minutes: value } : item,
                          ),
                        )
                      }
                    />
                  </div>

                  <div className="mt-3">
                    <CheckboxField
                      label="Photo required"
                      checked={draft.is_photo_required}
                      onChange={(checked) =>
                        editDraft(draft.key, {
                          is_photo_required: checked,
                          photo_requirements: checked
                            ? draft.photo_requirements.length
                              ? draft.photo_requirements
                              : [""]
                            : [],
                        })
                      }
                    />
                  </div>

                  {draft.is_photo_required && (
                    <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Photos to capture
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            editDraft(draft.key, { photo_requirements: [...draft.photo_requirements, ""] })
                          }
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-primary/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-sky-50"
                        >
                          <MdAdd className="text-xs" /> Photo
                        </button>
                      </div>

                      {draft.photo_requirements.map((title, photoIndex) => (
                        <div key={photoIndex} className="flex items-center gap-2">
                          <input
                            value={title}
                            onChange={(event) =>
                              editDraft(draft.key, {
                                photo_requirements: draft.photo_requirements.map((item, position) =>
                                  position === photoIndex ? event.target.value : item,
                                ),
                              })
                            }
                            placeholder={photoIndex === 0 ? "Before cleaning" : "After cleaning"}
                            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            type="button"
                            aria-label={`Remove photo ${photoIndex + 1}`}
                            onClick={() =>
                              editDraft(draft.key, {
                                photo_requirements: draft.photo_requirements.filter(
                                  (_item, position) => position !== photoIndex,
                                ),
                              })
                            }
                            className="shrink-0 cursor-pointer rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <MdDeleteOutline className="text-base" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </FormModal>
  );
}

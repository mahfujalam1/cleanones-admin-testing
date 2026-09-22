"use client";

import { useEffect, useState } from "react";
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import { FormModal } from "@/components/shared/FormModal";
import {
  CheckboxField,
  DateField,
  FieldLabel,
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
  additionalTaskApproved,
  useCreateAdditionalTaskMutation,
  useDeleteAdditionalTaskMutation,
  useUpdateAdditionalTaskMutation,
  type AdditionalTask,
  type PhotoRequirement,
} from "@/redux/api/endpoints/additionalTasks.api";
import { refDoc, refId } from "@/redux/api/types";
import { todayIso } from "@/components/ui/date-picker";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getScreenCopy } from "@/lib/screen-copy";


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
  photo_requirements: PhotoRequirement[];
  date: string;
};

const blankPhoto = (): PhotoRequirement => ({
  title: "",
  description: "",
  reference_image_url: "",
  photo_url: "",
  is_uploaded: false,
});

function isInvalidHttpUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol !== "http:" && url.protocol !== "https:";
  } catch {
    return true;
  }
}

let draftCounter = 0;
const newDraft = (date: string): TaskDraft => ({
  key: `draft-${(draftCounter += 1)}`,
  name: "",
  duration_minutes: "",
  is_photo_required: false,
  photo_requirements: [blankPhoto()],
  date,
});

function namedPhotos(requirements: PhotoRequirement[]) {
  return requirements.filter((requirement) => requirement.title.trim() !== "");
}

function photoProblem(draft: TaskDraft): string | null {
  if (!draft.name.trim() || !draft.is_photo_required) return null;
  const named = namedPhotos(draft.photo_requirements);
  const taskName = draft.name.trim();
  if (draft.photo_requirements.length === 0 || named.length === 0) {
    return `Add at least one photo for "${taskName}", or turn photos off.`;
  }
  if (named.length !== draft.photo_requirements.length) {
    return `Give every required photo for "${taskName}" a name, or remove the empty ones.`;
  }
  const invalidReference = draft.photo_requirements.find((requirement) =>
    isInvalidHttpUrl(requirement.reference_image_url),
  );
  if (invalidReference) {
    return `Enter a valid reference image URL for "${invalidReference.title.trim()}".`;
  }
  return null;
}

export function PlanForm({ plan, onClose, onCreated }: {
  plan?: CleaningPlan;
  onClose: () => void;
  
  onCreated?: (plan: CleaningPlan) => void;
}) {
  const copy = getScreenCopy(getLocale(usePathname()));
  const isEdit = plan !== undefined;

  
  const { data: singlePlan, isLoading: loadingSinglePlan } = useGetCleaningPlanQuery(
    plan?._id ?? "",
    { skip: !isEdit || !plan?._id }
  );

  const [client, setClient] = useState(() => refId(plan?.client));
  const [location, setLocation] = useState(() => refId(plan?.location));
  const [rooms, setRooms] = useState<string[]>(() => (plan?.rooms ?? []).map(refId).filter(Boolean));
  const [title, setTitle] = useState(plan?.title ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [drafts, setDrafts] = useState<TaskDraft[]>([]);
  const [error, setError] = useState("");
  const [savingTasks, setSavingTasks] = useState(false);

  
  useEffect(() => {
    if (!singlePlan) return;
    if (singlePlan.title) setTitle(singlePlan.title);
    if (singlePlan.client) setClient(refId(singlePlan.client));
    if (singlePlan.location) setLocation(refId(singlePlan.location));
    const roomIds = (singlePlan.rooms ?? []).map(refId).filter(Boolean);
    if (roomIds.length > 0) {
      setRooms(roomIds);
    }
    if (singlePlan.description) setDescription(singlePlan.description);
  }, [singlePlan]);

  const taskDateFloor = todayIso();

  const { data: roomPage, isFetching: loadingRooms } = useGetRoomsQuery(
    { locationId: location, limit: 100, sort: "name" },
    { skip: !location },
  );
  const available = roomPage?.result ?? [];

  const [createPlan, { isLoading: creating }] = useCreateCleaningPlanMutation();
  const [updatePlan, { isLoading: updating }] = useUpdateCleaningPlanMutation();
  const [createTask] = useCreateAdditionalTaskMutation();
  const [updateTask] = useUpdateAdditionalTaskMutation();
  const [deleteTask] = useDeleteAdditionalTaskMutation();

  
  const [taskEdits, setTaskEdits] = useState<Record<string, { name: string; duration: string }>>({});
  
  const [busyTaskId, setBusyTaskId] = useState("");

  const editDraft = (key: string, patch: Partial<TaskDraft>) =>
    setDrafts((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const toggleRoom = (id: string) =>
    setRooms((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  
  const existingTasks = (singlePlan?.additional_tasks ?? [])
    .map((task) => refDoc<AdditionalTask>(task))
    .filter(Boolean) as AdditionalTask[];

  
  const taskValue = (task: AdditionalTask) =>
    taskEdits[task._id] ?? {
      name: task.name ?? "",
      duration: task.duration_minutes ? String(task.duration_minutes) : "",
    };

  const taskIsDirty = (task: AdditionalTask) => {
    const edit = taskEdits[task._id];
    if (!edit) return false;
    const saved = { name: task.name ?? "", duration: task.duration_minutes ? String(task.duration_minutes) : "" };
    return edit.name.trim() !== saved.name || edit.duration.trim() !== saved.duration;
  };

  const saveExistingTask = async (task: AdditionalTask) => {
    const edit = taskValue(task);
    if (!edit.name.trim()) {
      setError("A task needs a name.");
      return;
    }
    if (!edit.duration.trim() || Number(edit.duration) <= 0) {
      setError(`Set a duration for "${edit.name.trim()}".`);
      return;
    }
    setBusyTaskId(task._id);
    setError("");
    try {
      await updateTask({
        id: task._id,
        name: edit.name.trim(),
        duration_minutes: Number(edit.duration),
      }).unwrap();
      
      setTaskEdits((current) => {
        const next = { ...current };
        delete next[task._id];
        return next;
      });
    } catch (cause) {
      setError(apiError(cause));
    } finally {
      setBusyTaskId("");
    }
  };

  const removeExistingTask = async (task: AdditionalTask) => {
    setBusyTaskId(task._id);
    setError("");
    try {
      await deleteTask(task._id).unwrap();
      setTaskEdits((current) => {
        const next = { ...current };
        delete next[task._id];
        return next;
      });
    } catch (cause) {
      setError(apiError(cause));
    } finally {
      setBusyTaskId("");
    }
  };

  const submit = async () => {
    if (!client || !location) {
      setError(copy.pickCompanyAndLocation);
      return;
    }
    if (rooms.length === 0) {
      setError("Pick at least one room.");
      return;
    }
    if (!title.trim()) {
      setError("Plan name is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    const missingDuration = drafts.find(
      (draft) => draft.name.trim() && !draft.duration_minutes.trim(),
    );
    if (missingDuration) {
      setError(`Set a duration for "${missingDuration.name.trim()}".`);
      return;
    }

    const noPhotos = drafts.find(photoProblem);
    if (noPhotos) {
      setError(photoProblem(noPhotos) ?? "");
      return;
    }

    const body = {
      title: title.trim(),
      client,
      location,
      rooms,
      description: description.trim(),
    };

    try {
      if (isEdit) {
        await updatePlan({ id: plan._id, body }).unwrap();

        
        const named = drafts.filter((draft) => draft.name.trim());
        if (named.length) {
          setSavingTasks(true);
          for (const draft of named) {
            await createTask({
              cleaning_plan_id: plan._id,
              name: draft.name.trim(),
              duration_minutes: Number(draft.duration_minutes),
              is_photo_required: draft.is_photo_required,
              photo_requirements: draft.is_photo_required
                ? namedPhotos(draft.photo_requirements).map((requirement) => ({
                    title: requirement.title.trim(),
                    photo_url: "",
                    is_uploaded: false,
                    description: requirement.description?.trim() ?? "",
                    reference_image_url: requirement.reference_image_url?.trim() ?? "",
                  }))
                : [],
              date_time: toTimestamp(draft.date || todayIso(), "08:00"),
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
      title={isEdit ? copy.editCleaningPlan : copy.addCleaningPlan}
      subtitle={isEdit ? (singlePlan?.title || plan?.title || copy.addCleaningPlan) : copy.addCleaningPlan}
      submitLabel={isEdit ? copy.saveChanges : copy.createPlan}
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
              showCompanyName
              label={copy.companyName}
              placeholder={copy.selectCompany}
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
              label={copy.location}
              selectPlaceholder={copy.selectLocation}
              noClientPlaceholder={copy.selectCompanyFirst}
              noLocationsPlaceholder={copy.companyHasNoLocations}
              onChange={(value) => {
                setLocation(value);
                setRooms([]);
                setError("");
              }}
              required
            />
          </div>

          <div>
            <FieldLabel htmlFor="plan-rooms" label={copy.rooms} required />
            <div
              id="plan-rooms"
              className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1"
            >
              {!location ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">{copy.pickLocationFirst}</p>
              ) : loadingRooms && available.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">{copy.loadingRooms}</p>
              ) : available.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">{copy.noRoomsAtLocation}</p>
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
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {(() => {
                        const count = roomTaskCount(room);
                        return count === null ? room.room_type : `${count} ${count === 1 ? copy.task : copy.tasks}`;
                      })()}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <TextField label={copy.planName} value={title} onChange={setTitle} required />

          <TextareaField
            label={copy.description}
            value={description}
            onChange={setDescription}
            placeholder={copy.planNotesPlaceholder}
            rows={3}
            required
          />

          
          {isEdit && (
            <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {copy.additionalTasks}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {drafts.length === 0 ? "None added yet" : `${drafts.length} to add on save`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrafts((current) => [...current, newDraft(taskDateFloor)])}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-primary/40 bg-white px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-sky-50"
                >
                  <MdAdd className="text-sm" /> {copy.task}
                </button>
              </div>

              {existingTasks.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Existing tasks on this plan ({existingTasks.length})
                  </p>
                  <div className="space-y-2">
                    {existingTasks.map((task) => {
                      const value = taskValue(task);
                      const dirty = taskIsDirty(task);
                      const busy = busyTaskId === task._id;
                      return (
                        <div
                          key={task._id}
                          className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2"
                        >
                          <input
                            type="text"
                            value={value.name}
                            disabled={busy}
                            onChange={(event) =>
                              setTaskEdits((current) => ({
                                ...current,
                                [task._id]: { ...value, name: event.target.value },
                              }))
                            }
                            placeholder={copy.taskName}
                            className="h-8 min-w-40 flex-1 rounded border border-slate-200 bg-white px-2 text-xs text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-slate-100"
                          />
                          <div className="relative w-24 shrink-0">
                            <input
                              type="number"
                              min={1}
                              value={value.duration}
                              disabled={busy}
                              onChange={(event) =>
                                setTaskEdits((current) => ({
                                  ...current,
                                  [task._id]: { ...value, duration: event.target.value },
                                }))
                              }
                              placeholder="0"
                              className="h-8 w-full rounded border border-slate-200 bg-white pl-2 pr-7 text-xs text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-slate-100"
                            />
                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                              m
                            </span>
                          </div>
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              additionalTaskApproved(task)
                                ? "bg-emerald-50 text-emerald-700"
                                : task.status === "Rejected"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {task.status ?? "Pending"}
                          </span>
                          {dirty && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void saveExistingTask(task)}
                              className="shrink-0 cursor-pointer rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#0284c7] disabled:opacity-50"
                            >
                              {busy ? "Saving…" : "Save"}
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy}
                            aria-label={`Delete ${task.name}`}
                            onClick={() => void removeExistingTask(task)}
                            className="shrink-0 cursor-pointer rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <MdDeleteOutline className="text-base" />
                          </button>
                        </div>
                      );
                    })}
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
                      label={copy.taskName}
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
                      min={taskDateFloor}
                    />
                  </div>

                  <div className="mt-3">
                    <TextField
                      label={copy.durationMin}
                      type="number"
                      min={1}
                      required
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
                      label={copy.photoRequired}
                      checked={draft.is_photo_required}
                      onChange={(checked) => {
                        editDraft(draft.key, {
                          is_photo_required: checked,
                          photo_requirements: draft.photo_requirements.length
                            ? draft.photo_requirements
                            : [blankPhoto()],
                        });
                        setError("");
                      }}
                    />
                  </div>

                  {draft.is_photo_required && (
                    <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{copy.photoInstructions}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {copy.photoInstructionsHint}
                        </p>
                      </div>

                      {draft.photo_requirements.map((req, photoIndex) => (
                        <div key={photoIndex} className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {copy.requiredPhoto} {photoIndex + 1}
                            </span>
                            <button
                              type="button"
                              disabled={draft.photo_requirements.length === 1}
                              onClick={() => {
                                editDraft(draft.key, {
                                  photo_requirements: draft.photo_requirements.filter(
                                    (_item, position) => position !== photoIndex,
                                  ),
                                });
                                setError("");
                              }}
                              className="cursor-pointer text-xs font-semibold text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {copy.remove}
                            </button>
                          </div>

                          <div className="grid gap-3">
                            <label className="block">
                              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                                {copy.title} <span className="text-red-500">*</span>
                              </span>
                              <input
                                type="text"
                                value={req.title}
                                onChange={(event) => {
                                  editDraft(draft.key, {
                                    photo_requirements: draft.photo_requirements.map((item, position) =>
                                      position === photoIndex ? { ...item, title: event.target.value } : item,
                                    ),
                                  });
                                  setError("");
                                }}
                                placeholder={copy.photoTitlePlaceholder}
                                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
                              />
                            </label>

                            <label className="block">
                              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                                {copy.workerInstruction}
                              </span>
                              <textarea
                                value={req.description ?? ""}
                                onChange={(event) => {
                                  editDraft(draft.key, {
                                    photo_requirements: draft.photo_requirements.map((item, position) =>
                                      position === photoIndex
                                        ? { ...item, description: event.target.value }
                                        : item,
                                    ),
                                  });
                                  setError("");
                                }}
                                rows={2}
                                placeholder={copy.workerInstructionPlaceholder}
                                className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-5 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
                              />
                            </label>

                            <label className="block">
                              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                                {copy.exampleImageUrl}
                              </span>
                              <div className="flex items-center gap-3">
                                {req.reference_image_url?.trim() ? (
                                  <img
                                    src={req.reference_image_url}
                                    alt=""
                                    className="h-10 w-10 shrink-0 rounded-md border border-slate-200 bg-slate-50 object-cover"
                                  />
                                ) : null}
                                <input
                                  type="url"
                                  value={req.reference_image_url ?? ""}
                                  onChange={(event) => {
                                    editDraft(draft.key, {
                                      photo_requirements: draft.photo_requirements.map((item, position) =>
                                        position === photoIndex
                                          ? { ...item, reference_image_url: event.target.value }
                                          : item,
                                      ),
                                    });
                                    setError("");
                                  }}
                                  placeholder="https://..."
                                  className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          editDraft(draft.key, {
                            photo_requirements: [...draft.photo_requirements, blankPhoto()],
                          });
                          setError("");
                        }}
                        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-primary/30 bg-white px-3 text-xs font-semibold text-primary transition-colors hover:bg-sky-50"
                      >
                        {copy.addAnotherPhoto}
                      </button>
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

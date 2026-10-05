"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MdAdd,
  MdChevronRight,
  MdDeleteOutline,
  MdExpandMore,
  MdOutlineWarningAmber,
} from "react-icons/md";
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
import { roomTaskCount, useGetRoomsQuery, type Room } from "@/redux/api/endpoints/rooms.api";
import { useGetTasksQuery } from "@/redux/api/endpoints/tasks.api";
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
import { getScreenCopy, type ScreenCopy } from "@/lib/screen-copy";


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

function RoomTaskPicker({
  roomId,
  roomName,
  roomType,
  selectedTaskIds,
  onToggleTask,
  onSelectAll,
  onDeselectAll,
  onTasksLoaded,
  copy,
}: {
  roomId: string;
  roomName: string;
  roomType?: string;
  selectedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  onSelectAll: (taskIds: string[]) => void;
  onDeselectAll: (taskIds: string[]) => void;
  onTasksLoaded: (roomId: string, taskIds: string[]) => void;
  copy: ScreenCopy;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const { data, isFetching } = useGetTasksQuery({ roomId, limit: 100 });
  const tasks = useMemo(
    () => (data?.result ?? []).filter((task) => task.is_active),
    [data?.result],
  );

  const taskIds = useMemo(() => tasks.map((t) => t._id), [tasks]);

  useEffect(() => {
    if (!isFetching && data?.result) {
      onTasksLoaded(roomId, taskIds);
    }
  }, [roomId, taskIds, isFetching, data?.result, onTasksLoaded]);

  const selectedInThisRoom = useMemo(
    () => taskIds.filter((id) => selectedTaskIds.includes(id)),
    [taskIds, selectedTaskIds],
  );

  const allSelected = taskIds.length > 0 && selectedInThisRoom.length === taskIds.length;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
        >
          {isOpen ? (
            <MdExpandMore className="h-4 w-4 shrink-0 text-slate-500" />
          ) : (
            <MdChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
          )}
          <span className="truncate text-xs font-semibold text-slate-800">{roomName}</span>
          {roomType && (
            <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] capitalize text-slate-600">
              {roomType}
            </span>
          )}
          <span className="text-[11px] text-slate-400">
            ({selectedInThisRoom.length}/{taskIds.length})
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => (allSelected ? onDeselectAll(taskIds) : onSelectAll(taskIds))}
            disabled={taskIds.length === 0}
            className="cursor-pointer text-[11px] font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-slate-300"
          >
            {allSelected ? copy.deselectAllTasks : copy.selectAllTasks}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-2">
          {isFetching ? (
            <p className="px-2 py-3 text-center text-xs text-slate-400">{copy.loadingRoomTasks}</p>
          ) : tasks.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-slate-400">{copy.noActiveTasksInRoom}</p>
          ) : (
            <div className="space-y-1">
              {tasks.map((task) => {
                const isChecked = selectedTaskIds.includes(task._id);
                return (
                  <label
                    key={task._id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleTask(task._id)}
                      className="h-3.5 w-3.5 rounded border-slate-300 accent-primary"
                    />
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-700">
                      {task.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-2 text-[10px] text-slate-400">
                      {task.frequency_type && (
                        <span className="capitalize">{task.frequency_type}</span>
                      )}
                      {typeof task.duration_minutes === "number" && task.duration_minutes > 0 && (
                        <span>{task.duration_minutes}m</span>
                      )}
                      {task.is_photo_required && (
                        <span className="font-medium text-amber-600">📷</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PlanForm({
  plan,
  duplicateFrom,
  onClose,
  onCreated,
}: {
  plan?: CleaningPlan;
  duplicateFrom?: CleaningPlan;
  onClose: () => void;
  onCreated?: (plan: CleaningPlan) => void;
}) {
  const copy = getScreenCopy(getLocale(usePathname()));
  const isEdit = plan !== undefined;
  const isDuplicate = duplicateFrom !== undefined;

  const { data: singlePlan, isLoading: loadingSinglePlan } = useGetCleaningPlanQuery(
    plan?._id ?? "",
    { skip: !isEdit || !plan?._id }
  );

  const [client, setClient] = useState(() => refId(plan?.client) || refId(duplicateFrom?.client));
  const [location, setLocation] = useState(() => refId(plan?.location) || refId(duplicateFrom?.location));
  const [rooms, setRooms] = useState<string[]>(() =>
    isEdit ? (plan?.rooms ?? []).map(refId).filter(Boolean) : []
  );
  const [selectedTasks, setSelectedTasks] = useState<string[]>(() =>
    isEdit ? (plan?.tasks ?? []) : []
  );
  const [roomTasksMap, setRoomTasksMap] = useState<Record<string, string[]>>({});
  const initializedRoomsRef = useRef<Set<string>>(
    new Set(isEdit && plan?.rooms ? plan.rooms.map(refId).filter(Boolean) : []),
  );
  const [title, setTitle] = useState(() =>
    plan?.title ?? (duplicateFrom?.title ? `${duplicateFrom.title} (Copy)` : "")
  );
  const [description, setDescription] = useState(() => plan?.description ?? duplicateFrom?.description ?? "");
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
      roomIds.forEach((id) => initializedRoomsRef.current.add(id));
    }
    if (Array.isArray(singlePlan.tasks)) {
      setSelectedTasks(singlePlan.tasks);
    } else if (singlePlan.rooms) {
      const fallbackTasks = (singlePlan.rooms as any[]).flatMap((r) =>
        (r?.tasks ?? []).map((t: any) => t?._id).filter(Boolean),
      );
      if (fallbackTasks.length > 0) {
        setSelectedTasks(fallbackTasks);
      }
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

  const handleRoomTasksLoaded = useCallback((roomId: string, activeTaskIds: string[]) => {
    setRoomTasksMap((prev) => ({ ...prev, [roomId]: activeTaskIds }));
    if (!initializedRoomsRef.current.has(roomId)) {
      initializedRoomsRef.current.add(roomId);
      setSelectedTasks((prev) => {
        const next = new Set(prev);
        activeTaskIds.forEach((id) => next.add(id));
        return Array.from(next);
      });
    }
  }, []);

  const toggleRoom = (id: string) => {
    setRooms((current) => {
      const isRemoving = current.includes(id);
      if (isRemoving) {
        const tasksInThisRoom = roomTasksMap[id] ?? [];
        if (tasksInThisRoom.length > 0) {
          setSelectedTasks((prev) => prev.filter((taskId) => !tasksInThisRoom.includes(taskId)));
        }
        initializedRoomsRef.current.delete(id);
        return current.filter((item) => item !== id);
      } else {
        return [...current, id];
      }
    });
  };

  const handleToggleTask = useCallback((taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    );
  }, []);

  const handleSelectAllRoomTasks = useCallback((taskIds: string[]) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      taskIds.forEach((id) => next.add(id));
      return Array.from(next);
    });
  }, []);

  const handleDeselectAllRoomTasks = useCallback((taskIds: string[]) => {
    const toRemove = new Set(taskIds);
    setSelectedTasks((prev) => prev.filter((id) => !toRemove.has(id)));
  }, []);

  const getRoomDoc = (roomId: string) => {
    const fromAvailable = available.find((r) => r._id === roomId);
    if (fromAvailable) return fromAvailable;
    const fromSingle = (singlePlan?.rooms ?? [])
      .map((r) => refDoc<Room>(r))
      .find((r) => r?._id === roomId);
    if (fromSingle) return fromSingle;
    return { _id: roomId, name: "Room", room_type: "" };
  };

  
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
      tasks: selectedTasks,
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
      title={isEdit ? copy.editCleaningPlan : isDuplicate ? copy.duplicateCleaningPlan : copy.addCleaningPlan}
      subtitle={isEdit ? (singlePlan?.title || plan?.title || copy.addCleaningPlan) : isDuplicate ? (duplicateFrom?.title || copy.duplicatePlan) : copy.addCleaningPlan}
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
                setSelectedTasks([]);
                initializedRoomsRef.current.clear();
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
                setSelectedTasks([]);
                initializedRoomsRef.current.clear();
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

          {rooms.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="plan-selected-tasks" label={copy.tasksForSelectedRooms} required={false} />
                <span className="text-[11px] font-medium text-slate-500">
                  {selectedTasks.length} {selectedTasks.length === 1 ? copy.task : copy.tasks} selected
                </span>
              </div>

              {selectedTasks.length === 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                  <MdOutlineWarningAmber className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>{copy.noTasksSelectedWarning}</span>
                </div>
              )}

              <div id="plan-selected-tasks" className="max-h-60 space-y-2 overflow-y-auto pr-0.5">
                {rooms.map((roomId) => {
                  const roomDoc = getRoomDoc(roomId);
                  return (
                    <RoomTaskPicker
                      key={roomId}
                      roomId={roomId}
                      roomName={roomDoc?.name || "Room"}
                      roomType={roomDoc?.room_type}
                      selectedTaskIds={selectedTasks}
                      onToggleTask={handleToggleTask}
                      onSelectAll={handleSelectAllRoomTasks}
                      onDeselectAll={handleDeselectAllRoomTasks}
                      onTasksLoaded={handleRoomTasksLoaded}
                      copy={copy}
                    />
                  );
                })}
              </div>
            </div>
          )}

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

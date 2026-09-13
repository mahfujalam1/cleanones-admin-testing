"use client";

import { useState } from "react";
import { FormModal } from "@/components/shared/FormModal";
import { CheckboxField, SelectField, TextField } from "@/components/shared/Field";
import { ClientLocationPicker, ClientPicker, RoomPicker } from "@/components/shared/Pickers";
import { apiError } from "@/redux/api/apiError";
import {
  FREQUENCY_TYPES,
  WEEK_DAYS,
  scheduleProblem,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  type FrequencyType,
  type Task,
  type WeekDay,
  type PhotoRequirement,
} from "@/redux/api/endpoints/tasks.api";
import { DayPicker, DAY_LABELS, MONTH_DAYS, toggleDay } from "./DayPicker";

export function TaskForm({
  roomId,
  task,
  onClose,
}: {
  /**
   * Fixes the owning room, for when the form opens from inside one. Left out — adding from the
   * cleaning plans page — the client, location and room are chosen in the form itself.
   */
  roomId?: string;
  task?: Task;
  onClose: () => void;
}) {
  const isEdit = task !== undefined;
  const picksRoom = !isEdit && !roomId;
  const [chosenClient, setChosenClient] = useState("");
  const [chosenLocation, setChosenLocation] = useState("");
  const [chosenRoom, setChosenRoom] = useState("");
  const targetRoom = roomId || chosenRoom;
  const [name, setName] = useState(task?.name ?? "");
  const [frequency, setFrequency] = useState<FrequencyType>(task?.frequency_type ?? "daily");
  const [daysOfWeek, setDaysOfWeek] = useState<WeekDay[]>(task?.days_of_week ?? []);
  const [daysOfMonth, setDaysOfMonth] = useState<number[]>(task?.days_of_month ?? []);
  const [duration, setDuration] = useState(task?.duration_minutes?.toString() ?? "");
  const [photoRequired, setPhotoRequired] = useState(task?.is_photo_required ?? false);
  const [photoRequirements, setPhotoRequirements] = useState<PhotoRequirement[]>(
    task?.photo_requirements?.length
      ? task.photo_requirements
      : [{ title: "", photo_url: null, is_uploaded: false }]
  );
  const [isActive, setIsActive] = useState(task?.is_active ?? true);
  const [error, setError] = useState("");

  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();

  const submit = async () => {
    const body = {
      name: name.trim(),
      frequency_type: frequency,
      days_of_week: daysOfWeek,
      days_of_month: daysOfMonth,
      // The API rejects a duration of zero, so a blank box means "not specified", not zero.
      duration_minutes: duration.trim() ? Number(duration) : undefined,
      is_photo_required: photoRequired,
      photo_requirements: photoRequired
        ? photoRequirements.filter((r) => r.title.trim() !== "").map((r) => ({ ...r, title: r.title.trim() }))
        : undefined,
      is_active: isActive,
    };

    if (!duration.trim()) {
      setError("Duration is required.");
      return;
    }

    if (!targetRoom) {
      setError("Pick a client, location and room first.");
      return;
    }

    const problem = scheduleProblem(body);
    if (problem) {
      setError(problem);
      return;
    }

    try {
      if (isEdit) {
        await updateTask({ id: task._id, roomId: targetRoom, body }).unwrap();
      } else {
        await createTask({ ...body, room: targetRoom }).unwrap();
      }
      onClose();
    } catch (cause) {
      setError(apiError(cause));
    }
  };

  return (
    <FormModal
      title={isEdit ? "Edit task" : "Add task"}
      subtitle={isEdit ? task.name : undefined}
      submitLabel={isEdit ? "Save changes" : "Add task"}
      saving={creating || updating}
      error={error}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      {picksRoom && (
        <div className="grid gap-4 sm:grid-cols-3">
          <ClientPicker
            value={chosenClient}
            onChange={(value) => {
              setChosenClient(value);
              // Each level below belongs to the old parent, so it cannot carry over.
              setChosenLocation("");
              setChosenRoom("");
              setError("");
            }}
            required
          />
          <ClientLocationPicker
            clientId={chosenClient}
            value={chosenLocation}
            onChange={(value) => {
              setChosenLocation(value);
              setChosenRoom("");
              setError("");
            }}
            required
          />
          <RoomPicker
            locationId={chosenLocation}
            value={chosenRoom}
            onChange={(value) => {
              setChosenRoom(value);
              setError("");
            }}
          />
        </div>
      )}

      <TextField label="Task Name" value={name} onChange={setName} required />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Frequency Type"
          value={frequency}
          options={FREQUENCY_TYPES.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))}
          onChange={(value) => {
            setFrequency(value);
            setError("");
          }}
          required
        />
        <TextField
          label="Duration (min)"
          type="number"
          value={duration}
          onChange={setDuration}
          min={1}
          required
        />
      </div>

      {frequency === "weekly" && (
        <DayPicker
          label="Week days"
          options={WEEK_DAYS}
          selected={daysOfWeek}
          labelFor={(day) => DAY_LABELS[day]}
          onToggle={(day) => {
            setDaysOfWeek((current) => toggleDay(current, day));
            setError("");
          }}
        />
      )}

      {frequency === "monthly" && (
        <DayPicker
          label="Dates of the month"
          options={MONTH_DAYS}
          selected={daysOfMonth}
          labelFor={String}
          onToggle={(day) => {
            setDaysOfMonth((current) => toggleDay(current, day));
            setError("");
          }}
        />
      )}

      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div>
          <CheckboxField label="Photo required" checked={photoRequired} onChange={setPhotoRequired} />
          
          {photoRequired && (
            <div className="ml-3 mt-3 space-y-3 border-l-2 border-primary pl-4">
              {photoRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={req.title}
                      onChange={(e) => {
                        const newReqs = [...photoRequirements];
                        newReqs[index] = { ...newReqs[index], title: e.target.value };
                        setPhotoRequirements(newReqs);
                      }}
                      placeholder="Required photo name"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoRequirements(photoRequirements.filter((_, i) => i !== index));
                    }}
                    className="text-sm font-semibold text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPhotoRequirements([...photoRequirements, { title: "", photo_url: null, is_uploaded: false }]);
                }}
                className="text-sm font-semibold text-primary hover:text-sky-600"
              >
                + Add Photo
              </button>
            </div>
          )}
        </div>
        <CheckboxField label="Active" checked={isActive} onChange={setIsActive} />
      </div>
    </FormModal>
  );
}

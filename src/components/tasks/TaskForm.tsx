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
      ? task.photo_requirements.map((requirement) => ({
          ...requirement,
          description: requirement.description ?? "",
          reference_image_url: requirement.reference_image_url ?? "",
        }))
      : [{ title: "", description: "", reference_image_url: "", photo_url: "", is_uploaded: false }]
  );
  const [requiredPhotoCount, setRequiredPhotoCount] = useState(
    task?.required_photo_count?.toString() ?? ""
  );
  const [error, setError] = useState("");

  /** Only titled rows are sent, so they are what the required count is measured against. */
  const namedPhotoRequirements = photoRequirements.filter((r) => r.title.trim() !== "");

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
        ? namedPhotoRequirements.map((r) => ({
            title: r.title.trim(),
            photo_url: "",
            is_uploaded: false,
            description: r.description?.trim() ?? "",
            reference_image_url: r.reference_image_url?.trim() ?? "",
          }))
        : undefined,
      required_photo_count: photoRequired && requiredPhotoCount.trim()
        ? Number(requiredPhotoCount)
        : undefined,
    };

    if (!duration.trim()) {
      setError("Duration is required.");
      return;
    }

    if (!targetRoom) {
      setError("Pick a client, location and room first.");
      return;
    }

    if (photoRequired) {
      if (photoRequirements.length === 0 || namedPhotoRequirements.length === 0) {
        setError("Add at least one photo, or turn off \"Photo required\".");
        return;
      }
      // Every slot the worker will be shown needs a name, so an unnamed row is not just
      // dropped silently from the payload.
      if (namedPhotoRequirements.length !== photoRequirements.length) {
        setError("Give every required photo a name, or remove the empty ones.");
        return;
      }
      const invalidReference = photoRequirements.find((requirement) => {
        const value = requirement.reference_image_url?.trim();
        if (!value) return false;
        try {
          const url = new URL(value);
          return url.protocol !== "http:" && url.protocol !== "https:";
        } catch {
          return true;
        }
      });
      if (invalidReference) {
        setError(`Enter a valid reference image URL for "${invalidReference.title.trim()}".`);
        return;
      }
      const count = Number(requiredPhotoCount);
      if (!requiredPhotoCount.trim() || !Number.isInteger(count) || count < 1) {
        setError("Enter the daily random photo count.");
        return;
      }
      // The worker cannot be asked for more photos than there are slots to fill.
      if (count > namedPhotoRequirements.length) {
        setError(
          `Daily random photo count cannot be more than the ${namedPhotoRequirements.length} photo${
            namedPhotoRequirements.length === 1 ? "" : "s"
          } added.`
        );
        return;
      }
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

      <div className="border-t border-slate-100 pt-4">
        <div>
          <CheckboxField
            label="Photo required"
            checked={photoRequired}
            onChange={(checked) => {
              setPhotoRequired(checked);
              setError("");
            }}
          />

          {photoRequired && (
            <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-end">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Photo instructions</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add each photo the worker may be asked to capture. Description and example image are optional.
                  </p>
                </div>
                <div>
                  <TextField
                    label="Daily random count"
                    type="number"
                    value={requiredPhotoCount}
                    onChange={(value) => {
                      setRequiredPhotoCount(value);
                      setError("");
                    }}
                    min={1}
                    max={Math.max(namedPhotoRequirements.length, 1)}
                    placeholder={`1 - ${Math.max(namedPhotoRequirements.length, 1)}`}
                    required
                  />
                </div>
              </div>

              {photoRequirements.map((req, index) => (
                <div key={index} className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Required photo {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoRequirements(photoRequirements.filter((_, i) => i !== index));
                        setError("");
                      }}
                      className="text-xs font-semibold text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={photoRequirements.length === 1}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={req.title}
                        onChange={(event) => {
                          const newReqs = [...photoRequirements];
                          newReqs[index] = { ...newReqs[index], title: event.target.value };
                          setPhotoRequirements(newReqs);
                          setError("");
                        }}
                        placeholder="e.g. Bathroom after cleaning"
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Worker instruction
                      </label>
                      <textarea
                        value={req.description ?? ""}
                        onChange={(event) => {
                          const newReqs = [...photoRequirements];
                          newReqs[index] = { ...newReqs[index], description: event.target.value };
                          setPhotoRequirements(newReqs);
                          setError("");
                        }}
                        rows={2}
                        placeholder="Explain what must be visible and where to take the photo from."
                        className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-5 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Example image URL
                      </label>
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
                            const newReqs = [...photoRequirements];
                            newReqs[index] = { ...newReqs[index], reference_image_url: event.target.value };
                            setPhotoRequirements(newReqs);
                            setError("");
                          }}
                          placeholder="https://..."
                          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPhotoRequirements([
                    ...photoRequirements,
                    {
                      title: "",
                      description: "",
                      reference_image_url: "",
                      photo_url: "",
                      is_uploaded: false,
                    },
                  ]);
                  setError("");
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-primary/30 bg-white px-3 text-xs font-semibold text-primary transition-colors hover:bg-sky-50"
              >
                + Add another photo
              </button>
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
}

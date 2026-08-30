"use client";

import React, { useEffect, useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import { TbDoor } from "react-icons/tb";
import { Select } from "@/components/ui/select";
import { createRoom, getRoomLocations, type RoomTaskInput } from "@/services/actions/rooms";

interface Props { onClose: () => void; onAdd: () => void }
const newTask = (): RoomTaskInput => ({ name: "", frequency_type: "every_visit", is_photo_req: false, photo: [] });

export function AddRoomModal({ onClose, onAdd }: Props) {
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("suite");
  const [cleanType, setCleanType] = useState("standard");
  const [duration, setDuration] = useState("90");
  const [monthlyFrequency, setMonthlyFrequency] = useState("4");
  const [tasks, setTasks] = useState<RoomTaskInput[]>([]);
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

  const updateTask = (index: number, update: Partial<RoomTaskInput>) => setTasks((items) => items.map((item, i) => (i === index ? { ...item, ...update } : item)));
  const requirePhoto = (index: number, checked: boolean) => updateTask(index, { is_photo_req: checked, photo: checked ? [{ name: "" }] : [] });
  const updatePhoto = (taskIndex: number, photoIndex: number, name: string) =>
    updateTask(taskIndex, { photo: tasks[taskIndex].photo.map((photo, i) => (i === photoIndex ? { name } : photo)) });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!locationId) return setError("Please select a location.");
    if (tasks.some((task) => !task.name.trim() || (task.is_photo_req && (!task.photo.length || task.photo.some((photo) => !photo.name.trim())))))
      return setError("Complete every task and required photo name.");
    setSaving(true);
    setError("");
    const result = await createRoom(locationId, {
      clean_type: cleanType,
      duration: Number(duration),
      monthly_cleaning_frequency: Number(monthlyFrequency),
      room_name: roomName,
      room_type: roomType,
      tasks,
    });
    setSaving(false);
    if (!result.success) return setError(result.error);
    onAdd();
  };

  return (
    <div onClick={onClose} className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
      >
        <header className="flex items-center gap-3 border-b border-gray-100 px-6 py-5 shrink-0 bg-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <TbDoor className="text-xl" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900">Add New Room</h2>
            <p className="text-xs text-slate-400">Enter the room details and task requirements</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer">
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-6 py-5 flex-1">
          {/* Location + Room Name in Same Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location *">
              <Select
                value={locationId}
                onValueChange={setLocationId}
                options={locations.map((item) => ({ value: item.id, label: item.name }))}
                placeholder="Select location"
                required
              />
            </Field>
            <Field label="Room Name *">
              <input
                required
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Ware House"
                className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </Field>
          </div>

          {/* Room Type + Clean Type */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Room Type *">
              <Select
                value={roomType}
                onValueChange={setRoomType}
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "deluxe", label: "Deluxe" },
                  { value: "suite", label: "Suite" },
                  { value: "junior_suite", label: "Junior Suite" },
                ]}
                placeholder="Select room type"
                required
              />
            </Field>
            <Field label="Clean Type *">
              <Select
                value={cleanType}
                onValueChange={setCleanType}
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "deep_clean", label: "Deep Clean" },
                  { value: "premium", label: "Premium" },
                  { value: "custom", label: "Custom" },
                ]}
                placeholder="Select clean type"
                required
              />
            </Field>
          </div>

          {/* Duration + Frequency */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Duration (minutes) *">
              <input
                type="number"
                min={1}
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </Field>
            <Field label="Monthly Cleaning Frequency *">
              <input
                type="number"
                min={1}
                required
                value={monthlyFrequency}
                onChange={(e) => setMonthlyFrequency(e.target.value)}
                className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </Field>
          </div>

          {/* Tasks Section */}
          <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Tasks</h3>
                <p className="text-xs text-slate-400">Add task and photo requirements</p>
              </div>
              <button
                type="button"
                onClick={() => setTasks((items) => [...items, newTask()])}
                className="flex h-9 items-center justify-center gap-1 rounded bg-[#0ea5e9] px-3 text-xs font-semibold text-white shadow-sm hover:bg-[#0284c7] transition-colors cursor-pointer"
              >
                + Add Task
              </button>
            </div>

            {!tasks.length && <p className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-md bg-white">No tasks added.</p>}

            {tasks.map((task, taskIndex) => (
              <div key={taskIndex} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <b className="text-xs font-bold text-slate-700">Task {taskIndex + 1}</b>
                  <button
                    type="button"
                    onClick={() => setTasks((items) => items.filter((_, i) => i !== taskIndex))}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Task Name *">
                    <input
                      required
                      value={task.name}
                      onChange={(e) => updateTask(taskIndex, { name: e.target.value })}
                      placeholder="e.g. Floor Vacuuming"
                      className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </Field>
                  <Field label="Frequency Type *">
                    <Select
                      value={task.frequency_type}
                      onValueChange={(val) => updateTask(taskIndex, { frequency_type: val })}
                      options={[
                        { value: "every_visit", label: "Every visit" },
                        { value: "daily", label: "Daily" },
                        { value: "weekly", label: "Weekly" },
                        { value: "monthly", label: "Monthly" },
                      ]}
                    />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.is_photo_req}
                    onChange={(e) => requirePhoto(taskIndex, e.target.checked)}
                    className="rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                  />
                  Photo required
                </label>
                {task.is_photo_req && (
                  <div className="space-y-2 pl-4 border-l-2 border-sky-100">
                    {task.photo.map((photo, photoIndex) => (
                      <div key={photoIndex} className="flex items-center gap-2">
                        <input
                          required
                          value={photo.name}
                          onChange={(e) => updatePhoto(taskIndex, photoIndex, e.target.value)}
                          placeholder="Required photo name"
                          className="h-9 w-full rounded border border-gray-300 bg-white px-3 text-xs text-gray-800 outline-none focus:border-sky-500"
                        />
                        <button
                          type="button"
                          onClick={() => updateTask(taskIndex, { photo: task.photo.filter((_, i) => i !== photoIndex) })}
                          className="text-xs text-red-500 hover:text-red-700 shrink-0 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateTask(taskIndex, { photo: [...task.photo, { name: "" }] })}
                      className="text-xs font-semibold text-[#0ea5e9] hover:underline cursor-pointer"
                    >
                      + Add Photo
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>

          {error && <p className="text-xs font-medium text-red-600 rounded bg-red-50 p-2.5 border border-red-200">{error}</p>}
        </div>

        <footer className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 shrink-0">
          <button type="button" onClick={onClose} className="rounded border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            disabled={saving}
            className="flex h-9 items-center justify-center gap-1.5 rounded bg-[#0ea5e9] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#0284c7] transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? "Adding..." : "+ Add Room"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

"use client";

import {
  MdDeleteOutline,
  MdModeEditOutline,
  MdOutlineChecklist,
  MdOutlineMeetingRoom,
  MdOutlinePlace,
  MdOutlineSchedule,
} from "react-icons/md";
import type { Task, WeekDay } from "@/redux/api/endpoints/tasks.api";
import { refDoc } from "@/redux/api/types";
import type { Room } from "@/redux/api/endpoints/rooms.api";
import type { Location } from "@/redux/api/endpoints/locations.api";

const DAY_LABELS: Record<WeekDay, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

const capitalise = (value: string) => value[0].toUpperCase() + value.slice(1);

/** Reads as "Daily", "Weekly · Mon, Fri" or "Monthly · 1, 15". */
function scheduleLabel(task: Task): string {
  const frequency = capitalise(task.frequency_type);
  if (task.frequency_type === "weekly" && task.days_of_week?.length) {
    return `${frequency} · ${task.days_of_week.map((day) => DAY_LABELS[day]).join(", ")}`;
  }
  if (task.frequency_type === "monthly" && task.days_of_month?.length) {
    return `${frequency} · ${[...task.days_of_month].sort((a, b) => a - b).join(", ")}`;
  }
  return frequency;
}

function MetaLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
      <span className="shrink-0 text-sm text-slate-400">{icon}</span>
      <span className="truncate">{children}</span>
    </p>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="min-w-0 px-2 py-2.5 text-center">
      <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

export default function TaskCard({
  task,
  onSelect,
  onEdit,
  onDelete,
}: {
  task: Task;
  onSelect?: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const room = refDoc<Room>(task.room);
  const location = room ? refDoc<Location>(room.location) : null;

  return (
    <div className="group relative h-full">
      <article
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={() => onSelect?.(task)}
        onKeyDown={(event) => {
          if (onSelect && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onSelect(task);
          }
        }}
        className={`flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/70 transition-all duration-200 ${
          onSelect
            ? "cursor-pointer hover:-translate-y-0.5 hover:ring-slate-300 hover:shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]"
            : ""
        }`}
      >
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg text-slate-400 ring-1 ring-slate-200/70 transition-colors group-hover:bg-sky-50 group-hover:text-primary group-hover:ring-sky-100"
            >
              <MdOutlineChecklist />
            </span>

            <div className="min-w-0 flex-1 pr-12">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-primary">
                  {task.name}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    task.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {task.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                <MetaLine icon={<MdOutlinePlace />}>{location?.name}</MetaLine>
                <MetaLine icon={<MdOutlineMeetingRoom />}>{room?.name}</MetaLine>
                <MetaLine icon={<MdOutlineSchedule />}>{scheduleLabel(task)}</MetaLine>
              </div>
            </div>
          </div>
        </div>

        {/* A fixed stat strip keeps every card the same height and puts the numbers a manager
            scans for on one predictable line. */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/60">
          <Stat
            value={typeof task.duration_minutes === "number" ? `${task.duration_minutes}m` : "—"}
            label="Duration"
          />
          <Stat value={task.is_photo_required ? "Yes" : "No"} label="Photo" />
          <Stat value={capitalise(task.frequency_type)} label="Frequency" />
        </div>
      </article>

      <div className="absolute right-2.5 top-2.5 flex items-center gap-0.5 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
        <button
          type="button"
          aria-label={`Edit ${task.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(task);
          }}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-slate-400 ring-1 ring-slate-200 backdrop-blur transition-colors hover:text-slate-800"
        >
          <MdModeEditOutline className="text-[15px]" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${task.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(task);
          }}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-slate-400 ring-1 ring-slate-200 backdrop-blur transition-colors hover:text-red-600"
        >
          <MdDeleteOutline className="text-[15px]" />
        </button>
      </div>
    </div>
  );
}

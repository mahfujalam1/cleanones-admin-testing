"use client";

import type { PlanRosterShift } from "@/redux/api/rosterApi";
import { formatClock, isUnstaffed, roundedShiftEnd, statusLabel } from "./planShift";

export function PlanShiftCell({
  shift,
  compact,
  onView,
}: {
  shift?: PlanRosterShift;
  compact?: boolean;
  onView: (shift: PlanRosterShift) => void;
}) {
  if (!shift) {
    return <span className="block text-center text-[10px] text-slate-300">—</span>;
  }

  const unstaffed = isUnstaffed(shift);
  const status = (shift.status ?? "").toLowerCase();
  const workers = (shift.assigned_workers ?? []).map((worker) => worker.name).filter(Boolean);
  const displayEnd = roundedShiftEnd(shift);
  const timeRange =
    shift.start_time && displayEnd
      ? `${formatClock(shift.start_time)} – ${formatClock(displayEnd)}`
      : "";

  const tone =
    status === "completed"
      ? "border-[#06a7df] bg-[#e7f8fc] text-[#0369a1]"
      : status === "cancelled"
        ? "border-slate-200 bg-slate-50 text-slate-500"
        : status === "in_progress"
          ? "border-[#0ea5e9] bg-[#e0f2fe] text-[#0369a1]"
          : unstaffed
            ? "border-dashed border-[#0ea5e9] bg-[#e0f2fe]/70 text-[#0369a1]"
            : "border-[#0ea5e9] bg-[#e0f2fe] text-[#0369a1]";

  return (
    <button
      type="button"
      onClick={() => onView(shift)}
      className={`flex w-full flex-col justify-center rounded border px-2.5 py-2 text-left transition-colors hover:brightness-[0.98] ${tone} ${compact ? "min-h-11" : "min-h-[4.5rem]"}`}
    >
      {unstaffed ? (
        <>
          <b className="text-[10px] font-bold uppercase tracking-wide">Unassigned</b>
          {!compact && (
            <p className="mt-1 text-[10px] opacity-80">
              {shift.rooms ? `${shift.rooms.total} room${shift.rooms.total === 1 ? "" : "s"}` : ""}
              {shift.tasks ? `${shift.rooms ? " · " : ""}${shift.tasks.total} task${shift.tasks.total === 1 ? "" : "s"}` : ""}
              {shift.duration_minutes ? ` · ${shift.duration_minutes}m` : ""}
            </p>
          )}
        </>
      ) : (
        <>
          <span className="text-[10px] font-bold uppercase tracking-wide">{statusLabel(shift.status)}</span>
          {timeRange && <span className="mt-0.5 text-[10px] font-semibold tabular-nums">{timeRange}</span>}
          {workers.length > 0 && (
            <span className={`mt-0.5 truncate text-[10px] opacity-80 ${compact ? "hidden" : ""}`}>
              {workers.join(", ")}
            </span>
          )}
        </>
      )}
    </button>
  );
}

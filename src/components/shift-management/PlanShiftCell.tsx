"use client";

import type { PlanRosterShift } from "@/redux/api/rosterApi";
import { formatClock, isUnstaffed, shiftEndFromDuration, statusLabel } from "./planShift";

export function PlanShiftCell({
  shift,
  compact,
  planTitle,
  locationName,
  selected = false,
  onToggleSelect,
  onView,
  workerNotAssignedLabel,
}: {
  shift?: PlanRosterShift;
  compact?: boolean;
  planTitle?: string;
  locationName?: string;
  selected?: boolean;
  onToggleSelect?: () => void;
  onView: (shift: PlanRosterShift) => void;
  workerNotAssignedLabel?: string;
}) {
  if (!shift) {
    return <span className="block w-full text-center text-[10px] text-slate-300">—</span>;
  }

  const unstaffed = isUnstaffed(shift);
  const status = (shift.status ?? "").toLowerCase();
  const workers = (shift.assigned_workers ?? []).map((worker) => worker.name).filter(Boolean);
  const displayEnd = shiftEndFromDuration(shift);
  const durationHours = shift.duration_minutes ? `${(shift.duration_minutes / 60).toFixed(1)}h` : "";
  const timeRange =
    shift.start_time && displayEnd
      ? `${formatClock(shift.start_time)} – ${formatClock(displayEnd)}`
      : "";

  const tone =
    status === "completed"
      ? "border-emerald-200 bg-emerald-50/60"
      : status === "cancelled"
        ? "border-slate-200 bg-slate-50"
        : status === "in_progress"
          ? "border-sky-200 bg-sky-50/70"
          : unstaffed && selected
            ? "border-amber-300 bg-amber-50/80 ring-1 ring-amber-200"
            : unstaffed
              ? "border-slate-200 bg-white"
              : "border-sky-200 bg-white";

  return (
    <div className="relative w-full">
      {unstaffed && onToggleSelect ? (
        <label
          className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 cursor-pointer items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Select unassigned shift on ${shift.date}`}
            className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 accent-primary"
          />
        </label>
      ) : null}
      <button
        type="button"
        onClick={() => onView(shift)}
        className={`flex w-full flex-col rounded-lg border px-2.5 py-2 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:border-sky-300 hover:shadow-sm ${tone} ${compact ? "min-h-12" : "min-h-[5.25rem]"} ${unstaffed && onToggleSelect ? "pl-7" : ""}`}
      >
        {unstaffed ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                <i className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                <span className="truncate">{workerNotAssignedLabel ?? "Worker Not Assigned"}</span>
              </span>
              {durationHours && <span className="shrink-0 text-[9px] text-slate-400">{durationHours}</span>}
            </div>
            <b className="mt-2 truncate text-[11px] font-semibold text-slate-800">{planTitle}</b>
            {!compact && (
              <p className="mt-1 flex items-center gap-1 truncate text-[9px] text-slate-400">
                <i className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                {locationName || "No location"}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                status === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : status === "in_progress"
                    ? "bg-sky-100 text-sky-700"
                    : "bg-slate-100 text-slate-600"
              }`}>
                {statusLabel(shift.status)}
              </span>
              {durationHours && <span className="text-[9px] text-slate-400">{durationHours}</span>}
            </div>
            <b className="mt-2 truncate text-[11px] font-semibold text-slate-800">{planTitle}</b>
            {timeRange && <span className="mt-0.5 truncate text-[9px] tabular-nums text-slate-400">{timeRange}</span>}
            {workers.length > 0 && (
              <span className={`mt-0.5 truncate text-[9px] text-sky-700 ${compact ? "hidden" : ""}`}>
                {workers.join(", ")}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}

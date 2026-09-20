"use client";

import type { PlanRosterShift } from "@/redux/api/rosterApi";
import { formatClock, isUnstaffed, shiftEndFromDuration, statusLabel } from "./planShift";

export function PlanShiftCell({
  shift,
  compact,
  planTitle,
  locationName,
  onView,
}: {
  shift?: PlanRosterShift;
  compact?: boolean;
  planTitle?: string;
  locationName?: string;
  onView: (shift: PlanRosterShift) => void;
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
          : unstaffed
            ? "border-slate-200 bg-white"
            : "border-sky-200 bg-white";

  return (
    <button
      type="button"
      onClick={() => onView(shift)}
      className={`flex w-full flex-col rounded-lg border px-2.5 py-2 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:border-sky-300 hover:shadow-sm ${tone} ${compact ? "min-h-12" : "min-h-[5.25rem]"}`}
    >
      {unstaffed ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
              <i className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              <span className="truncate">Worker Not Assigned</span>
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
  );
}

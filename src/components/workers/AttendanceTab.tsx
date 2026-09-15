"use client";

import React, { useState } from "react";
import {
  TbClock,
  TbCircleCheck,
  TbAlertTriangle,
  TbCalendar,
  TbRefresh,
  TbUserCheck,
  TbCheck,
} from "react-icons/tb";
import { useGetShiftAttendanceSummaryQuery } from "@/redux/api/shiftsApi";
import { useGetLiveWorkerDetailsQuery } from "@/redux/api/shiftMonitoringApi";
import { workerName, type Worker } from "@/redux/api/endpoints/workers.api";

interface AttendanceTabProps {
  worker: Worker;
}

type Period = "today" | "weekly" | "monthly";

function formatDateRange(start?: string, end?: string): string {
  if (!start) return "";
  try {
    const s = new Date(start);
    const e = end ? new Date(end) : s;
    if (isNaN(s.getTime())) return "";

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: s.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    };

    if (s.toDateString() === e.toDateString()) {
      return s.toLocaleDateString(undefined, { ...options, weekday: "short" });
    }

    return `${s.toLocaleDateString(undefined, options)} – ${e.toLocaleDateString(undefined, options)}`;
  } catch {
    return "";
  }
}

export function AttendanceTab({ worker }: AttendanceTabProps) {
  const [period, setPeriod] = useState<Period>("today");

  // 1. Fetch Attendance Summary across all workers for the selected period
  const {
    data: summary,
    isLoading: loadingSummary,
    isFetching: fetchingSummary,
    refetch: refetchSummary,
  } = useGetShiftAttendanceSummaryQuery({ period });

  // 2. Fetch specific live details / attendance for this worker if available
  const {
    data: workerDetails,
    isLoading: loadingWorkerDetails,
    refetch: refetchWorkerDetails,
  } = useGetLiveWorkerDetailsQuery(
    { id: worker._id, period },
    { skip: !worker._id }
  );

  const handleRefresh = () => {
    void refetchSummary();
    void refetchWorkerDetails();
  };

  const totalHours = summary?.total_hours ?? 0;
  const completedShifts = summary?.completed_shifts ?? 0;
  const punctuality = summary?.punctuality_percentage ?? 0;
  const onTimeCount = summary?.on_time_check_ins ?? 0;
  const lateCount = summary?.late_check_ins ?? 0;
  const totalCheckIns = onTimeCount + lateCount;

  const dateRange = formatDateRange(summary?.start_date, summary?.end_date);

  return (
    <div className="space-y-4">
      {/* Period Selection & Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
            <TbCalendar className="text-lg" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900">Attendance Summary</h3>
              {dateRange && (
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                  {dateRange}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Aggregated shift attendance metrics across workers for the chosen period.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Period Segmented Control */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-2xs">
            {(["today", "weekly", "monthly"] as const).map((p) => {
              const active = period === p;
              const label = p.charAt(0).toUpperCase() + p.slice(1);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                    active
                      ? "bg-sky-500 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh Attendance Summary"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <TbRefresh className={`text-sm ${fetchingSummary ? "animate-spin text-sky-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {loadingSummary ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100/80" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Total Hours */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-50 text-sky-600">
                <TbClock className="text-sm" />
              </span>
              <p className="text-[11px] font-semibold">Total Hours</p>
            </div>
            <p className="mt-2 text-lg font-bold text-slate-900 leading-none">
              {totalHours} <span className="text-xs font-normal text-slate-500">hrs</span>
            </p>
            <p className="mt-1 text-[10px] text-slate-400">Total hours worked</p>
          </div>

          {/* Completed Shifts */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <TbCircleCheck className="text-sm" />
              </span>
              <p className="text-[11px] font-semibold">Completed</p>
            </div>
            <p className="mt-2 text-lg font-bold text-emerald-700 leading-none">
              {completedShifts} <span className="text-xs font-normal text-slate-500">shifts</span>
            </p>
            <p className="mt-1 text-[10px] text-slate-400">Finished in period</p>
          </div>

          {/* Punctuality Rate */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-50 text-violet-600">
                <TbUserCheck className="text-sm" />
              </span>
              <p className="text-[11px] font-semibold">Punctuality</p>
            </div>
            <p className="mt-2 text-lg font-bold text-violet-700 leading-none">
              {punctuality}%
            </p>
            <p className="mt-1 text-[10px] text-slate-400">On-time check-in rate</p>
          </div>

          {/* Check-ins Breakdown */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-500">Check-ins</p>
              <span className="text-[10px] font-bold text-slate-400">{totalCheckIns} total</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                <TbCheck className="text-xs" /> {onTimeCount} on time
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
                <TbAlertTriangle className="text-xs" /> {lateCount} late
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Punctuality breakdown</p>
          </div>
        </div>
      )}

      {/* Punctuality Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Punctuality Share</span>
          <span className="font-bold text-sky-600">{punctuality}% on-time</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${punctuality}%` }}
            title={`On-time: ${punctuality}%`}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${100 - punctuality}%` }}
            title={`Late: ${100 - punctuality}%`}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            On-time check-ins ({onTimeCount})
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Late check-ins ({lateCount})
          </span>
        </div>
      </div>

      {/* Worker Individual Shift & Attendance Record (if available) */}
      {workerDetails && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <TbUserCheck className="text-base" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {workerName(worker)}&apos;s Shift Record
                </h4>
                <p className="text-[10px] text-slate-500">
                  {workerDetails.shift_label || "Active Schedule"}
                </p>
              </div>
            </div>
            {workerDetails.current_status && (
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200">
                {workerDetails.current_status}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50/70 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-400">Check In</span>
              <p className="font-bold text-slate-800 mt-0.5">
                {workerDetails.shift_details?.check_in || "--:--"}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50/70 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-400">Check Out</span>
              <p className="font-bold text-slate-800 mt-0.5">
                {workerDetails.shift_details?.check_out || "--:--"}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50/70 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-400">Worked</span>
              <p className="font-bold text-slate-800 mt-0.5">
                {workerDetails.hours_worked || `${workerDetails.hours_worked_numeric || 0}h`}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50/70 p-2 border border-slate-100">
              <span className="text-[10px] text-slate-400">Shifts</span>
              <p className="font-bold text-slate-800 mt-0.5">
                {workerDetails.shifts_count || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

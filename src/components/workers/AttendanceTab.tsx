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
import { apiError } from "@/redux/api/apiError";
import { workerName, type Worker } from "@/redux/api/endpoints/workers.api";
import { SlidingTabs } from "@/components/ui/sliding-tabs";

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

  
  const {
    data: summary,
    isLoading: loadingSummary,
    isFetching: fetchingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetShiftAttendanceSummaryQuery(
    { workerId: worker._id, period },
    { skip: !worker._id }
  );

  const handleRefresh = () => {
    void refetchSummary();
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
              {workerName(worker)}&apos;s shift attendance metrics for the chosen period.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          
          <SlidingTabs
            compact
            value={period}
            options={(["today", "weekly", "monthly"] as const).map((value) => ({
              value,
              label: value.charAt(0).toUpperCase() + value.slice(1),
            }))}
            onValueChange={(next) => setPeriod(next as Period)}
          />

          
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

      {summaryError && !loadingSummary && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
          {apiError(summaryError, "Could not load this worker's attendance summary.")}
        </div>
      )}

      
      {loadingSummary ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100/80" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          
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

          
          <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[11px] font-semibold text-slate-500">Check-ins</p>
              <span className="shrink-0 text-[10px] font-bold text-slate-400">{totalCheckIns} total</span>
            </div>
            
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                <TbCheck className="text-[11px]" /> {onTimeCount} on time
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
                <TbAlertTriangle className="text-[11px]" /> {lateCount} late
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Punctuality breakdown</p>
          </div>
        </div>
      )}

      
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Punctuality Share</span>
          <span className="font-bold text-sky-600">{punctuality}% on-time</span>
        </div>
        <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          {totalCheckIns > 0 && (
            <>
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
            </>
          )}
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
        {totalCheckIns === 0 && (
          <p className="mt-2 text-[10px] text-slate-400">No check-ins recorded in this period.</p>
        )}
      </div>
    </div>
  );
}

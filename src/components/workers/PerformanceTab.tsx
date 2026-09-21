"use client";

import React, { useState } from "react";
import {
  TbCalendarStats,
  TbCircleCheck,
  TbClock,
  TbCalendar,
  TbAlertTriangle,
  TbUserX,
  TbChevronLeft,
  TbChevronRight,
  TbHourglass,
} from "react-icons/tb";
import { useGetWorkerPerformanceQuery } from "@/redux/api/shiftsApi";
import type { Worker } from "@/redux/api/endpoints/workers.api";

interface PerformanceTabProps {
  worker: Worker;
}

export function PerformanceTab({ worker }: PerformanceTabProps) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const { data: perf, isLoading, isFetching } = useGetWorkerPerformanceQuery({
    workerId: worker._id,
    month: selectedMonth,
    year: selectedYear,
  });

  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const monthDate = new Date(selectedYear, selectedMonth - 1, 1);
  const monthName = monthDate.toLocaleString("en-US", { month: "long" });

  const totalShifts = perf?.total_shift_on_this_month ?? 0;
  const completed = perf?.total_completed_on_this_month ?? 0;
  const inProgress = perf?.total_in_progress ?? 0;
  const upcoming = perf?.total_upcoming_on_this_month ?? 0;
  const late = perf?.total_late_on_this_month ?? 0;
  const absent = perf?.total_absent_on_this_month ?? 0;
  const hoursWorked = perf?.total_work_on_this_month ?? 0;

  const completionRate =
    totalShifts > 0 ? Math.min(Math.round((completed / totalShifts) * 100), 100) : 0;
  const onTimeRate =
    completed > 0 ? Math.max(Math.round(((completed - late) / completed) * 100), 0) : 0;

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
            <TbCalendar className="text-base" />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900">
              {monthName} {selectedYear}
            </h3>
            <p className="text-[10px] text-slate-500">Monthly Performance Overview</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 cursor-pointer"
            title="Previous Month"
          >
            <TbChevronLeft className="text-sm" />
          </button>
          <span className="text-xs font-semibold text-slate-700 px-1">
            {monthName.slice(0, 3)} {selectedYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 cursor-pointer"
            title="Next Month"
          >
            <TbChevronRight className="text-sm" />
          </button>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 py-2">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <TbCalendarStats className="text-base" />
                </span>
                <span className="text-xl font-bold text-slate-900">{totalShifts}</span>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">Total Shifts</p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <TbCircleCheck className="text-base" />
                </span>
                <span className="text-xl font-bold text-emerald-700">{completed}</span>
              </div>
              <p className="mt-2 text-xs font-medium text-emerald-700">Completed</p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <TbHourglass className="text-base" />
                </span>
                <span className="text-xl font-bold text-amber-700">{inProgress}</span>
              </div>
              <p className="mt-2 text-xs font-medium text-amber-700">In Progress</p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <TbCalendar className="text-base" />
                </span>
                <span className="text-xl font-bold text-blue-700">{upcoming}</span>
              </div>
              <p className="mt-2 text-xs font-medium text-blue-700">Upcoming</p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <TbClock className="text-base" />
                </span>
                <span className="text-xl font-bold text-indigo-700">{hoursWorked}h</span>
              </div>
              <p className="mt-2 text-xs font-medium text-indigo-700">Hours Worked</p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                  <TbAlertTriangle className="text-base" />
                </span>
                <span className="text-xl font-bold text-orange-700">{late}</span>
              </div>
              <p className="mt-2 text-xs font-medium text-orange-700">Late Check-ins</p>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                  <TbUserX className="text-base" />
                </span>
                <span className="text-xl font-bold text-rose-700">{absent}</span>
              </div>
              <p className="mt-2 text-xs font-medium text-rose-700">Absent Shifts</p>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <TbCircleCheck className="text-base" />
                </span>
                <span className="text-xl font-bold text-sky-700">{completionRate}%</span>
              </div>
              <p className="mt-2 text-xs font-medium text-sky-700">Completion Rate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Shift Completion</span>
                <span className="text-xs font-bold text-slate-900">{completionRate}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {completed} out of {totalShifts} shift(s) completed this month.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Punctuality (On-Time)</span>
                <span className="text-xs font-bold text-slate-900">{onTimeRate}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${onTimeRate}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                {late === 0
                  ? "Zero late check-ins recorded this month."
                  : `${late} shift(s) had late check-in.`}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { MdSearch, MdClose, MdFilterList } from 'react-icons/md';
import { TbClock, TbCalendarStats, TbAlertTriangle, TbCircleCheck } from 'react-icons/tb';
import { WorkerInfo } from './types';
import { type AttendanceWorker, type Period } from '@/services/actions/shiftMonitoring';
import { useGetShiftAttendanceSummaryQuery } from '@/redux/api/shiftsApi';
import { useGetWorkerListQuery, workerName } from '@/redux/api/endpoints/workers.api';
import { BackendPagination } from '@/components/shared/BackendPagination';
import { Select } from '@/components/ui/select';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

export type TimeRange = 'Today' | 'Weekly' | 'Monthly';
type SortOption = 'hours' | 'shifts' | 'late' | 'name';

function formatDateRange(start?: string, end?: string): string {
  if (!start) return '';
  try {
    const s = new Date(start);
    const e = end ? new Date(end) : s;
    if (isNaN(s.getTime())) return '';

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: s.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    };

    if (s.toDateString() === e.toDateString()) {
      return s.toLocaleDateString(undefined, { ...options, weekday: 'short' });
    }

    return `${s.toLocaleDateString(undefined, options)} – ${e.toLocaleDateString(undefined, options)}`;
  } catch {
    return '';
  }
}

interface Props {
  onWorkerSelect: (worker: WorkerInfo) => void;
  selectedWorkerId: string | number | null;
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
}

const mapAttendanceWorker = (item: AttendanceWorker): WorkerInfo => ({
  id: item.worker_id,
  initials: item.worker_name ? item.worker_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'W',
  name: item.worker_name,
  role: item.worker_type?.toLowerCase() === 'freelancer' ? 'Freelancer' : 'Employee',
  shiftId: '',
  location: '',
  checkIn: '',
  status: item.late_days > 0 ? 'Late' : 'On Time',
  color: 'bg-sky-500',
  statusColor: 'text-sky-500',
  profilePicture: item.profile_picture || '/avatar-placeholder.svg',
  hoursWorked: item.hours_worked_numeric || 0,
  totalShifts: item.total_shifts || 0,
  lateDays: item.late_days || 0,
  avgDuration: '0h',
});

export function AttendanceTimeTracking({ onWorkerSelect, selectedWorkerId, timeRange, onTimeRangeChange }: Props) {
  const [roleFilter, setRoleFilter] = useState<'All' | 'Employee' | 'Freelancer'>('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('hours');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const period = timeRange.toLowerCase() as Period;

  // 1. Period totals for the KPI banner — /shift/attendance-summary.
  const {
    data: attendanceSummary,
    isLoading: loadingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useGetShiftAttendanceSummaryQuery({ period: period as 'today' | 'weekly' | 'monthly' });

  // 2. The rows come from the worker directory. Per-worker hours, shifts and late counts are
  // read from /shift/attendance-summary/:workerId when a worker is opened, so no aggregated
  // attendance-tracking call is made from this page.
  const {
    data: workerListRes,
    isLoading: loadingWorkerList,
    refetch: refetchWorkers,
  } = useGetWorkerListQuery({
    page: 1,
    limit: 100,
    worker_type: roleFilter === 'All' ? undefined : roleFilter,
  });
  const loading = loadingWorkerList || loadingSummary;

  const directoryWorkers = workerListRes?.result;

  const rawWorkers = useMemo<AttendanceWorker[]>(() => {
    if (!directoryWorkers?.length) return [];
    // The directory carries no attendance figures, so the per-worker counters start at zero
    // and are filled in by the detail view.
    return directoryWorkers.map((w) => ({
      worker_id: String(w._id),
      worker_name: workerName(w),
      profile_picture: w.profile_photo || '',
      worker_type: w.worker_type || 'Employee',
      hours_worked: '0h',
      hours_worked_numeric: 0,
      total_shifts: 0,
      late_days: 0,
    }));
  }, [directoryWorkers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, sortBy, timeRange]);

  const workers: WorkerInfo[] = useMemo(() => {
    let list = rawWorkers.map(mapAttendanceWorker);

    if (roleFilter !== 'All') {
      list = list.filter((w) => w.role.toLowerCase() === roleFilter.toLowerCase());
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((w) => w.name.toLowerCase().includes(q) || String(w.id).toLowerCase().includes(q));
    }

    return list.sort((a, b) => {
      if (sortBy === 'hours') return b.hoursWorked - a.hoursWorked;
      if (sortBy === 'shifts') return b.totalShifts - a.totalShifts;
      if (sortBy === 'late') return b.lateDays - a.lateDays;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [rawWorkers, roleFilter, search, sortBy]);

  // Aggregate Metrics for Top KPI Banner
  const summaryStats = useMemo(() => {
    const totalWorkers = workers.length;
    const employeeCount = workers.filter((w) => w.role === 'Employee').length;
    const freelancerCount = workers.filter((w) => w.role === 'Freelancer').length;
    const totalHours = workers.reduce((sum, w) => sum + (w.hoursWorked || 0), 0);
    const totalShifts = workers.reduce((sum, w) => sum + (w.totalShifts || 0), 0);
    const totalLate = workers.reduce((sum, w) => sum + (w.lateDays || 0), 0);
    const punctualWorkers = workers.filter((w) => w.lateDays === 0).length;
    const punctualityRate = totalWorkers > 0 ? Math.round((punctualWorkers / totalWorkers) * 100) : 100;
    const maxHours = Math.max(1, ...workers.map((w) => w.hoursWorked));

    return {
      totalWorkers,
      employeeCount,
      freelancerCount,
      totalHours: totalHours.toFixed(1),
      totalShifts,
      totalLate,
      punctualityRate,
      maxHours,
    };
  }, [workers]);

  const sortOptions = [
    { value: 'hours', label: 'Hours Worked (High to Low)' },
    { value: 'shifts', label: 'Total Shifts (High to Low)' },
    { value: 'late', label: 'Late Days (High to Low)' },
    { value: 'name', label: 'Worker Name (A-Z)' },
  ];

  const dateRange = formatDateRange(attendanceSummary?.start_date, attendanceSummary?.end_date);

  const pagedWorkers = useMemo(() => {
    return workers.slice((page - 1) * LIMIT, page * LIMIT);
  }, [workers, page]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-600">
            <TbClock className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Worker Attendance Summary</h1>
              {dateRange && (
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-200">
                  {dateRange}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Overview of employee hours, completed shifts, and attendance punctuality.
            </p>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center rounded-xl border border-slate-200/80 bg-slate-100/90 p-1 text-xs font-semibold shadow-2xs">
          {(['Today', 'Weekly', 'Monthly'] as const).map((tr) => (
            <button
              key={tr}
              onClick={() => onTimeRangeChange(tr)}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 transition-all ${
                timeRange === tr
                  ? 'bg-primary text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total Hours */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100/80">
            <TbClock className="text-lg" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Hours</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-lg font-bold text-amber-700">
                {attendanceSummary?.total_hours !== undefined ? `${attendanceSummary.total_hours}h` : `${summaryStats.totalHours}h`}
              </p>
              <span className="truncate text-[11px] text-slate-400 font-normal">Logged time</span>
            </div>
          </div>
        </div>

        {/* Card 2: Completed Shifts */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80">
            <TbCalendarStats className="text-lg" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">Completed Shifts</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-lg font-bold text-blue-700">
                {attendanceSummary?.completed_shifts !== undefined ? attendanceSummary.completed_shifts : summaryStats.totalShifts}
              </p>
              <span className="truncate text-[11px] text-slate-400 font-normal">All shifts</span>
            </div>
          </div>
        </div>

        {/* Card 3: Punctuality */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
              (attendanceSummary?.late_check_ins ?? summaryStats.totalLate) > 0
                ? 'bg-amber-50 text-amber-600 border-amber-100/80'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100/80'
            }`}
          >
            {(attendanceSummary?.late_check_ins ?? summaryStats.totalLate) > 0 ? (
              <TbAlertTriangle className="text-lg" />
            ) : (
              <TbCircleCheck className="text-lg" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">Punctuality</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p
                className={`text-lg font-bold ${
                  (attendanceSummary?.late_check_ins ?? summaryStats.totalLate) > 0
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {attendanceSummary?.punctuality_percentage !== undefined
                  ? `${attendanceSummary.punctuality_percentage}%`
                  : `${summaryStats.punctualityRate}%`}
              </p>
              <span className="truncate text-[11px] text-slate-400 font-normal">
                ({attendanceSummary?.late_check_ins ?? summaryStats.totalLate} late)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
            <input
              type="text"
              placeholder="Search by worker name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/50 pl-10 pr-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <MdClose />
              </button>
            )}
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center rounded-xl border border-slate-200/80 bg-slate-100/90 p-1 text-xs font-semibold">
            {(['All', 'Employee', 'Freelancer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 transition-all ${
                  roleFilter === r
                    ? 'bg-white text-primary shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1 shrink-0">
            <MdFilterList className="text-base text-slate-400" /> Sort:
          </span>
          <div className="w-60">
            <Select
              value={sortBy}
              onValueChange={(val) => setSortBy(val as SortOption)}
              options={sortOptions}
              className="h-10 text-xs rounded-xl border-slate-200/80 bg-slate-50/50 hover:bg-white focus:bg-white font-medium"
            />
          </div>
        </div>
      </div>

      {/* Sync / Error Notice */}
      {summaryError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2.5 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <TbAlertTriangle className="text-base text-amber-600 shrink-0" />
            <span>Could not load the attendance totals for this period. The worker list below is still shown.</span>
          </div>
          <button
            onClick={() => {
              void refetchSummary();
              void refetchWorkers();
            }}
            className="cursor-pointer rounded-lg border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100/50 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Employee / Worker</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Hours Worked</th>
                <th className="px-6 py-3.5">Total Shifts</th>
                <th className="px-6 py-3.5">Punctuality & Late</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <TableSkeleton rows={7} columns={5} />
                  </td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <TbClock className="text-2xl" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No attendance records found</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {search || roleFilter !== 'All'
                        ? 'Try adjusting your search terms or filters.'
                        : 'No workers recorded for this time window.'}
                    </p>
                    {(search || roleFilter !== 'All') && (
                      <button
                        onClick={() => {
                          setSearch('');
                          setRoleFilter('All');
                        }}
                        className="mt-3 cursor-pointer rounded-lg bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-100 transition-colors"
                      >
                        Reset filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                pagedWorkers.map((worker) => {
                  const hourProgress = Math.min(100, Math.round((worker.hoursWorked / summaryStats.maxHours) * 100));
                  const isSelected = selectedWorkerId === worker.id;

                  return (
                    <tr
                      key={worker.id}
                      onClick={() => onWorkerSelect(worker)}
                      className={`group cursor-pointer transition-colors hover:bg-sky-50/40 ${
                        isSelected ? 'bg-sky-50/70' : ''
                      }`}
                    >
                      {/* Worker Info */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={worker.profilePicture || '/avatar-placeholder.svg'}
                            alt={worker.name}
                            className="h-9 w-9 rounded-full border border-slate-200 object-cover group-hover:border-primary/50 transition-colors"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm">
                              {worker.name}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400">ID: #{worker.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            worker.role === 'Employee'
                              ? 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200'
                              : 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200'
                          }`}
                        >
                          {worker.role}
                        </span>
                      </td>

                      {/* Hours Worked with Progress Indicator */}
                      <td className="px-6 py-3.5">
                        <div className="w-36">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{worker.hoursWorked}h</span>
                            <span className="text-[10px] text-slate-400 capitalize">{timeRange.toLowerCase()}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-sky-500 transition-all duration-300"
                              style={{ width: `${Math.max(6, hourProgress)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Total Shifts */}
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          <TbCalendarStats className="text-slate-500 text-sm" />
                          {worker.totalShifts} shift{worker.totalShifts === 1 ? '' : 's'}
                        </span>
                      </td>

                      {/* Late Days & Punctuality */}
                      <td className="px-6 py-3.5">
                        {worker.lateDays > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                            <TbAlertTriangle className="text-xs" />
                            {worker.lateDays} Late Day{worker.lateDays > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                            <TbCircleCheck className="text-xs" />
                            Punctual (0 Late)
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {workers.length > LIMIT && (
          <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/30">
            <BackendPagination
              page={page}
              limit={LIMIT}
              total={workers.length}
              onPageChange={setPage}
              itemLabel="workers"
            />
          </div>
        )}
      </div>
    </div>
  );
}

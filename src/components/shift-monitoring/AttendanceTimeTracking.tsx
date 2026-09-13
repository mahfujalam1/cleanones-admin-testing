"use client";

import React, { useState, useMemo } from 'react';
import { MdSearch, MdClose, MdFilterList } from 'react-icons/md';
import { TbClock, TbCalendarStats, TbAlertTriangle, TbChartBar, TbCheck } from 'react-icons/tb';
import { WorkerInfo } from './types';
import { type AttendanceWorker, type Period } from '@/services/actions/shiftMonitoring';
import { useGetAttendanceTrackingQuery } from '@/redux/api/shiftMonitoringApi';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

export type TimeRange = 'Today' | 'Weekly' | 'Monthly';
type SortOption = 'hours' | 'shifts' | 'late' | 'name';

interface Props {
  onWorkerSelect: (worker: WorkerInfo) => void;
  selectedWorkerId: string | number | null;
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
}

const mapAttendanceWorker = (item: AttendanceWorker): WorkerInfo => ({
  id: item.worker_id,
  initials: '',
  name: item.worker_name,
  role: item.worker_type.toLowerCase() === 'freelancer' ? 'Freelancer' : 'Employee',
  shiftId: '',
  location: '',
  checkIn: '',
  status: item.late_days > 0 ? 'Late' : 'On Time',
  color: 'bg-sky-500',
  statusColor: 'text-sky-500',
  hoursWorked: item.hours_worked_numeric,
  totalShifts: item.total_shifts,
  lateDays: item.late_days,
  avgDuration: '0h',
});

export function AttendanceTimeTracking({ onWorkerSelect, selectedWorkerId, timeRange, onTimeRangeChange }: Props) {
  const [roleFilter, setRoleFilter] = useState<'All' | 'Employee' | 'Freelancer'>('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('hours');

  const period = timeRange.toLowerCase() as Period;
  const { data: attRes, isLoading: loading, error } = useGetAttendanceTrackingQuery({
    period,
    workerType: roleFilter === 'All' ? undefined : roleFilter.toLowerCase(),
    search: search.trim() || undefined,
  });

  const rawWorkers = useMemo(() => attRes?.workers ?? [], [attRes?.workers]);
  const workers: WorkerInfo[] = useMemo(() => {
    const list = rawWorkers.map(mapAttendanceWorker);
    return list.sort((a, b) => {
      if (sortBy === 'hours') return b.hoursWorked - a.hoursWorked;
      if (sortBy === 'shifts') return b.totalShifts - a.totalShifts;
      if (sortBy === 'late') return b.lateDays - a.lateDays;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [rawWorkers, sortBy]);

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

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
            <TbClock className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-base font-medium text-slate-900 tracking-tight">Worker Attendance & Time Tracking</h1>
            <p className="text-xs text-slate-500">
              Overview of employee hours, completed shifts, and attendance punctuality.
            </p>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          {(['Today', 'Weekly', 'Monthly'] as const).map((tr) => (
            <button
              key={tr}
              onClick={() => onTimeRangeChange(tr)}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                timeRange === tr
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <TbUsersIcon className="text-xl" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Tracked</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-medium text-slate-900">{summaryStats.totalWorkers}</p>
              <span className="text-[10px] text-slate-400 font-normal">
                ({summaryStats.employeeCount} emp, {summaryStats.freelancerCount} free)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <TbClock className="text-xl" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-400">Total Hours</p>
            <p className="text-xl font-medium text-slate-900">{summaryStats.totalHours}h</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <TbCalendarStats className="text-xl" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-400">Completed Shifts</p>
            <p className="text-xl font-medium text-slate-900">{summaryStats.totalShifts}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              summaryStats.totalLate > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {summaryStats.totalLate > 0 ? <TbAlertTriangle className="text-xl" /> : <TbCheck className="text-xl" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-400">Punctuality</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-xl font-medium ${summaryStats.totalLate > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {summaryStats.punctualityRate}%
              </p>
              <span className="text-[10px] text-slate-400 font-normal">({summaryStats.totalLate} late)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
            <input
              type="text"
              placeholder="Search by worker name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <MdClose />
              </button>
            )}
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center rounded-lg bg-slate-100 p-1 text-xs">
            {(['All', 'Employee', 'Freelancer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`cursor-pointer rounded-md px-3 py-1 font-medium transition-all ${
                  roleFilter === r
                    ? 'bg-white text-primary shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <MdFilterList className="text-sm" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary"
          >
            <option value="hours">Hours Worked (High to Low)</option>
            <option value="shifts">Total Shifts (High to Low)</option>
            <option value="late">Late Days (High to Low)</option>
            <option value="name">Worker Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          Failed to load attendance records. Please refresh or try again later.
        </div>
      )}

      {/* Table Card */}
      <div className="dashboard-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Employee / Worker</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Hours Worked</th>
                <th className="px-6 py-3.5">Total Shifts</th>
                <th className="px-6 py-3.5">Punctuality & Late</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <TableSkeleton rows={7} columns={6} />
                  </td>
                </tr>
              ) : workers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <TbClock className="text-2xl" />
                    </div>
                    <p className="text-sm font-medium text-slate-800">No attendance records found</p>
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
                        className="mt-3 cursor-pointer rounded-lg bg-sky-50 px-3.5 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-100"
                      >
                        Reset filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                workers.map((worker) => {
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src="/avatar-placeholder.svg"
                            alt={worker.name}
                            className="h-9 w-9 rounded-full border border-slate-200 object-cover group-hover:border-primary/50 transition-colors"
                          />
                          <div>
                            <div className="font-medium text-slate-900 group-hover:text-primary transition-colors">
                              {worker.name}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">ID: #{worker.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            worker.role === 'Employee'
                              ? 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200'
                              : 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200'
                          }`}
                        >
                          {worker.role}
                        </span>
                      </td>

                      {/* Hours Worked with Progress Indicator */}
                      <td className="px-6 py-4">
                        <div className="w-36">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-900">{worker.hoursWorked}h</span>
                            <span className="text-[10px] text-slate-400">{timeRange.toLowerCase()}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-sky-500 transition-all duration-300"
                              style={{ width: `${Math.max(5, hourProgress)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Total Shifts */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-normal text-slate-700">
                          <TbCalendarStats className="text-slate-400 text-sm" />
                          {worker.totalShifts} shifts
                        </span>
                      </td>

                      {/* Late Days & Punctuality */}
                      <td className="px-6 py-4">
                        {worker.lateDays > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                            <TbAlertTriangle className="text-xs" />
                            {worker.lateDays} Late Day{worker.lateDays > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                            <TbCheck className="text-xs" />
                            Punctual (0 Late)
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onWorkerSelect(worker);
                          }}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
                        >
                          <TbChartBar className="text-sm text-slate-400" />
                          View Stats & Trends
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TbUsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
      <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
    </svg>
  );
}

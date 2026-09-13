"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineClose, MdAccessTime, MdArrowForward } from 'react-icons/md';
import { TbClock, TbCalendarStats, TbHourglass, TbAlertTriangle, TbChartBar, TbTrendingUp } from 'react-icons/tb';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { WorkerInfo } from './types';
import { getWorkerAttendanceStats, type Period } from '@/services/actions/shiftMonitoring';
import { DetailSkeleton } from '@/components/shared/SkeletonLoader';

interface AttendanceStatsModalProps {
  worker: WorkerInfo;
  onClose: () => void;
  period?: Period;
}

export function AttendanceStatsModal({ worker, onClose, period = 'monthly' }: AttendanceStatsModalProps) {
  const router = useRouter();
  const [stats, setStats] = useState<{
    hours_worked: string;
    completed_shifts: number;
    avg_shift_duration: string;
    late_checkins: number;
    weekly_hours_trend: Array<{ week_label: string; hours: number }>;
    monthly_hours_trend: Array<{ month_label: string; hours: number }>;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    void getWorkerAttendanceStats(String(worker.id), period).then((result) => {
      if (!active) return;
      setLoading(false);
      if (result.success) {
        setStats(result.data);
        setError('');
      } else {
        setError(result.error);
      }
    });
    return () => {
      active = false;
    };
  }, [worker.id, period]);

  const weeklyData = (stats?.weekly_hours_trend ?? []).map((item) => ({
    name: item.week_label,
    hours: item.hours,
  }));
  const monthlyData = (stats?.monthly_hours_trend ?? []).map((item) => ({
    name: item.month_label,
    hours: item.hours,
  }));

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="relative flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4.5 text-slate-900">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="/avatar-placeholder.svg"
                alt={worker.name}
                className="h-13 w-13 rounded-full border border-slate-200 object-cover shadow-2xs"
              />
              <span
                className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  worker.lateDays > 0 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-medium text-slate-900 tracking-tight">{worker.name}</h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    worker.role === 'Employee'
                      ? 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200'
                      : 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200'
                  }`}
                >
                  {worker.role}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-600 uppercase">
                  {period} view
                </span>
              </div>
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono text-[11px] text-slate-400">ID: #{worker.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-normal text-slate-600">
                  <MdAccessTime className="text-slate-400 text-sm" />
                  {worker.hoursWorked}h total recorded
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6">
          {loading ? (
            <DetailSkeleton blocks={5} />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              <p className="font-medium">Unable to load attendance statistics</p>
              <p className="mt-0.5 text-red-600">{error}</p>
            </div>
          ) : !stats ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No attendance statistics available for this worker.
            </div>
          ) : (
            <>
              {/* 4 Metric Cards - Unified Clean Theme */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Hours Worked</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <TbClock className="text-base" />
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-medium tracking-tight text-slate-900">{stats.hours_worked}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Total duration</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Completed</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <TbCalendarStats className="text-base" />
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-medium tracking-tight text-slate-900">{stats.completed_shifts}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Total shifts</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Avg Duration</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <TbHourglass className="text-base" />
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-medium tracking-tight text-slate-900">{stats.avg_shift_duration}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Per shift average</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Late Check-ins</span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        stats.late_checkins > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <TbAlertTriangle className="text-base" />
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-2xl font-medium tracking-tight ${
                      stats.late_checkins > 0 ? 'text-amber-600' : 'text-slate-900'
                    }`}
                  >
                    {stats.late_checkins}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Late occurrences</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Weekly Trend Bar Chart */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <TbChartBar className="text-base" />
                      </span>
                      <div>
                        <h4 className="text-xs font-medium text-slate-800">Weekly Hours Trend</h4>
                        <p className="text-[10px] text-slate-400">Hours breakdown by week</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <Tooltip
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="hours" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Trend Line Chart */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <TbTrendingUp className="text-base" />
                      </span>
                      <div>
                        <h4 className="text-xs font-medium text-slate-800">Monthly Hours Trend</h4>
                        <p className="text-[10px] text-slate-400">Longitudinal performance</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="hours"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#ffffff', stroke: '#10b981', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={() => router.push(`/shift-monitoring/history/${worker.id}`)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            <TbCalendarStats className="text-base text-slate-500" />
            View Full Activity Calendar
            <MdArrowForward className="text-sm text-slate-400" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}

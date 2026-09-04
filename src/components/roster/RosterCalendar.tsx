"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { MdAdd, MdCalendarToday, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import dynamic from 'next/dynamic';

const ShiftModal = dynamic(() => import('./ShiftModal').then((mod) => mod.ShiftModal), { ssr: false });
const CreateShiftModal = dynamic(() => import('./CreateShiftModal').then((mod) => mod.CreateShiftModal), { ssr: false });
import { Shift, ShiftTheme } from './types';
import { type RosterShift } from '@/services/actions/roster';
import { ContentSkeleton } from '@/components/shared/SkeletonLoader';
import { useGetDailyRosterQuery, useGetWeeklyRosterQuery, useGetMonthlyRosterQuery } from '@/redux/api/rosterApi';

import { usePathname } from 'next/navigation';
import { getLocale } from '@/lib/locale';
import { getDashboardTranslation } from '@/lib/translations';

export function RosterCalendar() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  const dateStr = formatYYYYMMDD(currentDate);

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const weekStartStr = formatYYYYMMDD(startOfWeek);

  const monthParam = { month: currentDate.getMonth() + 1, year: currentDate.getFullYear() };

  const { data: dailyRes, isLoading: dailyLoading, refetch: refetchDaily } = useGetDailyRosterQuery(dateStr, { skip: view !== 'Day' });
  const { data: weeklyRes, isLoading: weeklyLoading, refetch: refetchWeekly } = useGetWeeklyRosterQuery(weekStartStr, { skip: view !== 'Week' });
  const { data: monthlyRes, isLoading: monthlyLoading, refetch: refetchMonthly } = useGetMonthlyRosterQuery(monthParam, { skip: view !== 'Month' });

  const loading = view === 'Day' ? dailyLoading : view === 'Week' ? weeklyLoading : monthlyLoading;

  const refetchCurrent = () => {
    if (view === 'Day') void refetchDaily();
    else if (view === 'Week') void refetchWeekly();
    else void refetchMonthly();
  };

  const { stats, teamMembers, shifts } = useMemo(() => {
    if (view === 'Day' && dailyRes) {
      return {
        stats: {
          totalShifts: dailyRes.banner?.total_scheduled_shifts ?? 0,
          totalHours: dailyRes.banner?.total_scheduled_hours ?? 0,
          totalMembers: dailyRes.total_team_members ?? 0,
        },
        teamMembers: (dailyRes.team_members || []).map((m) => m.worker_name),
        shifts: flatten(
          (dailyRes.team_members || []).flatMap((member) =>
            (member.shifts || []).map((shift) => ({ member: member.worker_name, date: dateStr, shift }))
          )
        ),
      };
    }
    if (view === 'Week' && weeklyRes) {
      return {
        stats: {
          totalShifts: weeklyRes.banner?.total_scheduled_shifts ?? 0,
          totalHours: weeklyRes.banner?.total_scheduled_hours ?? 0,
          totalMembers: weeklyRes.total_team_members ?? 0,
        },
        teamMembers: (weeklyRes.team_members || []).map((m) => m.worker_name),
        shifts: flatten(
          (weeklyRes.team_members || []).flatMap((member) =>
            (member.daily_schedule || []).flatMap((day) =>
              (day.shifts || []).map((shift) => ({
                member: member.worker_name,
                date: normalizeDate(day.full_date || day.date_str || ''),
                shift,
              }))
            )
          )
        ),
      };
    }
    if (view === 'Month' && monthlyRes) {
      return {
        stats: {
          totalShifts: monthlyRes.banner?.total_scheduled_shifts ?? 0,
          totalHours: 0,
          totalMembers: monthlyRes.banner?.total_team_members ?? (monthlyRes.team_members || []).length,
        },
        teamMembers: (monthlyRes.team_members || []).map((m) => m.worker_name),
        shifts: flatten(
          (monthlyRes.team_members || []).flatMap((member) =>
            (member.daily_summaries || []).flatMap((day) =>
              (day.shifts || []).map((shift) => ({
                member: member.worker_name,
                date: normalizeDate(day.full_date || ''),
                shift,
              }))
            )
          )
        ),
      };
    }
    return { stats: { totalShifts: 0, totalHours: 0, totalMembers: 0 }, teamMembers: [], shifts: [] };
  }, [view, dailyRes, weeklyRes, monthlyRes, dateStr]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'Week') newDate.setDate(newDate.getDate() - 7);
    if (view === 'Month') newDate.setMonth(newDate.getMonth() - 1);
    if (view === 'Day') newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'Week') newDate.setDate(newDate.getDate() + 7);
    if (view === 'Month') newDate.setMonth(newDate.getMonth() + 1);
    if (view === 'Day') newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateShift = (_newShifts: { workerName: string; location: string; date: string; startTime: string; endTime: string; theme: ShiftTheme }[]) => {
    setShowCreateModal(false);
    refetchCurrent();
  };

  const formatDateRange = () => {
    if (view === 'Month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (view === 'Week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startStr} \u2013 ${endStr}`;
    }
    return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded border border-sky-200 bg-sky-50 text-primary">
              <MdCalendarToday className="text-base" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-800">{t.roster.title}</h1>
              <p className="text-xs text-slate-500">{t.dashboard.allShiftsOnSchedule}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded border border-gray-200 bg-white px-2.5 py-1.5">
            <strong className="font-semibold text-slate-700">{stats.totalShifts || shifts.length}</strong> {t.shiftMonitoring.shiftsCount}
          </span>
          {Boolean(stats.totalHours) && (
            <span className="rounded border border-gray-200 bg-white px-2.5 py-1.5">
              <strong className="font-semibold text-slate-700">{stats.totalHours}</strong> {t.common.duration}
            </span>
          )}
          <span className="rounded border border-gray-200 bg-white px-2.5 py-1.5">
            <strong className="font-semibold text-slate-700">{stats.totalMembers}</strong> {t.workers.employees}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded border border-gray-200 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          <button onClick={handleToday} className="h-8 rounded border border-gray-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-gray-50">
            {t.dashboard.onTime}
          </button>
          <div className="flex shrink-0 overflow-hidden rounded border border-gray-300 bg-white">
            <button onClick={handlePrev} aria-label="Previous period" className="flex h-8 w-8 items-center justify-center border-r border-gray-300 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800">
              <MdChevronLeft className="text-lg" />
            </button>
            <button onClick={handleNext} aria-label="Next period" className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800">
              <MdChevronRight className="text-lg" />
            </button>
          </div>
          <h2 className="min-w-[190px] truncate text-sm font-semibold text-slate-800 sm:text-base">{formatDateRange()}</h2>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          <div className="flex max-w-full overflow-x-auto rounded border border-gray-200 bg-gray-50 p-0.5 text-xs font-medium">
            {(['Day', 'Week', 'Month'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`h-7 rounded px-3 transition-colors ${view === v ? 'border border-gray-200 bg-white text-primary' : 'border border-transparent text-gray-500 hover:text-gray-800'}`}
              >
                {v === 'Day' ? t.roster.dayView : v === 'Week' ? t.roster.weekView : t.roster.date}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded border border-primary bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-[#008bc7] lg:ml-0 cursor-pointer"
          >
            <MdAdd className="text-base" /> {t.roster.createShift}
          </button>
        </div>
      </div>

      <div className="min-h-[600px] flex-1">
        {error && <p className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        {loading ? <ContentSkeleton /> : <>
          {view === 'Day' && <DayView currentDate={currentDate} shifts={shifts} teamMembers={teamMembers} onShiftClick={setSelectedShift} />}
          {view === 'Week' && <WeekView currentDate={currentDate} shifts={shifts} teamMembers={teamMembers} onShiftClick={setSelectedShift} />}
          {view === 'Month' && <MonthView currentDate={currentDate} shifts={shifts} teamMembers={teamMembers} onShiftClick={setSelectedShift} />}
        </>}
      </div>

      {/* Shift Detail Modal */}
      {selectedShift && (
        <ShiftModal shift={selectedShift} onClose={() => setSelectedShift(null)} onDeleted={() => refetchCurrent()} />
      )}

      {/* Create Shift Modal */}
      {showCreateModal && (
        <CreateShiftModal onClose={() => setShowCreateModal(false)} onSave={handleCreateShift} />
      )}
    </div>
  );
}

function formatYYYYMMDD(d: Date): string { const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }
function to24Hour(value: string) { const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i); if (!match) return value; let hour = Number(match[1]); if (match[3]?.toUpperCase() === 'PM' && hour < 12) hour += 12; if (match[3]?.toUpperCase() === 'AM' && hour === 12) hour = 0; return `${String(hour).padStart(2, '0')}:${match[2]}`; }
function normalizeDate(value: string) { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString().split('T')[0]; }
function flatten(items: Array<{ member: string; date: string; shift: RosterShift }>): Shift[] { const themes: ShiftTheme[] = ['blue', 'pink', 'orange', 'purple', 'green', 'teal']; return items.map((item, index) => ({ id: item.shift.shift_id, workerName: item.member, location: item.shift.location_name, date: item.date, startTime: to24Hour(item.shift.start_time), endTime: to24Hour(item.shift.end_time), theme: themes[index % themes.length] })); }

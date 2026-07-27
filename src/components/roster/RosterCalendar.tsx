"use client";

import React, { useState } from 'react';
import { MdAdd, MdCalendarToday, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { ShiftModal } from './ShiftModal';
import { CreateShiftModal } from './CreateShiftModal';
import { MOCK_SHIFTS, Shift, ShiftTheme } from './types';

export function RosterCalendar() {
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);

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

  const handleCreateShift = (newShifts: { workerName: string; location: string; date: string; startTime: string; endTime: string; theme: ShiftTheme }[]) => {
    const createdShifts: Shift[] = newShifts.map((s, i) => ({
      ...s,
      id: `new-${Date.now()}-${i}`,
    }));
    setShifts(prev => [...prev, ...createdShifts]);
    setShowCreateModal(false);
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

  const todayKey = new Date().toISOString().split('T')[0];
  const todayShiftCount = shifts.filter(shift => shift.date === todayKey).length;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded border border-sky-200 bg-sky-50 text-primary">
              <MdCalendarToday className="text-base" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-800">Roster</h1>
              <p className="text-xs text-slate-500">Plan shifts and coordinate team coverage.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded border border-gray-200 bg-white px-2.5 py-1.5">
            <strong className="font-semibold text-slate-700">{shifts.length}</strong> scheduled
          </span>
          <span className="rounded border border-gray-200 bg-white px-2.5 py-1.5">
            <strong className="font-semibold text-slate-700">{todayShiftCount}</strong> today
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded border border-gray-200 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          <button onClick={handleToday} className="h-8 rounded border border-gray-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-gray-50">
            Today
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
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded border border-primary bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-[#008bc7] lg:ml-0"
          >
            <MdAdd className="text-base" /> Create Shift
          </button>
        </div>
      </div>

      <div className="min-h-[600px] flex-1">
        {view === 'Day' && <DayView currentDate={currentDate} shifts={shifts} onShiftClick={setSelectedShift} />}
        {view === 'Week' && <WeekView currentDate={currentDate} shifts={shifts} onShiftClick={setSelectedShift} />}
        {view === 'Month' && <MonthView currentDate={currentDate} shifts={shifts} onShiftClick={setSelectedShift} />}
      </div>

      {/* Shift Detail Modal */}
      {selectedShift && (
        <ShiftModal shift={selectedShift} onClose={() => setSelectedShift(null)} />
      )}

      {/* Create Shift Modal */}
      {showCreateModal && (
        <CreateShiftModal onClose={() => setShowCreateModal(false)} onSave={handleCreateShift} />
      )}
    </div>
  );
}

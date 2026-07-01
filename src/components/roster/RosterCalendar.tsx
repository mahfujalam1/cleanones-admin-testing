"use client";

import React, { useState } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
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

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-300">
      {/* Controls Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full lg:w-auto">
          <button onClick={handleToday} className="px-4 py-1.5 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer">
            Today
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={handlePrev} className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer">
              <MdChevronLeft className="text-xl" />
            </button>
            <button onClick={handleNext} className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer">
              <MdChevronRight className="text-xl" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 min-w-[200px] truncate">{formatDateRange()}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full lg:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-md text-sm font-medium overflow-x-auto max-w-full">
            {(['Day', 'Week', 'Month'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 sm:px-4 py-1.5 rounded transition-all duration-200 cursor-pointer ${view === v ? 'bg-[#0ea5e9] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-auto lg:ml-0"
          >
            <span>+</span> Create Shift
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="flex-1 min-h-[600px]">
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

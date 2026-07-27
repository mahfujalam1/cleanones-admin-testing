import React from 'react';
import { Shift, getThemeClasses } from './types';

interface DayViewProps {
  currentDate: Date;
  shifts: Shift[];
  onShiftClick: (shift: Shift) => void;
}

export function DayView({ currentDate, shifts, onShiftClick }: DayViewProps) {
  const hours = Array.from({ length: 11 }, (_, i) => i + 6); // 6 AM to 4 PM

  const isToday = currentDate.toDateString() === new Date().toDateString();
  const dateStr = currentDate.toISOString().split('T')[0];
  const dayShifts = shifts.filter(s => s.date === dateStr);

  const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

  const getShiftStyle = (shift: Shift) => {
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);

    const startMinutes = (startH - 6) * 60 + startM;
    const endMinutes = (endH - 6) * 60 + endM;
    const duration = endMinutes - startMinutes;

    const top = (startMinutes / 60) * 80;
    const height = (duration / 60) * 80;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="flex flex-col overflow-hidden rounded border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex border-b border-gray-200 bg-white">
        <div className="w-16 flex-shrink-0 border-r border-gray-200"></div>
        <div className="flex-1 text-center py-3">
          <div className={`text-[10px] font-semibold mb-1 ${isToday ? 'text-[#0ea5e9]' : 'text-gray-400'}`}>
            {getDayName(currentDate)}
          </div>
          <div className={`text-sm font-medium w-7 h-7 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-[#0ea5e9] text-white' : 'text-gray-700'}`}>
            {currentDate.getDate()}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="relative flex flex-1 overflow-y-auto bg-[#fbfcfd]">
        {/* Time Labels */}
        <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-white">
          {hours.map(hour => (
            <div key={hour} className="h-[80px] relative">
              <span className="absolute -top-2 right-2 text-[10px] font-medium text-gray-400">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </span>
            </div>
          ))}
        </div>

        {/* Grid Lines & Shifts Container */}
        <div className="flex-1 relative">
          {/* Horizontal Lines */}
          {hours.map(hour => (
            <div key={hour} className="h-[80px] border-b border-gray-100 last:border-b-0 w-full absolute pointer-events-none" style={{ top: `${(hour - 6) * 80}px` }}></div>
          ))}

          {/* Today highlight */}
          {isToday && (
            <div className="absolute inset-0 bg-[#fffbeb]/30 pointer-events-none"></div>
          )}

          {/* Shifts */}
          {dayShifts.map(shift => {
            const theme = getThemeClasses(shift.theme);
            return (
              <div
                key={shift.id}
                onClick={() => onShiftClick(shift)}
                className={`absolute left-2 right-2 cursor-pointer overflow-hidden rounded border border-l-[3px] p-3 transition-colors hover:brightness-95 ${theme.bg} ${theme.border} ${theme.text}`}
                style={getShiftStyle(shift)}
              >
                <div className="text-xs font-bold leading-tight">{shift.workerName}</div>
                <div className="text-[11px] leading-tight opacity-80 mt-0.5">{shift.location}</div>
                <div className="text-[10px] leading-tight opacity-70 mt-0.5">{shift.startTime} - {shift.endTime}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

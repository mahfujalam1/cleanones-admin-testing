import React from 'react';
import { Shift, getThemeClasses } from './types';

interface MonthViewProps {
  currentDate: Date;
  shifts: Shift[];
  onShiftClick: (shift: Shift) => void;
}

export function MonthView({ currentDate, shifts, onShiftClick }: MonthViewProps) {
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonthDays = getDaysInMonth(year, month - 1);
  const weeks: Date[][] = [];
  
  let currentWeek: Date[] = [];
  
  // Previous month padding
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(new Date(year, month - 1, prevMonthDays - firstDay + i + 1));
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    currentWeek.push(new Date(year, month, i));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Next month padding
  if (currentWeek.length > 0) {
    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(year, month + 1, nextMonthDay++));
    }
    weeks.push(currentWeek);
  }

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="flex h-[620px] flex-col overflow-hidden rounded border border-gray-200 bg-white">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center py-3 border-r border-gray-200 last:border-r-0">
            <span className="text-[10px] font-semibold text-gray-400">{day}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-col flex-1 bg-white">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 flex-1 border-b border-gray-200 last:border-b-0 min-h-[100px]">
            {week.map((date, dayIndex) => {
              const isCurrentMonth = date.getMonth() === month;
              const isToday = date.toDateString() === new Date().toDateString();
              const dateStr = date.toISOString().split('T')[0];
              const dayShifts = shifts.filter(s => s.date === dateStr);

              return (
                <div key={dayIndex} className={`group relative flex flex-col border-r border-gray-200 p-1.5 transition-colors last:border-r-0 hover:bg-gray-50 ${isToday ? 'bg-sky-50/40' : ''}`}>
                  <div className={`text-xs font-medium p-1 ml-1 mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#0ea5e9] text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                    {date.getDate()}
                  </div>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
                    {dayShifts.slice(0, 3).map(shift => {
                      const theme = getThemeClasses(shift.theme);
                      return (
                        <div 
                          key={shift.id}
                          onClick={() => onShiftClick(shift)}
                          className={`cursor-pointer truncate rounded border border-l-[3px] px-1.5 py-1 text-[9px] transition-opacity hover:opacity-80 ${theme.bg} ${theme.border} ${theme.text}`}
                        >
                          <span className="font-semibold">{shift.workerName}</span>
                        </div>
                      );
                    })}
                    {dayShifts.length > 3 && (
                      <div className="text-[10px] text-gray-400 pl-1 font-medium">
                        +{dayShifts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

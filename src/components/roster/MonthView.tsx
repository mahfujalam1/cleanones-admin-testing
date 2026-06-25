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
    <div className="flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[600px]">
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
                <div key={dayIndex} className="border-r border-gray-200 last:border-r-0 p-1 flex flex-col relative group hover:bg-gray-50 transition-colors">
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
                          className={`text-[10px] truncate px-1.5 py-0.5 rounded cursor-pointer border-l-2 ${theme.bg} ${theme.border} ${theme.text} hover:opacity-80`}
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

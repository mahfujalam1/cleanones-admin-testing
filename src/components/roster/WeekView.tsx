import React from 'react';
import { Shift, getThemeClasses } from './types';

interface WeekViewProps {
  currentDate: Date;
  shifts: Shift[];
  onShiftClick: (shift: Shift) => void;
}

export function WeekView({ currentDate, shifts, onShiftClick }: WeekViewProps) {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 11 }, (_, i) => i + 6); // 6 AM to 4 PM

  const getShiftStyle = (shift: Shift, dayIndex: number) => {
    const [startH, startM] = shift.startTime.split(':').map(Number);
    const [endH, endM] = shift.endTime.split(':').map(Number);
    
    const startMinutes = (startH - 6) * 60 + startM;
    const endMinutes = (endH - 6) * 60 + endM;
    const duration = endMinutes - startMinutes;
    
    // Each hour is 80px tall (just an example). 1 minute = 80/60 px
    const top = (startMinutes / 60) * 80;
    const height = (duration / 60) * 80;
    
    return {
      top: `${top}px`,
      height: `${height}px`,
      left: `calc(${dayIndex * (100 / 7)}% + 4px)`,
      width: `calc(${100 / 7}% - 8px)`,
    };
  };

  const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

  return (
    <div className="flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex border-b border-gray-200 bg-white">
        <div className="w-16 flex-shrink-0 border-r border-gray-200"></div>
        <div className="flex-1 grid grid-cols-7">
          {days.map((date, i) => {
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={i} className="text-center py-3 border-r border-gray-200 last:border-r-0">
                <div className={`text-[10px] font-semibold mb-1 ${isToday ? 'text-[#0ea5e9]' : 'text-gray-400'}`}>
                  {getDayName(date)}
                </div>
                <div className={`text-sm font-medium w-6 h-6 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-[#0ea5e9] text-white' : 'text-gray-700'}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-1 overflow-y-auto relative bg-[#fafafa]">
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

          {/* Vertical Lines */}
          <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
            {days.map((_, i) => (
              <div key={i} className="border-r border-gray-100 last:border-r-0 h-full"></div>
            ))}
          </div>

          {/* Shifts */}
          {days.map((date, dayIndex) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayShifts = shifts.filter(s => s.date === dateStr);
            
            return dayShifts.map(shift => {
              const theme = getThemeClasses(shift.theme);
              return (
                <div 
                  key={shift.id}
                  onClick={() => onShiftClick(shift)}
                  className={`absolute rounded cursor-pointer transition-all hover:brightness-95 hover:shadow-md border-l-4 overflow-hidden p-2 shadow-sm ${theme.bg} ${theme.border} ${theme.text}`}
                  style={getShiftStyle(shift, dayIndex)}
                >
                  <div className="text-[10px] font-bold leading-tight">{shift.workerName}</div>
                  <div className="text-[10px] leading-tight opacity-80">{shift.startTime}-{shift.endTime}</div>
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}

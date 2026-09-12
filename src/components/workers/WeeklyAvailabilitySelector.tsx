"use client";

import React from "react";

export const WEEK_DAYS = [
  { key: "monday", label: "Mon", full: "Monday" },
  { key: "tuesday", label: "Tue", full: "Tuesday" },
  { key: "wednesday", label: "Wed", full: "Wednesday" },
  { key: "thursday", label: "Thu", full: "Thursday" },
  { key: "friday", label: "Fri", full: "Friday" },
  { key: "saturday", label: "Sat", full: "Saturday" },
  { key: "sunday", label: "Sun", full: "Sunday" },
];

interface WeeklyAvailabilitySelectorProps {
  selectedDays: string[];
  onToggleDay: (dayKey: string) => void;
}

export function WeeklyAvailabilitySelector({
  selectedDays,
  onToggleDay,
}: WeeklyAvailabilitySelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-gray-700">
          Weekly Availability
        </label>
        <span className="text-[11px] text-gray-400">
          Select working days for employee
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.key);
          return (
            <button
              type="button"
              key={day.key}
              onClick={() => onToggleDay(day.key)}
              title={day.full}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-xs"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-xs font-bold">{day.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

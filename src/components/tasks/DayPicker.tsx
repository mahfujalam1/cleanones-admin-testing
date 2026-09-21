"use client";

import type { WeekDay } from "@/redux/api/endpoints/tasks.api";

export const DAY_LABELS: Record<WeekDay, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const MONTH_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

export function toggleDay<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function DayPicker<T extends string | number>({
  label,
  options,
  selected,
  labelFor,
  onToggle,
}: {
  label: string;
  options: readonly T[];
  selected: T[];
  labelFor: (option: T) => string;
  onToggle: (option: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold text-slate-700">
        {label}
        <span className="text-red-500"> *</span>
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={String(option)}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option)}
              className={`h-8 min-w-9 cursor-pointer rounded-lg border px-2 text-xs font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:bg-sky-50"
              }`}
            >
              {labelFor(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

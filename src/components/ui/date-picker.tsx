"use client";

import { useEffect, useMemo, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Days rendered per month view: six weeks, so the grid never changes height. */
const GRID_DAYS = 42;

/** How far the year dropdown reaches when `min`/`max` do not pin it down. */
const YEARS_BACK = 100;
const YEARS_AHEAD = 20;

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const parse = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
};

export const todayIso = () => iso(new Date());

const SELECT_CLASS =
  "cursor-pointer rounded border border-gray-200 bg-white py-1 pl-2 pr-1 text-sm font-semibold text-gray-800 outline-none transition hover:border-gray-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

export function DatePicker({
  value,
  onValueChange,
  placeholder = "Select date",
  clearable = false,
  min,
  max,
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
  min?: string;
  max?: string;
  disabled?: boolean;
}) {
  const selected = parse(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => selected ?? parse(min ?? "") ?? new Date());

  useEffect(() => {
    if (selected) setView(selected);
    // Following `value` alone is deliberate: re-running on the parsed date would loop, since
    // `parse` returns a new object every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const days = useMemo(() => {
    const firstOfMonth = new Date(view.getFullYear(), view.getMonth(), 1);
    const gridStart = new Date(view.getFullYear(), view.getMonth(), 1 - firstOfMonth.getDay());
    return Array.from(
      { length: GRID_DAYS },
      (_, index) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index),
    );
  }, [view]);

  // Jumping a decade through arrow clicks is painful, so the header offers both directly.
  const years = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const first = parse(min ?? "")?.getFullYear() ?? thisYear - YEARS_BACK;
    const last = parse(max ?? "")?.getFullYear() ?? thisYear + YEARS_AHEAD;
    // A selected date outside the range still has to appear, or the dropdown would show it blank.
    const from = Math.min(first, view.getFullYear());
    const to = Math.max(last, view.getFullYear());
    return Array.from({ length: to - from + 1 }, (_, index) => from + index);
  }, [min, max, view]);

  const blocked = (dayIso: string) => (min ? dayIso < min : false) || (max ? dayIso > max : false);

  const previousMonth = new Date(view.getFullYear(), view.getMonth() - 1, 1);
  const nextMonth = new Date(view.getFullYear(), view.getMonth() + 1, 1);
  const previousDisabled = min
    ? iso(new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0)) < min
    : false;
  const nextDisabled = max ? iso(nextMonth) > max : false;

  return (
    <Popover.Root open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <Popover.Trigger
        disabled={disabled}
        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className={selected ? "" : "text-slate-400"}>
          {selected ? selected.toLocaleDateString("en-GB") : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 text-slate-400" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner sideOffset={6} className="z-[120]">
          <Popover.Popup className="w-[19rem] rounded-lg border border-slate-200 bg-white p-3 shadow-xl outline-none">
            <div className="mb-3 flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous month"
                disabled={previousDisabled}
                onClick={() => setView(previousMonth)}
                className="cursor-pointer rounded border border-slate-200 p-1.5 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex flex-1 items-center gap-1.5">
                <select
                  aria-label="Month"
                  value={view.getMonth()}
                  onChange={(event) => setView(new Date(view.getFullYear(), Number(event.target.value), 1))}
                  className={`${SELECT_CLASS} flex-1`}
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Year"
                  value={view.getFullYear()}
                  onChange={(event) => setView(new Date(Number(event.target.value), view.getMonth(), 1))}
                  className={SELECT_CLASS}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                aria-label="Next month"
                disabled={nextDisabled}
                onClick={() => setView(nextMonth)}
                className="cursor-pointer rounded border border-slate-200 p-1.5 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((day) => (
                <span key={day} className="py-1 text-center text-[10px] font-bold text-slate-400">
                  {day}
                </span>
              ))}

              {days.map((day) => {
                const dayIso = iso(day);
                const isSelected = dayIso === value;
                const inCurrentMonth = day.getMonth() === view.getMonth();
                const isBlocked = blocked(dayIso);

                return (
                  <button
                    key={dayIso}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => {
                      onValueChange(dayIso);
                      setOpen(false);
                    }}
                    className={`h-8 rounded text-xs transition-colors ${
                      isBlocked
                        ? "cursor-not-allowed text-slate-200 line-through"
                        : isSelected
                          ? "bg-primary font-bold text-white"
                          : inCurrentMonth
                            ? "cursor-pointer text-slate-700 hover:bg-sky-50"
                            : "cursor-pointer text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => {
                  const today = todayIso();
                  if (!blocked(today)) {
                    onValueChange(today);
                    setOpen(false);
                  }
                }}
                className="cursor-pointer text-xs font-semibold text-primary hover:underline"
              >
                Today
              </button>
              {clearable && value && (
                <button
                  type="button"
                  onClick={() => {
                    onValueChange("");
                    setOpen(false);
                  }}
                  className="cursor-pointer text-xs font-semibold text-red-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

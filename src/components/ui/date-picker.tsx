"use client";

import { useEffect, useMemo, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const parse = (value: string) => { const [year, month, day] = value.split("-").map(Number); return year && month && day ? new Date(year, month - 1, day) : null; };
export const todayIso = () => iso(new Date());

export function DatePicker({ value, onValueChange, placeholder = "Select date", clearable = false, min, max, disabled = false }: { value: string; onValueChange: (value: string) => void; placeholder?: string; clearable?: boolean; min?: string; max?: string; disabled?: boolean }) {
  const selected = parse(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => selected ?? (min ? parse(min) ?? new Date() : new Date()));
  useEffect(() => { if (selected) setView(selected); }, [value]);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  const days = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(view.getFullYear(), view.getMonth(), 1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
  }, [view]);
  const blocked = (dayIso: string) => (min ? dayIso < min : false) || (max ? dayIso > max : false);
  const prevMonth = new Date(view.getFullYear(), view.getMonth() - 1, 1);
  const nextMonth = new Date(view.getFullYear(), view.getMonth() + 1, 1);
  const prevDisabled = min ? iso(new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0)) < min : false;
  const nextDisabled = max ? iso(nextMonth) > max : false;

  return <Popover.Root open={open} onOpenChange={(next) => { if (!disabled) setOpen(next); }}>
    <Popover.Trigger disabled={disabled} className="flex h-10 w-full items-center justify-between rounded border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:border-gray-200">
      <span className={selected ? "" : "text-gray-400"}>{selected ? selected.toLocaleDateString("en-GB") : placeholder}</span><CalendarDays className="h-4 w-4 text-gray-400" />
    </Popover.Trigger>
    <Popover.Portal><Popover.Positioner sideOffset={6} className="z-[100]"><Popover.Popup className="w-72 rounded border border-gray-200 bg-white p-3 shadow-xl outline-none">
      <div className="mb-3 flex items-center justify-between"><button type="button" disabled={prevDisabled} onClick={() => setView(prevMonth)} className="rounded border border-gray-200 p-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"><ChevronLeft className="h-4 w-4" /></button><strong className="text-sm text-gray-800">{view.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong><button type="button" disabled={nextDisabled} onClick={() => setView(nextMonth)} className="rounded border border-gray-200 p-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"><ChevronRight className="h-4 w-4" /></button></div>
      <div className="grid grid-cols-7 gap-1">{weekDays.map((day) => <span key={day} className="py-1 text-center text-[10px] font-bold text-gray-400">{day}</span>)}{days.map((day) => { const dayIso = iso(day), active = dayIso === value, currentMonth = day.getMonth() === view.getMonth(), isBlocked = blocked(dayIso); return <button key={dayIso} type="button" disabled={isBlocked} onClick={() => { onValueChange(dayIso); setOpen(false); }} className={`h-8 rounded text-xs ${isBlocked ? "cursor-not-allowed text-gray-200 line-through" : active ? "bg-sky-500 font-bold text-white" : currentMonth ? "text-gray-700 hover:bg-sky-50" : "text-gray-300 hover:bg-gray-50"}`}>{day.getDate()}</button>; })}</div>
      {clearable && value && <button type="button" onClick={() => { onValueChange(""); setOpen(false); }} className="mt-3 w-full border-t border-gray-100 pt-2 text-xs font-semibold text-red-500">Clear date</button>}
    </Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>;
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Clock } from "lucide-react";

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const PERIODS = ["AM", "PM"] as const;

type Period = (typeof PERIODS)[number];
type TimeParts = { hour12: number; minute: number; period: Period };

function nowParts(): TimeParts {
  const now = new Date();
  return {
    hour12: now.getHours() % 12 || 12,
    minute: now.getMinutes(),
    period: now.getHours() >= 12 ? "PM" : "AM",
  };
}

function parseTime(value: string): TimeParts | null {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return {
    hour12: hour % 12 || 12,
    minute,
    period: hour >= 12 ? "PM" : "AM",
  };
}

function to24Hour(hour12: number, minute: number, period: Period) {
  let hour = hour12 % 12;
  if (period === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function displayTime(value: string) {
  const parts = parseTime(value);
  if (!parts) return "";
  return `${String(parts.hour12).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")} ${parts.period}`;
}

function Column({
  open,
  values,
  selected,
  onSelect,
  format = String,
  last = false,
}: {
  open: boolean;
  values: readonly number[] | readonly string[];
  selected: number | string;
  onSelect: (value: number | string) => void;
  format?: (value: number | string) => string;
  last?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!open || !listRef.current || !selectedRef.current) return;
    const list = listRef.current;
    const item = selectedRef.current;
    list.scrollTop = item.offsetTop - list.clientHeight / 2 + item.clientHeight / 2;
  }, [open, selected]);

  return (
    <div
      ref={listRef}
      className={`h-52 w-[4.75rem] overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        last ? "" : "border-r border-slate-200"
      }`}
    >
      {values.map((value) => {
        const active = value === selected;
        return (
          <button
            key={String(value)}
            type="button"
            ref={active ? selectedRef : undefined}
            onClick={() => onSelect(value)}
            className={`flex h-9 w-full cursor-pointer items-center justify-center text-sm font-medium transition-colors ${
              active ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {format(value)}
          </button>
        );
      })}
    </div>
  );
}

export function TimePicker({
  value,
  onValueChange,
  placeholder = "Select time",
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const initial = parseTime(value) ?? nowParts();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState<Period>(initial.period);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const commit = () => {
    onValueChange(to24Hour(hour12, minute, period));
    setOpen(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        if (next) {
          const parts = parseTime(value) ?? nowParts();
          setHour12(parts.hour12);
          setMinute(parts.minute);
          setPeriod(parts.period);
        } else {
          setReady(false);
        }
        setOpen(next);
      }}
      onOpenChangeComplete={(next) => setReady(next)}
    >
      <Popover.Trigger
        disabled={disabled}
        className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className={value ? "" : "text-slate-400"}>{value ? displayTime(value) : placeholder}</span>
        <Clock className="h-4 w-4 text-slate-400" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner sideOffset={6} className="z-[160]">
          <Popover.Popup className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl outline-none">
            <div className="flex">
              <Column
                open={ready}
                values={HOURS}
                selected={hour12}
                onSelect={(next) => setHour12(Number(next))}
                format={(item) => String(item).padStart(2, "0")}
              />
              <Column
                open={ready}
                values={MINUTES}
                selected={minute}
                onSelect={(next) => setMinute(Number(next))}
                format={(item) => String(item).padStart(2, "0")}
              />
              <Column
                open={ready}
                values={PERIODS}
                selected={period}
                onSelect={(next) => setPeriod(next as Period)}
                last
              />
            </div>
            <div className="flex items-center justify-end gap-1 border-t border-slate-200 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 cursor-pointer rounded-md px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  commit();
                }}
                className="h-8 cursor-pointer rounded-md bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90"
              >
                OK
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

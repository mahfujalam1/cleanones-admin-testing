import type { PlanRosterShift } from "@/redux/api/rosterApi";

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function datesForView(view: "day" | "week" | "month", current: Date): Date[] {
  if (view === "day") return [new Date(current.getFullYear(), current.getMonth(), current.getDate())];
  if (view === "week") {
    const start = new Date(current);
    start.setDate(current.getDate() - current.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }
  const year = current.getFullYear();
  const month = current.getMonth();
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, index) => new Date(year, month, index + 1));
}

export function shiftDateKey(value?: string | null) {
  if (!value) return "";
  return value.includes("T") ? value.slice(0, 10) : value;
}

export function isUnstaffed(shift?: PlanRosterShift | null) {
  if (!shift) return false;
  const status = (shift.status ?? "").toLowerCase();
  return Boolean(shift.is_virtual) || status === "unstaffed" || !shift.shift_id;
}

export function hasShiftStarted(startTime?: string | null, date?: string | null) {
  if (!startTime) return false;
  const parsed = startTime.includes("T")
    ? new Date(startTime)
    : date && /^\d{2}:\d{2}$/.test(startTime)
      ? new Date(`${date}T${startTime}:00`)
      : new Date(startTime);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() <= Date.now();
}


export function canReassign(options: {
  startTime?: string | null;
  date?: string | null;
  status?: string | null;
}) {
  const status = (options.status ?? "").toLowerCase();
  if (status === "completed" || status === "cancelled" || status === "in_progress") return false;
  return !hasShiftStarted(options.startTime, options.date);
}

export function canStaff(shift?: PlanRosterShift | null) {
  if (!shift) return false;
  return canReassign({
    startTime: shift.start_time,
    date: shiftDateKey(shift.date),
    status: shift.status,
  });
}


export function endFromStart(start: Date, durationMinutes: number) {
  if (Number.isNaN(start.getTime()) || durationMinutes <= 0) return null;
  return new Date(start.getTime() + durationMinutes * 60_000);
}

export function shiftEndFromDuration(shift?: Pick<PlanRosterShift, "start_time" | "end_time" | "duration_minutes" | "date"> | null) {
  if (!shift?.start_time || !shift.duration_minutes) return shift?.end_time ?? undefined;
  const parsed = /^\d{2}:\d{2}$/.test(shift.start_time) && shift.date
    ? new Date(`${shiftDateKey(shift.date)}T${shift.start_time}:00`)
    : new Date(shift.start_time);
  return endFromStart(parsed, shift.duration_minutes)?.toISOString() ?? shift.end_time ?? undefined;
}

export function formatClock(value?: string | null) {
  if (!value) return "";
  if (/^\d{2}:\d{2}$/.test(value)) {
    const [hourText, minuteText] = value.split(":");
    const hour = Number(hourText);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minuteText} ${period}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const match = /T(\d{2}):(\d{2})/.exec(value);
    if (!match) return "";
    const hour = Number(match[1]);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${match[2]} ${period}`;
  }
  const hour = parsed.getHours();
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(parsed.getMinutes()).padStart(2, "0")} ${period}`;
}

export function statusLabel(status?: string) {
  const value = (status ?? "").toLowerCase();
  if (value === "unstaffed") return "Unassigned";
  if (value === "in_progress") return "In progress";
  if (value === "completed") return "Completed";
  if (value === "cancelled") return "Cancelled";
  if (value === "upcoming") return "Upcoming";
  return status ? status.replaceAll("_", " ") : "";
}

/**
 * Roster shifts generated from a cleaning plan carry the plan id inside their own id
 * ("exec_plan_b5cf1d87f9_2026-09-08" comes from plan "plan_b5cf1d87f9"). The roster API
 * does not return the plan id on its own, so this is the only link available. Shifts
 * created directly on the roster ("shift_2981de3e24") have no plan behind them.
 */
export const planIdFromShift = (shiftId: string) => {
  const generated = /^exec_(plan_[A-Za-z0-9]+)_\d{4}-\d{2}-\d{2}$/.exec(shiftId);
  if (generated) return generated[1];
  // Some roster rows carry the plan id verbatim rather than wrapped in an exec_ id.
  return /^plan_[A-Za-z0-9]+$/.test(shiftId) ? shiftId : '';
};

/**
 * Roster times are held as 24-hour "HH:MM" but shown on a 12-hour clock.
 * "16:00" -> "4:00 PM".
 */
export const formatTime12 = (value?: string) => {
  if (!value) return "";
  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour);
  if (!Number.isFinite(hour)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${(rawMinute ?? "00").padStart(2, "0")} ${period}`;
};

/** Hour-axis label: 13 -> "1 PM". */
export const formatHour12 = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${period}`;
};

export type ShiftTheme = 'blue' | 'pink' | 'orange' | 'purple' | 'green' | 'teal' | 'gray';

export interface Shift {
  id: string;
  workerName: string;
  workerId?: string;
  location: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour)
  endTime: string; // HH:MM (24-hour)
  startAt?: string;
  theme: ShiftTheme;
  planId?: string;
  status?: string;
  isVirtual?: boolean;
}

export const getThemeClasses = (theme: ShiftTheme) => {
  switch (theme) {
    case 'blue': return { bg: 'bg-[#e0f2fe]', border: 'border-[#0ea5e9]', text: 'text-[#0369a1]' };
    case 'pink': return { bg: 'bg-[#e6f7fd]', border: 'border-[#38a9db]', text: 'text-[#075985]' };
    case 'orange': return { bg: 'bg-[#ecf8fc]', border: 'border-[#0891b2]', text: 'text-[#155e75]' };
    case 'purple': return { bg: 'bg-[#e8f4ff]', border: 'border-[#0284c7]', text: 'text-[#075985]' };
    case 'green': return { bg: 'bg-[#e7f8fc]', border: 'border-[#06a7df]', text: 'text-[#0369a1]' };
    case 'teal': return { bg: 'bg-[#ddf5fb]', border: 'border-[#0b9fd3]', text: 'text-[#0e7490]' };
    default: return { bg: 'bg-sky-50', border: 'border-sky-400', text: 'text-sky-800' };
  }
};

// Helper to generate a date string offset from today
const getOffsetDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const MOCK_SHIFTS: Shift[] = [
  { id: '1', workerName: 'Anna Mulder', location: 'Keizersgracht Kantoren', date: getOffsetDate(-3), startTime: '08:00', endTime: '16:00', theme: 'pink' },
  { id: '2', workerName: 'Lisa Visser', location: 'NH Hotel Amsterdam', date: getOffsetDate(-2), startTime: '08:00', endTime: '16:00', theme: 'blue' },
  { id: '3', workerName: 'Emma Smit', location: 'Hilton Rotterdam', date: getOffsetDate(-2), startTime: '08:30', endTime: '14:30', theme: 'blue' },
  { id: '4', workerName: 'Sophie de Boer', location: 'Van der Valk Eindhoven', date: getOffsetDate(-1), startTime: '07:00', endTime: '15:00', theme: 'pink' },
  { id: '5', workerName: 'Noah Bos', location: 'UMC Utrecht', date: getOffsetDate(-1), startTime: '09:00', endTime: '17:00', theme: 'purple' },
  { id: '6', workerName: 'Lucas Meijer', location: 'NH Hotel Groningen', date: getOffsetDate(0), startTime: '06:00', endTime: '14:00', theme: 'orange' },
  { id: '7', workerName: 'Emma Smit', location: 'Hilton Rotterdam', date: getOffsetDate(0), startTime: '08:00', endTime: '14:00', theme: 'blue' },
  { id: '12', workerName: 'Lisa Visser', location: 'NH Hotel Amsterdam', date: getOffsetDate(0), startTime: '07:00', endTime: '08:30', theme: 'blue' },
  { id: '13', workerName: 'Noah Bos', location: 'UMC Utrecht', date: getOffsetDate(0), startTime: '07:30', endTime: '15:30', theme: 'purple' },
  { id: '14', workerName: 'Sophie de Boer', location: 'Van der Valk Eindhoven', date: getOffsetDate(0), startTime: '08:30', endTime: '13:40', theme: 'teal' },
  { id: '15', workerName: 'Anna Mulder', location: 'Keizersgracht Kantoren', date: getOffsetDate(0), startTime: '08:30', endTime: '11:30', theme: 'pink' },
  { id: '16', workerName: 'Daan van den Berg', location: 'Haarlem Stadsschouwburg', date: getOffsetDate(0), startTime: '09:00', endTime: '17:00', theme: 'green' },
  { id: '17', workerName: 'Milan Dekker', location: 'Academisch Ziekenhuis Leiden', date: getOffsetDate(0), startTime: '10:00', endTime: '18:00', theme: 'orange' },
  { id: '8', workerName: 'Daan van den Berg', location: 'Haarlem Stadsschouwburg', date: getOffsetDate(1), startTime: '08:00', endTime: '16:00', theme: 'teal' },
  { id: '9', workerName: 'Lisa Visser', location: 'NH Hotel Amsterdam', date: getOffsetDate(1), startTime: '10:00', endTime: '18:00', theme: 'blue' },
  { id: '10', workerName: 'Milan Dekker', location: 'Academisch Ziekenhuis Leiden', date: getOffsetDate(2), startTime: '09:30', endTime: '17:30', theme: 'green' },
  { id: '11', workerName: 'Anna Mulder', location: 'Keizersgracht Kantoren', date: getOffsetDate(3), startTime: '08:00', endTime: '16:00', theme: 'pink' },
];

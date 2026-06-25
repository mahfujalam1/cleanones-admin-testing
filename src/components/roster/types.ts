export type ShiftTheme = 'blue' | 'pink' | 'orange' | 'purple' | 'green' | 'teal' | 'gray';

export interface Shift {
  id: string;
  workerName: string;
  location: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour)
  endTime: string; // HH:MM (24-hour)
  theme: ShiftTheme;
}

export const getThemeClasses = (theme: ShiftTheme) => {
  switch (theme) {
    case 'blue': return { bg: 'bg-[#e0f2fe]', border: 'border-[#0ea5e9]', text: 'text-[#0284c7]' };
    case 'pink': return { bg: 'bg-[#fce7f3]', border: 'border-[#ec4899]', text: 'text-[#be185d]' };
    case 'orange': return { bg: 'bg-[#ffedd5]', border: 'border-[#f97316]', text: 'text-[#c2410c]' };
    case 'purple': return { bg: 'bg-[#f3e8ff]', border: 'border-[#a855f7]', text: 'text-[#7e22ce]' };
    case 'green': return { bg: 'bg-[#dcfce7]', border: 'border-[#22c55e]', text: 'text-[#15803d]' };
    case 'teal': return { bg: 'bg-[#ccfbf1]', border: 'border-[#14b8a6]', text: 'text-[#0f766e]' };
    default: return { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-700' };
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
  { id: '8', workerName: 'Daan van den Berg', location: 'Haarlem Stadsschouwburg', date: getOffsetDate(1), startTime: '08:00', endTime: '16:00', theme: 'teal' },
  { id: '9', workerName: 'Lisa Visser', location: 'NH Hotel Amsterdam', date: getOffsetDate(1), startTime: '10:00', endTime: '18:00', theme: 'blue' },
  { id: '10', workerName: 'Milan Dekker', location: 'Academisch Ziekenhuis Leiden', date: getOffsetDate(2), startTime: '09:30', endTime: '17:30', theme: 'green' },
  { id: '11', workerName: 'Anna Mulder', location: 'Keizersgracht Kantoren', date: getOffsetDate(3), startTime: '08:00', endTime: '16:00', theme: 'pink' },
];

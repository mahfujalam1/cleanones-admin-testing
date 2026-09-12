import { WorkerInfo, LocationInfo } from './types';

export const WORKERS: WorkerInfo[] = [
  { id: 1, initials: 'LV', name: 'Lisa Visser', role: 'Employee', shiftId: '#1041', location: 'NH Hotel Amsterdam', checkIn: '08:00', status: 'On Time', color: 'bg-[#0ea5e9]', statusColor: 'text-[#10b981]', hoursWorked: 168, totalShifts: 22, lateDays: 1, avgDuration: '7.6h' },
  { id: 2, initials: 'ES', name: 'Emma Smit', role: 'Employee', shiftId: '#1042', location: 'Hilton Rotterdam', checkIn: '08:12', status: 'Late', color: 'bg-[#0ea5e9]', statusColor: 'text-[#f59e0b]', hoursWorked: 176, totalShifts: 23, lateDays: 2, avgDuration: '7.8h' },
  { id: 3, initials: 'NB', name: 'Noah Bos', role: 'Freelancer', shiftId: '#1043', location: 'UMC Utrecht', checkIn: '—', status: 'Missing', color: 'bg-[#8b5cf6]', statusColor: 'text-[#ef4444]', hoursWorked: 94, totalShifts: 13, lateDays: 0, avgDuration: '7.2h' },
  { id: 4, initials: 'SB', name: 'Sophie de Boer', role: 'Employee', shiftId: '#1044', location: 'Van der Valk Eindhoven', checkIn: '07:02', status: 'On Time', color: 'bg-[#0ea5e9]', statusColor: 'text-[#10b981]', hoursWorked: 152, totalShifts: 20, lateDays: 3, avgDuration: '7.6h' },
  { id: 5, initials: 'LM', name: 'Lucas Meijer', role: 'Employee', shiftId: '#1045', location: 'NH Hotel Groningen', checkIn: '06:05', status: 'On Time', color: 'bg-[#0ea5e9]', statusColor: 'text-[#10b981]', hoursWorked: 184, totalShifts: 24, lateDays: 0, avgDuration: '7.6h' },
  { id: 6, initials: 'AM', name: 'Anna Mulder', role: 'Employee', shiftId: '#1046', location: 'Keizersgracht Kantoren', checkIn: '—', status: 'Missing', color: 'bg-[#0ea5e9]', statusColor: 'text-[#ef4444]', hoursWorked: 144, totalShifts: 19, lateDays: 1, avgDuration: '7.5h' },
  { id: 7, initials: 'DB', name: 'Daan van den Berg', role: 'Freelancer', shiftId: '#1047', location: 'Haarlem Stadsschouwburg', checkIn: '08:25', status: 'Late', color: 'bg-[#0ea5e9]', statusColor: 'text-[#f59e0b]', hoursWorked: 112, totalShifts: 15, lateDays: 2, avgDuration: '7.4h' },
  { id: 8, initials: 'MD', name: 'Milan Dekker', role: 'Employee', shiftId: '#1048', location: 'Academisch Ziekenhuis Leiden', checkIn: '09:30', status: 'On Time', color: 'bg-[#0ea5e9]', statusColor: 'text-[#10b981]', hoursWorked: 160, totalShifts: 21, lateDays: 0, avgDuration: '7.6h' },
];

export const LOCATIONS: LocationInfo[] = [
  { name: 'NH Hotel Amsterdam', workers: 12, hours: 220, shifts: 31 },
  { name: 'Hilton Rotterdam', workers: 9, hours: 180, shifts: 24 },
  { name: 'UMC Utrecht', workers: 15, hours: 290, shifts: 38 },
  { name: 'Van der Valk Eindhoven', workers: 6, hours: 112, shifts: 15 },
  { name: 'NH Hotel Groningen', workers: 8, hours: 155, shifts: 21 },
  { name: 'Haarlem Stadsschouwburg', workers: 5, hours: 96, shifts: 13 },
];

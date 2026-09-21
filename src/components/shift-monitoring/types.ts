export type WorkerRole = 'Employee' | 'Freelancer';
export type ShiftStatus = 'On Time' | 'Late' | 'Missing';

export interface WorkerInfo {
  id: string | number;
  initials: string;
  name: string;
  role: WorkerRole;
  shiftId: string;
  location: string;
  checkIn: string;
  status: ShiftStatus;
  color: string;
  statusColor: string;
  profilePicture?: string;
  
  // Extra fields for Employee/Location Statistics
  hoursWorked: number;
  totalShifts: number;
  lateDays: number;
  onTimeCheckIns?: number;
  absentDays?: number;
  avgDuration: string;
}

export interface LocationInfo {
  name: string;
  workers: number;
  hours: number;
  requiredHours?: number;
  shifts: number;
}

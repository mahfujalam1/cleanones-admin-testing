export interface Worker {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  workerType: 'Employee' | 'Freelancer';
  position: string;
  location: string;
  hourlyRate?: number;
  languages: string[];
  hours: string;
  status: 'On Shift' | 'Active' | 'Off Duty' | 'Suspended' | 'Banned';
  email: string;
  phone: string;
  code: string;
  nationalId?: string;
  certificates?: string[];
  completedShifts: number;
  avgPhotoScore: number;
  weeklyAvailability: boolean[]; // Mon–Sun, 7 items

  // Attendance
  monthlyHours: string;
  lateDays: number;
  absentDays: number;
  attendanceRecords: AttendanceRecord[];

  // Documents
  documents: WorkerDocument[];

  // Invoices
  totalEarned: number;
  totalPaid: number;
  remaining: number;
  invoices: WorkerInvoice[];

  // Shifts
  shiftRecords: ShiftRecord[];
}

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: 'On Time' | 'Late' | 'Absent';
}

export interface WorkerDocument {
  title: string;
  filename: string;
  date: string;
  status: 'Uploaded';
}

export interface WorkerInvoice {
  invoiceNo: string;
  hours: string;
  rate: string;
  amount: string;
  status: 'Paid' | 'Pending';
}

export interface ShiftRecord {
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  hours: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
}

export type WorkerFilter = 'All Workers' | 'Employees' | 'Freelancers';
export type StatusFilter = 'All' | 'On Shift' | 'Active' | 'Off Duty';

export type WorkerSidebarTab =
  | 'General'
  | 'Performance'
  | 'Shifts'
  | 'Attendance'
  | 'Documents'
  | 'Invoices'
  | 'Availability';

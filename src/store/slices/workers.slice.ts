import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Worker, WorkerDocument } from '@/components/workers/types';

interface WorkersState {
  list: Worker[];
}

type NewWorker = Omit<Worker, 'id' | 'code' | 'completedShifts' | 'avgPhotoScore' | 'weeklyAvailability' | 'monthlyHours' | 'lateDays' | 'absentDays' | 'attendanceRecords' | 'documents' | 'invoices' | 'shiftRecords'> & {
  nidFile?: string;
  certFile?: string;
  contractFile?: string;
};

const INITIAL_WORKERS: Worker[] = [
  {
    id: '1', name: 'Lisa Visser', initials: 'LV', avatarColor: 'bg-[#0ea5e9]',
    workerType: 'Employee', position: 'Senior Cleaner', location: 'Amsterdam-Centrum',
    languages: ['Nederlands', 'English'], hours: '168h', status: 'On Shift',
    email: 'l.visser@cleanones.nl', phone: '+31 20 123 4567', code: 'C061',
    completedShifts: 284, avgPhotoScore: 94,
    weeklyAvailability: [true, true, true, true, true, false, false],
    monthlyHours: '168h', lateDays: 1, absentDays: 0,
    attendanceRecords: [
      { date: '9 Jun 2026', checkIn: '08:00', checkOut: '16:00', hours: '8h', status: 'On Time' },
      { date: '8 Jun 2026', checkIn: '08:05', checkOut: '16:10', hours: '8h', status: 'On Time' },
      { date: '7 Jun 2026', checkIn: '08:22', checkOut: '16:30', hours: '8h', status: 'Late' },
      { date: '6 Jun 2026', checkIn: '07:58', checkOut: '16:02', hours: '8h', status: 'On Time' },
      { date: '5 Jun 2026', checkIn: '08:00', checkOut: '16:00', hours: '8h', status: 'On Time' },
    ],
    documents: [
      { title: 'National ID (NID)', filename: 'national_id_lisa.pdf', date: 'Jan 2024', status: 'Uploaded' },
      { title: 'Certificate(s)', filename: 'cleaning_certificate_2024.pdf', date: 'Mar 2024', status: 'Uploaded' },
      { title: 'Employment Contract', filename: 'employment_contract_lisa.pdf', date: 'Jan 2024', status: 'Uploaded' }
    ],
    totalEarned: 2160, totalPaid: 1404, remaining: 756,
    invoices: [
      { invoiceNo: 'INV-2026-041', hours: '40h', rate: '€18/h', amount: '€720', status: 'Paid' },
      { invoiceNo: 'INV-2026-033', hours: '38h', rate: '€18/h', amount: '€684', status: 'Paid' },
      { invoiceNo: 'INV-2026-025', hours: '42h', rate: '€18/h', amount: '€756', status: 'Pending' }
    ],
    shiftRecords: [
      { date: '9 Jun 2026', location: 'Amsterdam-Centrum', startTime: '08:00', endTime: '16:00', hours: '8h', status: 'Completed' },
      { date: '8 Jun 2026', location: 'Amsterdam-Centrum', startTime: '08:00', endTime: '16:00', hours: '8h', status: 'Completed' },
      { date: '7 Jun 2026', location: 'Amsterdam-Centrum', startTime: '08:00', endTime: '16:00', hours: '8h', status: 'Completed' }
    ]
  },
  {
    id: '2', name: 'Emma Smit', initials: 'ES', avatarColor: 'bg-[#6366f1]',
    workerType: 'Employee', position: 'Senior Cleaner', location: 'Rotterdam-Noord',
    languages: ['Nederlands', 'English'], hours: '176h', status: 'On Shift',
    email: 'e.smit@cleanones.nl', phone: '+31 10 234 5678', code: 'C062',
    completedShifts: 312, avgPhotoScore: 91,
    weeklyAvailability: [true, true, true, true, true, false, false],
    monthlyHours: '176h', lateDays: 0, absentDays: 0,
    attendanceRecords: [
      { date: '9 Jun 2026', checkIn: '08:00', checkOut: '16:00', hours: '8h', status: 'On Time' },
      { date: '8 Jun 2026', checkIn: '08:00', checkOut: '16:00', hours: '8h', status: 'On Time' }
    ],
    documents: [
      { title: 'National ID (NID)', filename: 'national_id_emma.pdf', date: 'Feb 2024', status: 'Uploaded' }
    ],
    totalEarned: 2400, totalPaid: 2400, remaining: 0,
    invoices: [
      { invoiceNo: 'INV-2026-042', hours: '40h', rate: '€20/h', amount: '€800', status: 'Paid' }
    ],
    shiftRecords: [
      { date: '9 Jun 2026', location: 'Rotterdam-Noord', startTime: '08:00', endTime: '16:00', hours: '8h', status: 'Completed' }
    ]
  },
  {
    id: '3', name: 'Sophie de Boer', initials: 'SB', avatarColor: 'bg-[#ec4899]',
    workerType: 'Freelancer', position: 'Cleaner', location: 'Utrecht-Binnenstad',
    languages: ['Nederlands', 'Engels'], hours: '94h', status: 'On Shift',
    email: 's.deboer@cleanones.nl', phone: '+31 30 345 6789', code: 'F021',
    completedShifts: 156, avgPhotoScore: 88,
    weeklyAvailability: [true, true, true, true, false, false, false],
    monthlyHours: '94h', lateDays: 2, absentDays: 1,
    attendanceRecords: [
      { date: '9 Jun 2026', checkIn: '08:15', checkOut: '16:00', hours: '7.75h', status: 'Late' }
    ],
    documents: [
      { title: 'National ID (NID)', filename: 'nid_sophie.pdf', date: 'May 2024', status: 'Uploaded' }
    ],
    totalEarned: 1500, totalPaid: 1000, remaining: 500,
    invoices: [
      { invoiceNo: 'INV-2026-043', hours: '30h', rate: '€25/h', amount: '€750', status: 'Paid' }
    ],
    shiftRecords: [
      { date: '9 Jun 2026', location: 'Utrecht-Binnenstad', startTime: '08:00', endTime: '16:00', hours: '8h', status: 'Completed' }
    ]
  },
  {
    id: '4', name: 'Anna Mulder', initials: 'AM', avatarColor: 'bg-[#f59e0b]',
    workerType: 'Employee', position: 'Team Leader', location: 'Eindhoven-Centrum',
    languages: ['Nederlands', 'Engels'], hours: '160h', status: 'On Shift',
    email: 'a.mulder@cleanones.nl', phone: '+31 40 456 7890', code: 'C063',
    completedShifts: 420, avgPhotoScore: 97,
    weeklyAvailability: [true, true, true, true, true, true, false],
    monthlyHours: '160h', lateDays: 0, absentDays: 0,
    attendanceRecords: [
      { date: '9 Jun 2026', checkIn: '08:00', checkOut: '16:00', hours: '8h', status: 'On Time' }
    ],
    documents: [
      { title: 'National ID (NID)', filename: 'nid_anna.pdf', date: 'Dec 2023', status: 'Uploaded' }
    ],
    totalEarned: 3200, totalPaid: 3200, remaining: 0,
    invoices: [
      { invoiceNo: 'INV-2026-044', hours: '40h', rate: '€22/h', amount: '€880', status: 'Paid' }
    ],
    shiftRecords: [
      { date: '9 Jun 2026', location: 'Eindhoven-Centrum', startTime: '08:00', endTime: '16:00', hours: '8h', status: 'Completed' }
    ]
  },
  {
    id: '5', name: 'Noah Bos', initials: 'NB', avatarColor: 'bg-[#ef4444]',
    workerType: 'Freelancer', position: 'Cleaner', location: 'Groningen-Centrum',
    languages: ['Nederlands', 'Engels'], hours: '112h', status: 'Active',
    email: 'n.bos@cleanones.nl', phone: '+31 50 567 8901', code: 'F022',
    completedShifts: 98, avgPhotoScore: 82,
    weeklyAvailability: [true, true, true, true, true, false, false],
    monthlyHours: '112h', lateDays: 3, absentDays: 2,
    attendanceRecords: [
      { date: '8 Jun 2026', checkIn: '08:00', checkOut: '16:00', hours: '8h', status: 'On Time' }
    ],
    documents: [
      { title: 'National ID (NID)', filename: 'nid_noah.pdf', date: 'Jun 2024', status: 'Uploaded' }
    ],
    totalEarned: 1800, totalPaid: 1200, remaining: 600,
    invoices: [
      { invoiceNo: 'INV-2026-045', hours: '35h', rate: '€24/h', amount: '€840', status: 'Paid' }
    ],
    shiftRecords: [
      { date: '8 Jun 2026', location: 'Groningen-Centrum', startTime: '08:00', endTime: '16:00', hours: '8h', status: 'Completed' }
    ]
  },
  {
    id: '6', name: 'Lucas Meijer', initials: 'LM', avatarColor: 'bg-[#10b981]',
    workerType: 'Employee', position: 'Cleaner', location: 'Haarlem-Centrum',
    languages: ['Nederlands'], hours: '144h', status: 'Off Duty',
    email: 'l.meijer@cleanones.nl', phone: '+31 23 678 9012', code: 'C064',
    completedShifts: 210, avgPhotoScore: 90,
    weeklyAvailability: [true, true, true, true, true, false, false],
    monthlyHours: '144h', lateDays: 1, absentDays: 0,
    attendanceRecords: [
      { date: '5 Jun 2026', checkIn: '08:00', checkOut: '16:00', hours: '8h', status: 'On Time' }
    ],
    documents: [
      { title: 'National ID (NID)', filename: 'nid_lucas.pdf', date: 'Jul 2024', status: 'Uploaded' }
    ],
    totalEarned: 2200, totalPaid: 2200, remaining: 0,
    invoices: [
      { invoiceNo: 'INV-2026-046', hours: '40h', rate: '€18/h', amount: '€720', status: 'Paid' }
    ],
    shiftRecords: [
      { date: '5 Jun 2026', location: 'Haarlem-Centrum', startTime: '08:00', endTime: '16:00', hours: '8h', status: 'Completed' }
    ]
  },
  {
    id: '7', name: 'Daan van den Berg', initials: 'DB', avatarColor: 'bg-[#8b5cf6]',
    workerType: 'Freelancer', position: 'Specialist Cleaner', location: 'Leiden-Centrum',
    languages: ['Nederlands', 'Engels'], hours: '120h', status: 'On Shift',
    email: 'd.vandenberg@cleanones.nl', phone: '+31 71 789 0123', code: 'F023',
    completedShifts: 175, avgPhotoScore: 93,
    weeklyAvailability: [true, true, true, true, true, true, false],
    monthlyHours: '120h', lateDays: 0, absentDays: 0,
    attendanceRecords: [
      { date: '9 Jun 2026', checkIn: '08:00', checkOut: '16:00', hours: '8h', status: 'On Time' }
    ],
    documents: [
      { title: 'National ID (NID)', filename: 'nid_daan.pdf', date: 'Aug 2024', status: 'Uploaded' }
    ],
    totalEarned: 2800, totalPaid: 2000, remaining: 800,
    invoices: [
      { invoiceNo: 'INV-2026-047', hours: '40h', rate: '€28/h', amount: '€1120', status: 'Paid' }
    ],
    shiftRecords: [
      { date: '9 Jun 2026', location: 'Leiden-Centrum', startTime: '08:00', endTime: '16:00', hours: '8h', status: 'Completed' }
    ]
  },
  {
    id: '8', name: 'Milan Dekker', initials: 'MD', avatarColor: 'bg-[#0ea5e9]',
    workerType: 'Employee', position: 'Cleaner', location: 'Delft-Centrum',
    languages: ['Nederlands', 'Engels'], hours: '152h', status: 'Active',
    email: 'm.dekker@cleanones.nl', phone: '+31 15 890 1234', code: 'C065',
    completedShifts: 230, avgPhotoScore: 86,
    weeklyAvailability: [true, true, true, true, true, false, false],
    monthlyHours: '152h', lateDays: 2, absentDays: 0,
    attendanceRecords: [
      { date: '8 Jun 2026', checkIn: '08:00', checkOut: '16:00', hours: '8h', status: 'On Time' }
    ],
    documents: [
      { title: 'National ID (NID)', filename: 'nid_milan.pdf', date: 'Sep 2024', status: 'Uploaded' }
    ],
    totalEarned: 2300, totalPaid: 2300, remaining: 0,
    invoices: [
      { invoiceNo: 'INV-2026-048', hours: '40h', rate: '€18/h', amount: '€720', status: 'Paid' }
    ],
    shiftRecords: [
      { date: '8 Jun 2026', location: 'Delft-Centrum', startTime: '08:00', endTime: '16:00', hours: '8h', status: 'Completed' }
    ]
  },
];

const initialState: WorkersState = {
  list: INITIAL_WORKERS
};

const workersSlice = createSlice({
  name: 'workers',
  initialState,
  reducers: {
    addWorker(state, action: PayloadAction<NewWorker>) {
      const nextId = (state.list.length + 1).toString();
      const prefix = action.payload.workerType === 'Employee' ? 'C0' : 'F0';
      const nextCode = `${prefix}${60 + parseInt(nextId)}`;
      
      const newWorker: Worker = {
        ...action.payload,
        id: nextId,
        code: nextCode,
        completedShifts: 0,
        avgPhotoScore: 100,
        weeklyAvailability: [true, true, true, true, true, false, false],
        monthlyHours: '0h',
        lateDays: 0,
        absentDays: 0,
        attendanceRecords: [],
        documents: [],
        totalEarned: 0,
        totalPaid: 0,
        remaining: 0,
        invoices: [],
        shiftRecords: []
      };
      state.list.push(newWorker);
    },
    deleteWorker(state, action: PayloadAction<string>) {
      state.list = state.list.filter(w => w.id !== action.payload);
    },
    updateWorker(state, action: PayloadAction<Worker>) {
      const idx = state.list.findIndex(w => w.id === action.payload.id);
      if (idx !== -1) {
        state.list[idx] = action.payload;
      }
    },
    uploadWorkerDocument(state, action: PayloadAction<{ workerId: string; document: WorkerDocument }>) {
      const worker = state.list.find(w => w.id === action.payload.workerId);
      if (worker) {
        worker.documents.push(action.payload.document);
      }
    }
  }
});

export const { addWorker, deleteWorker, updateWorker, uploadWorkerDocument } = workersSlice.actions;
export default workersSlice.reducer;

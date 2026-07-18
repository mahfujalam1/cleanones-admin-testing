"use client";

import React, { useState, useMemo } from 'react';
import { MdSearch, MdPeople, MdBadge, MdWorkOutline, MdAdd } from 'react-icons/md';
import { WorkerFilter, StatusFilter } from '@/components/workers/types';
import { WorkersTable } from '@/components/workers/WorkersTable';
import { WorkerDetailSidebar } from '@/components/workers/WorkerDetailSidebar';
import { AddWorkerModal } from '@/components/workers/AddWorkerModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addWorker } from '@/store/slices/workers.slice';
import type { Worker } from '@/components/workers/types';

type NewWorker = Omit<Worker, 'id' | 'code' | 'completedShifts' | 'avgPhotoScore' | 'weeklyAvailability' | 'monthlyHours' | 'lateDays' | 'absentDays' | 'attendanceRecords' | 'documents' | 'invoices' | 'shiftRecords'> & {
  nidFile?: string;
  certFile?: string;
  contractFile?: string;
};

const WORKER_FILTERS: WorkerFilter[] = ['All Workers', 'Employees', 'Freelancers'];
const STATUS_FILTERS: StatusFilter[] = ['All', 'On Shift', 'Active', 'Off Duty'];

export default function WorkersPage() {
  const dispatch = useAppDispatch();
  const workers = useAppSelector((state) => state.workers.list);

  const [search, setSearch] = useState('');
  const [workerFilter, setWorkerFilter] = useState<WorkerFilter>('All Workers');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const selectedWorker = useMemo(() => {
    return workers.find(w => w.id === selectedWorkerId) || null;
  }, [selectedWorkerId, workers]);

  const filtered = useMemo(() => {
    return workers.filter((w) => {
      // search
      if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
      // worker type
      if (workerFilter === 'Employees' && w.workerType !== 'Employee') return false;
      if (workerFilter === 'Freelancers' && w.workerType !== 'Freelancer') return false;
      // status
      if (statusFilter !== 'All' && w.status !== statusFilter) return false;
      return true;
    });
  }, [search, workerFilter, statusFilter, workers]);

  const totalWorkers = workers.length;
  const totalEmployees = workers.filter((w) => w.workerType === 'Employee').length;
  const totalFreelancers = workers.filter((w) => w.workerType === 'Freelancer').length;

  const handleAddWorker = (newWorkerData: NewWorker) => {
    const workerPayload = {
      ...newWorkerData,
      completedShifts: 0,
      avgPhotoScore: 0,
      weeklyAvailability: [],
      monthlyHours: '0',
      lateDays: 0,
      absentDays: 0,
      attendanceRecords: [],
      documents: [],
      invoices: [],
      shiftRecords: [],
    } as Omit<Worker, 'id' | 'code'>;

    dispatch(addWorker(workerPayload));
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Search + Filters + Add */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search workers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm w-64 focus:outline-none shadow-sm bg-gray-50"
          />
        </div>

        {/* Worker type filters */}
        <div className="flex bg-gray-100 p-1 rounded text-xs font-medium">
          {WORKER_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setWorkerFilter(f)}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${workerFilter === f
                  ? 'bg-[#0ea5e9] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Status filters */}
        <div className="flex bg-gray-100 p-1 rounded text-xs font-medium">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 ${statusFilter === f
                  ? 'bg-[#0ea5e9] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Spacer + Add */}
        <div className="ml-auto">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold rounded shadow-sm transition-colors cursor-pointer"
          >
            <MdAdd className="text-lg" />
            Add Worker
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<MdPeople className="text-[#0ea5e9] text-2xl" />} value={totalWorkers} label="Total Workers" />
        <StatCard icon={<MdBadge className="text-[#6366f1] text-2xl" />} value={totalEmployees} label="Employees" />
        <StatCard icon={<MdWorkOutline className="text-[#f59e0b] text-2xl" />} value={totalFreelancers} label="Freelancers" />
      </div>

      {/* Table */}
      <WorkersTable workers={filtered} onViewWorker={(w) => setSelectedWorkerId(w.id)} />

      {/* Sidebar */}
      {selectedWorker && (
        <WorkerDetailSidebar
          worker={selectedWorker}
          onClose={() => setSelectedWorkerId(null)}
        />
      )}

      {/* Add Modal */}
      {addModalOpen && (
        <AddWorkerModal
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddWorker}
        />
      )}
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────── */

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-white rounded border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none mb-0.5">{value}</div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

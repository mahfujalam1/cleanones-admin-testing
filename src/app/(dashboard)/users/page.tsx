"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { MdSearch, MdPeople, MdBadge, MdWorkOutline, MdAdd, MdUploadFile, MdHourglassTop } from 'react-icons/md';
import { BulkImportModal } from '@/components/shared/BulkImportModal';
import { WorkerFilter, StatusFilter } from '@/components/workers/types';
import { WorkersTable } from '@/components/workers/WorkersTable';
import { WorkerDetailSidebar } from '@/components/workers/WorkerDetailSidebar';
import { AddWorkerModal } from '@/components/workers/AddWorkerModal';
import { PendingApprovalsModal } from '@/components/workers/PendingApprovalsModal';
import type { Worker } from '@/components/workers/types';
import { createWorker, getWorkerApprovals } from '@/services/actions/workers';
import { useGetWorkersQuery } from '@/redux/api/dashboardApi';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { BackendPagination } from '@/components/shared/BackendPagination';

type NewWorker = Omit<Worker, 'id' | 'code' | 'completedShifts' | 'avgPhotoScore' | 'weeklyAvailability' | 'monthlyHours' | 'lateDays' | 'absentDays' | 'attendanceRecords' | 'documents' | 'invoices' | 'shiftRecords'> & {
  nidFile?: string;
  certFile?: string;
  contractFile?: string;
};

const WORKER_FILTERS: WorkerFilter[] = ['All Workers', 'Employees', 'Freelancers'];
const STATUS_FILTERS: StatusFilter[] = ['All', 'On Shift', 'Active', 'Off Duty'];

export default function WorkersPage() {
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1); const limit = 10;

  const [search, setSearch] = useState('');
  const [workerFilter, setWorkerFilter] = useState<WorkerFilter>('All Workers');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);

  const type = workerFilter === 'Employees' ? 'employee' : workerFilter === 'Freelancers' ? 'freelancer' : undefined;

  const { data: workersRes, isLoading: loading, refetch } = useGetWorkersQuery({
    search: search.trim() || undefined,
    role: type,
    page,
    limit,
  });

  const rawWorkers = workersRes?.workers ?? [];
  const totalWorkers = workersRes?.total_count ?? 0;
  const workers = rawWorkers.map(mapWorker);
  const counts = {
    total: totalWorkers,
    employees: rawWorkers.filter(w => (w.worker_type || '').toLowerCase() === 'employee').length,
    freelancers: rawWorkers.filter(w => (w.worker_type || '').toLowerCase() === 'freelancer').length,
  };

  const loadPendingCount = async () => {
    const res = await getWorkerApprovals(1, 1, 'pending');
    if (res.success) {
      setPendingCount(res.data.total_count || 0);
    }
  };

  useEffect(() => {
    void loadPendingCount();
  }, []);

  const selectedWorker = useMemo(() => {
    return workers.find(w => w.id === selectedWorkerId) || null;
  }, [selectedWorkerId, workers]);

  const filtered = workers;

  const handleAddWorker = async (data: NewWorker): Promise<string | void> => {
    const rate = Number(data.hourlyRate) || 25;
    const result = await createWorker({
      full_name: data.name,
      name: data.name,
      email: data.email,
      phone: data.phone,
      worker_type: data.workerType.toLowerCase(),
      position: data.position,
      base_location: data.location,
      hourly_rate: rate,
      languages: data.languages,
      status: data.status.toLowerCase().replaceAll(' ', '_'),
      national_id: data.nidFile ?? 'NID-12345678',
      certificates: data.certFile ? [data.certFile] : ['Certificate in Professional Cleaning'],
      national_id_front: data.nidFile ?? 'string',
      national_id_back: 'string',
      employee_contract_pdf: data.contractFile ?? 'string',
    });
    if (!result.success) {
      return result.error;
    }
    void refetch();
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
            className="pl-9 pr-4 py-2 border border-gray-200 rounded text-sm w-64 focus:outline-none shadow-sm bg-gray-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 ">
        {/* Worker type filters */}
          <div className="flex rounded text-xs font-medium border border-gray-200 bg-white p-1">
          {WORKER_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setWorkerFilter(f)}
              className={`px-3 py-1.5 rounded cursor-pointer transition-all duration-200 ${workerFilter === f
                  ? 'bg-[#0ea5e9] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Status filters */}
          <div className="flex rounded text-xs font-medium border border-gray-200 bg-white p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded cursor-pointer transition-all duration-200 ${statusFilter === f
                  ? 'bg-[#0ea5e9] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
        </div>

        {/* Spacer + Add */}
        <div className="ml-auto flex gap-2">
          <button onClick={() => setImportOpen(true)} className="flex h-9 items-center gap-1.5 rounded border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm hover:border-sky-300">
            <MdUploadFile className="text-lg text-sky-500" /> Bulk Import
          </button>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<MdPeople className="text-[#0ea5e9] text-2xl" />} value={counts.total} label="Total Workers" />
        <StatCard icon={<MdBadge className="text-[#6366f1] text-2xl" />} value={counts.employees} label="Employees" />
        <StatCard icon={<MdWorkOutline className="text-[#f59e0b] text-2xl" />} value={counts.freelancers} label="Freelancers" />
        <StatCard
          icon={<MdHourglassTop className="text-amber-500 text-2xl" />}
          value={pendingCount}
          label="Pending Approvals"
          onClick={() => setPendingModalOpen(true)}
          badgeText={pendingCount > 0 ? "Review Requests" : undefined}
          highlight={pendingCount > 0}
        />
      </div>

      {/* Table */}
      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      {loading ? <div className="overflow-hidden rounded border border-slate-200 bg-white"><TableSkeleton rows={7} columns={7} /></div> : <WorkersTable workers={filtered} onViewWorker={(w) => setSelectedWorkerId(w.id)} />}
      <BackendPagination page={page} limit={limit} total={counts.total} onPageChange={setPage} />

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

      {/* Pending Approvals Modal */}
      {pendingModalOpen && (
        <PendingApprovalsModal
          onClose={() => setPendingModalOpen(false)}
          onSuccess={() => {
            void refetch();
            void loadPendingCount();
          }}
        />
      )}

      {importOpen && <BulkImportModal mode="workers" onImported={() => { setImportOpen(false); void refetch(); void loadPendingCount(); }} onClose={() => setImportOpen(false)} />}
    </div>
  );
}

function mapWorker(item: import('@/services/actions/workers').WorkerApi): Worker { const status = item.status.toLowerCase() === 'on_shift' ? 'On Shift' : item.status.toLowerCase() === 'off_duty' ? 'Off Duty' : 'Active'; return { id: item.worker_id, code: item.worker_id, name: item.full_name, initials: item.full_name.split(' ').map((part) => part[0]).join('').slice(0, 2), avatarColor: 'bg-sky-500', workerType: item.worker_type.toLowerCase() === 'freelancer' ? 'Freelancer' : 'Employee', position: item.position, location: item.location, languages: item.languages, hours: item.hours_worked, status, email: '', phone: '', completedShifts: 0, avgPhotoScore: 0, weeklyAvailability: [], monthlyHours: item.hours_worked, lateDays: 0, absentDays: 0, attendanceRecords: [], documents: [], totalEarned: 0, totalPaid: 0, remaining: 0, invoices: [], shiftRecords: [] }; }

/* ─── Stat Card ──────────────────────────────────────── */

function StatCard({
  icon,
  value,
  label,
  onClick,
  badgeText,
  highlight,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  onClick?: () => void;
  badgeText?: string;
  highlight?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded border shadow-sm px-6 py-5 flex items-center justify-between transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-amber-300' : 'hover:shadow'
      } ${highlight ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded flex items-center justify-center border ${highlight ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-0.5">{value}</div>
          <div className="text-xs text-gray-500 font-medium">{label}</div>
        </div>
      </div>
      {badgeText && (
        <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-800 animate-pulse">
          {badgeText}
        </span>
      )}
    </div>
  );
}


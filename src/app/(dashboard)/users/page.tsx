"use client";

import React, { useCallback, useEffect, useState, useMemo } from 'react';
// MdUploadFile belongs to the bulk import button below, which is commented out for now.
import { MdSearch, MdPeople, MdBadge, MdWorkOutline, MdAdd, MdHourglassTop, MdWarningAmber } from 'react-icons/md';
import { BulkImportModal } from '@/components/shared/BulkImportModal';
import { WorkerFilter, StatusFilter } from '@/components/workers/types';
import { WorkersTable } from '@/components/workers/WorkersTable';
import { WorkerDetailSidebar } from '@/components/workers/WorkerDetailSidebar';
import { AddWorkerModal, type NewWorker } from '@/components/workers/AddWorkerModal';
import { PendingApprovalsModal } from '@/components/workers/PendingApprovalsModal';
import { EditWorkerModal, type WorkerDocumentFiles } from '@/components/workers/EditWorkerModal';
import type { Worker } from '@/components/workers/types';
import { createWorker, updateWorkerDetails, getWorkerApprovals, uploadWorkerDocuments, deleteWorker, getDeletedWorkers, restoreWorker, type UpdateWorkerInput, type WorkerApi } from '@/services/actions/workers';
import { WorkerStatusModal } from '@/components/workers/WorkerStatusModal';
import { useGetWorkersQuery } from '@/redux/api/dashboardApi';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { BackendPagination } from '@/components/shared/BackendPagination';
import { usePathname } from 'next/navigation';
import { getLocale } from '@/lib/locale';
import { getDashboardTranslation } from '@/lib/translations';



const WORKER_FILTERS: WorkerFilter[] = ['All Workers', 'Employees', 'Freelancers'];
const STATUS_FILTERS: StatusFilter[] = ['All', 'On Shift', 'Active', 'Off Duty'];

export default function WorkersPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1); const limit = 10;

  const [search, setSearch] = useState('');
  const [workerFilter, setWorkerFilter] = useState<WorkerFilter>('All Workers');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [mode, setMode] = useState<'active' | 'deleted'>('active');
  const [deletedWorkers, setDeletedWorkers] = useState<WorkerApi[]>([]);
  const [deletedTotal, setDeletedTotal] = useState(0);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Worker | null>(null);
  const [statusTarget, setStatusTarget] = useState<Worker | null>(null);
  const [busy, setBusy] = useState(false);

  const [workerCache, setWorkerCache] = useState<Record<string, Partial<import('@/services/actions/workers').WorkerApi>>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cleanones_worker_cache');
      if (saved) setWorkerCache(JSON.parse(saved));
    } catch { }
  }, []);

  const updateCache = (workerId: string, details: Partial<import('@/services/actions/workers').WorkerApi>) => {
    setWorkerCache((prev) => {
      const updated = {
        ...prev,
        [workerId]: { ...(prev[workerId] || {}), ...details }
      };
      try {
        localStorage.setItem('cleanones_worker_cache', JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  const type = workerFilter === 'Employees' ? 'employee' : workerFilter === 'Freelancers' ? 'freelancer' : undefined;
  const statusFilterParam = statusFilter === 'On Shift' ? 'on_shift' : statusFilter === 'Off Duty' ? 'off_duty' : statusFilter === 'Active' ? 'active' : undefined;

  const { data: workersRes, isLoading: loading, refetch } = useGetWorkersQuery({
    search: search.trim() || undefined,
    workerType: type,
    statusFilter: statusFilterParam,
    page,
    limit,
  });

  const rawWorkers = workersRes?.workers ?? [];
  // The API reports totals across every page; falling back to the current page's rows only
  // when those fields are missing.
  const totalWorkers = workersRes?.total_workers ?? workersRes?.total_count ?? 0;
  const workers = (mode === 'deleted' ? deletedWorkers : rawWorkers).map((item) => mapWorker(item, workerCache));
  const counts = {
    total: totalWorkers,
    employees: workersRes?.employees_count ?? rawWorkers.filter(w => (w.worker_type || '').toLowerCase() === 'employee').length,
    freelancers: workersRes?.freelancers_count ?? rawWorkers.filter(w => (w.worker_type || '').toLowerCase() === 'freelancer').length,
  };

  const loadDeleted = useCallback(async () => {
    setLoadingDeleted(true);
    const result = await getDeletedWorkers(page, limit, search.trim() || undefined);
    setLoadingDeleted(false);
    if (!result.success) return setError(result.error);
    setError('');
    setDeletedWorkers(result.data.workers ?? []);
    setDeletedTotal(result.data.total_workers ?? 0);
  }, [page, search]);

  useEffect(() => {
    if (mode === 'deleted') void loadDeleted();
  }, [mode, loadDeleted]);

  // Switching lists restarts paging, otherwise page 3 of one list opens an empty page 3
  // of the other.
  useEffect(() => { setPage(1); }, [mode]);
  useEffect(() => { setPage(1); }, [workerFilter, statusFilter]);

  const handleDeleteWorker = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    const result = await deleteWorker(deleteTarget.id);
    setBusy(false);
    if (!result.success) return setError(result.error);
    setError('');
    setDeleteTarget(null);
    if (selectedWorkerId === deleteTarget.id) setSelectedWorkerId(null);
    void refetch();
  };

  const handleRestoreWorker = async (worker: Worker) => {
    const result = await restoreWorker(worker.id);
    if (!result.success) return setError(result.error);
    setError('');
    void loadDeleted();
    void refetch();
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
    const isEmployee = data.workerType.toLowerCase() === 'employee';
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
      national_id: '',
      certificates: [],
      ...(isEmployee && data.weekly_availability && data.weekly_availability.length > 0
        ? { weekly_availability: data.weekly_availability }
        : {}),
    });
    if (!result.success) {
      return result.error;
    }
    const created = result.data as (typeof result.data & { id?: string; _id?: string }) | undefined;
    const newWorkerId = created?.worker_id || created?.id || created?._id || '';
    updateCache(newWorkerId, {
      full_name: data.name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      location: data.location,
      hourly_rate: rate,
      languages: data.languages,
      weekly_availability: data.weekly_availability,
    });
    void refetch();
    setAddModalOpen(false);
  };

  const handleUpdateWorker = async (workerId: string, input: UpdateWorkerInput, files: WorkerDocumentFiles): Promise<string | void> => {
    const result = await updateWorkerDetails(workerId, input);
    if (!result.success) {
      return result.error;
    }
    // Uploads run after the patch: a certificate upload appends to the list the patch
    // just wrote, so doing it the other way round would discard it.
    const uploadError = await uploadWorkerDocuments(workerId, [
      ['id_card_front', files.idCardFront],
      ['id_card_back', files.idCardBack],
      ['employee_contract_pdf', files.contract],
      ['certificate', files.certificate],
    ]);
    if (uploadError) return `Details saved, but a document failed to upload - ${uploadError}`;
    const updatedObj: Partial<import('@/services/actions/workers').WorkerApi> = {
      full_name: input.full_name || input.name,
      email: input.email,
      phone: input.phone || input.phone_number,
      position: input.position,
      base_location: input.base_location,
      location: input.base_location,
      hourly_rate: input.hourly_rate,
      languages: input.languages,
      status: input.status,
      national_id: input.national_id,
      certificates: input.certificates,
      ...(typeof result.data === 'object' && result.data ? result.data : {}),
    };
    updateCache(workerId, updatedObj);
    void refetch();
    setEditingWorker(null);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Search + Filters + Add */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder={t.workers.searchPlaceholder}
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
                {f === 'All Workers' ? t.common.allWorkers : f === 'Employees' ? t.workers.employees : t.workers.freelancers}
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
                {f === 'All' ? t.dashboard.all : f === 'Active' ? t.common.active : f === 'On Shift' ? t.dashboard.activeShifts : t.shiftMonitoring.missing}
              </button>
            ))}
          </div>
        </div>

        {/* Spacer + Add */}
        <div className="ml-auto flex gap-2">
          <div className="flex h-9 items-center rounded border border-gray-200 bg-white p-0.5 text-xs font-semibold">
            {(['active', 'deleted'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`h-full rounded px-3 transition-colors cursor-pointer ${mode === value ? 'bg-[#0ea5e9] text-white' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {value === 'active' ? 'Active' : 'Deleted'}
              </button>
            ))}
          </div>
          {/* Bulk import hidden for now - re-enable by uncommenting this button.
          <button onClick={() => setImportOpen(true)} className="flex h-9 items-center gap-1.5 rounded border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm hover:border-sky-300">
            <MdUploadFile className="text-lg text-sky-500" /> {t.common.bulkImport}
          </button>
          */}
          {mode === 'active' && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 h-9 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold rounded shadow-sm transition-colors cursor-pointer"
            >
              <MdAdd className="text-lg" />
              {t.workers.addWorker}
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        <StatCard icon={<MdPeople className="text-[#0ea5e9] text-2xl" />} value={counts.total} label={t.workers.totalWorkers} />
        <StatCard icon={<MdBadge className="text-[#6366f1] text-2xl" />} value={counts.employees} label={t.workers.employees} />
        <StatCard icon={<MdWorkOutline className="text-[#f59e0b] text-2xl" />} value={counts.freelancers} label={t.workers.freelancers} />

      </div>

      {/* Table */}
      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      {(mode === 'deleted' ? loadingDeleted : loading) ? (
        <div className="overflow-hidden rounded border border-slate-200 bg-white">
          <TableSkeleton rows={7} columns={7} />
        </div>
      ) : (
        <WorkersTable
          workers={filtered}
          mode={mode}
          onViewWorker={(w) => setSelectedWorkerId(w.id)}
          onEditWorker={(w) => setEditingWorker(w)}
          onChangeStatus={(w) => setStatusTarget(w)}
          onDeleteWorker={(w) => setDeleteTarget(w)}
          onRestoreWorker={(w) => void handleRestoreWorker(w)}
        />
      )}
      <BackendPagination page={page} limit={limit} total={mode === 'deleted' ? deletedTotal : counts.total} onPageChange={setPage} />

      {/* Sidebar */}
      {selectedWorker && (
        <WorkerDetailSidebar
          worker={selectedWorker}
          onClose={() => setSelectedWorkerId(null)}
          onEdit={(w) => {
            setSelectedWorkerId(null);
            setEditingWorker(w);
          }}
        />
      )}

      {/* Add Modal */}
      {addModalOpen && (
        <AddWorkerModal
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddWorker}
        />
      )}

      {/* Edit Modal */}
      {editingWorker && (
        <EditWorkerModal
          worker={editingWorker}
          onClose={() => setEditingWorker(null)}
          onUpdate={handleUpdateWorker}
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

      {statusTarget && (
        <WorkerStatusModal
          worker={statusTarget}
          onClose={() => setStatusTarget(null)}
          onUpdated={() => { setStatusTarget(null); void refetch(); }}
        />
      )}

      {deleteTarget && (
        <div onClick={() => setDeleteTarget(null)} className="modal-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div onClick={(event) => event.stopPropagation()} className="w-full max-w-sm rounded-md bg-white shadow-xl">
            <div className="flex items-start gap-3 px-5 py-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
                <MdWarningAmber className="text-lg" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900">Delete worker</h2>
                <p className="mt-1 text-xs text-gray-500">
                  <b className="text-gray-700">{deleteTarget.name}</b> will be moved to the deleted list. You can restore them later from the Deleted tab.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button onClick={() => setDeleteTarget(null)} className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => void handleDeleteWorker()}
                disabled={busy}
                className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {busy ? 'Deleting...' : 'Delete worker'}
              </button>
            </div>
          </div>
        </div>
      )}

      {importOpen && <BulkImportModal mode="workers" onImported={() => { setImportOpen(false); void refetch(); void loadPendingCount(); }} onClose={() => setImportOpen(false)} />}
    </div>
  );
}

function mapWorker(
  item: import('@/services/actions/workers').WorkerApi,
  cache: Record<string, Partial<import('@/services/actions/workers').WorkerApi>> = {}
): Worker {
  const cached = cache[item.worker_id] || {};
  const merged = { ...item, ...cached };

  const s = (merged.status || item.status || '').toLowerCase().replaceAll(' ', '_');
  let status: Worker['status'] = 'Active';
  if (s === 'on_shift') status = 'On Shift';
  else if (s === 'off_duty') status = 'Off Duty';
  else if (s === 'suspended') status = 'Suspended';
  else if (s === 'banned') status = 'Banned';
  else status = 'Active';

  const rawPhone = merged.phone || (merged as any).phone_number || (merged as any).mobile || (merged as any).mobile_number || (merged as any).phone_no || item.phone || (item as any).phone_number || (item as any).mobile || (item as any).mobile_number || (item as any).phone_no || '';
  const rawEmail = merged.email || (merged as any).email_address || item.email || (item as any).email_address || '';

  const rawAvailability =
    (merged as any).weekly_availability ||
    (item as any).weekly_availability ||
    (merged as any).availability?.weekly_availability ||
    (item as any).availability?.weekly_availability;
  const rawPreferredHours =
    (merged as any).preferred_hours_per_week ??
    (item as any).preferred_hours_per_week ??
    (merged as any).availability?.preferred_hours_per_week ??
    (item as any).availability?.preferred_hours_per_week;
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const computedWeeklyAvailability: boolean[] = Array.isArray(rawAvailability) && rawAvailability.length > 0
    ? dayOrder.map(d => rawAvailability.some((slot: any) => slot.day?.toLowerCase() === d && slot.is_available !== false))
    : (merged as any).weeklyAvailability || [];

  return {
    id: item.worker_id,
    code: item.worker_id,
    name: merged.full_name || merged.name || item.full_name || item.name || '',
    initials: (merged.full_name || merged.name || item.full_name || item.name || 'W').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    avatarColor: 'bg-sky-500',
    profilePhoto: merged.profile_photo || item.profile_photo || undefined,
    workerType: (merged.worker_type || item.worker_type || '').toLowerCase() === 'freelancer' ? 'Freelancer' : 'Employee',
    position: merged.position || item.position || '',
    location: merged.location || merged.base_location || item.location || item.base_location || '',
    hourlyRate: merged.hourly_rate ?? item.hourly_rate ?? 25,
    languages: merged.languages || item.languages || [],
    hours: item.hours_worked || '0h',
    status,
    email: rawEmail,
    phone: rawPhone,
    nationalId: merged.national_id || item.national_id,
    certificates: merged.certificates || item.certificates,
    completedShifts: 0,
    avgPhotoScore: 0,
    weeklyAvailability: computedWeeklyAvailability,
    weekly_availability: Array.isArray(rawAvailability) ? rawAvailability : [],
    preferred_hours_per_week: rawPreferredHours,
    monthlyHours: item.hours_worked || '0h',
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
}


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
      className={`bg-white rounded border shadow-sm px-6 py-5 flex items-center justify-between transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-amber-300' : 'hover:shadow'
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



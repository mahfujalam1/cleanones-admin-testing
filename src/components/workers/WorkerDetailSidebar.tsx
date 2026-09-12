"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineClose, MdEmail, MdPhone, MdLocationOn, MdDescription, MdEdit, MdAttachMoney, MdVisibility, MdPayments } from 'react-icons/md';
import { Worker, WorkerSidebarTab } from './types';
import { getWorker, type WorkerDetailsApi, type WorkerDocumentFile } from '@/services/actions/workers';
import { DocumentPreviewModal, fileLabel, isViewable } from './DocumentPreviewModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { getWorkerEarnings, type WorkerEarnings } from '@/services/actions/workerInvoices';
import { DetailSkeleton } from '@/components/shared/SkeletonLoader';

interface WorkerDetailSidebarProps {
  worker: Worker;
  onClose: () => void;
  onEdit?: (worker: Worker) => void;
}

const TABS: WorkerSidebarTab[] = [
  'General',
  'Performance',
  'Shifts',
  'Attendance',
  'Documents',
  'Invoices',
  'Availability',
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WorkerDetailSidebar({ worker, onClose, onEdit }: WorkerDetailSidebarProps) {
  const [activeTab, setActiveTab] = useState<WorkerSidebarTab>('General');
  const tabsRef = useRef<HTMLDivElement>(null);
  // The list response carries only a subset of the record, so the full profile is read
  // from the single-worker endpoint when the panel opens.
  const [details, setDetails] = useState<WorkerDetailsApi | null>(null);
  const [detailsError, setDetailsError] = useState('');
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setDetailsLoading(true);
    setDetails(null);
    setDetailsError('');
    void getWorker(worker.id).then((result) => {
      if (!active) return;
      setDetailsLoading(false);
      if (result.success) setDetails(result.data);
      else setDetailsError(result.error);
    });
    return () => { active = false; };
  }, [worker.id]);

  // Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const statusBadge = () => {
    switch (worker.status) {
      case 'On Shift':
        return 'text-[#10b981]';
      case 'Active':
        return 'text-[#10b981]';
      case 'Off Duty':
        return 'text-gray-400';
      case 'Suspended':
        return 'text-amber-500';
      case 'Banned':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const typeColor =
    worker.workerType === 'Employee'
      ? 'bg-[#0ea5e9]/15 text-[#0ea5e9]'
      : 'bg-[#8b5cf6]/15 text-[#8b5cf6]';

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fixed inset-0 z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col border-l border-gray-200 bg-white sm:w-[420px] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-[#1a2332] text-white p-5 relative flex-shrink-0">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              className="text-gray-400 hover:text-white cursor-pointer transition-colors p-1"
              onClick={onClose}
            >
              <MdOutlineClose className="text-xl" />
            </button>
          </div>

          <div className="flex items-center gap-3 pr-10">
            <img src={details?.profile_photo || '/avatar-placeholder.svg'} alt={worker.name} className="h-12 w-12 shrink-0 rounded-full border border-white/20 object-cover" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight truncate">{details?.full_name || worker.name}</h3>
              <div className="text-xs text-gray-400 font-medium mt-0.5 truncate">
                {(details?.position || worker.position) && `${details?.position || worker.position} · `}{worker.code}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`text-xs font-bold ${statusBadge()}`}>{worker.status}</div>
              <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColor}`}>
                {worker.workerType}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs — visible scrollbar */}
        <div
          ref={tabsRef}
          className="flex border-b border-gray-100 shrink-0 overflow-x-auto sidebar-tab-scroll"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-3 py-3 text-xs font-semibold transition-colors border-b-2 cursor-pointer text-center ${activeTab === tab
                  ? 'text-[#0ea5e9] border-[#0ea5e9]'
                  : 'text-gray-400 hover:text-gray-600 border-transparent'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'General' && <GeneralTab worker={worker} details={details} loading={detailsLoading} error={detailsError} onEdit={onEdit} />}
          {activeTab === 'Performance' && <PerformanceTab details={details} loading={detailsLoading} />}
          {activeTab === 'Shifts' && <ShiftsTab details={details} loading={detailsLoading} />}
          {activeTab === 'Attendance' && <AttendanceTab details={details} loading={detailsLoading} />}
          {activeTab === 'Documents' && <DocumentsTab worker={worker} details={details} loading={detailsLoading} />}
          {activeTab === 'Invoices' && <InvoicesTab worker={worker} />}
          {activeTab === 'Availability' && <AvailabilityTab worker={worker} details={details} loading={detailsLoading} />}
        </div>
      </div>

      {/* Thin visible scrollbar for tabs */}
      <style jsx global>{`
        .sidebar-tab-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .sidebar-tab-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .sidebar-tab-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .sidebar-tab-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .sidebar-tab-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
      `}</style>
    </>,
    document.body
  );
}

/* ─── General Tab ─────────────────────────────────────── */

function GeneralTab({ worker, details, loading, error, onEdit }: { worker: Worker; details: WorkerDetailsApi | null; loading: boolean; error: string; onEdit?: (worker: Worker) => void }) {
  const languages = details?.languages?.length ? details.languages : worker.languages;
  const location = details?.base_location || worker.location;
  const rate = details?.hourly_rate ?? worker.hourlyRate;

  return (
    <div className="p-5 space-y-5">
      {onEdit && (
        <button
          onClick={() => onEdit(worker)}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded border border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <MdEdit className="text-base" /> Edit Worker Details
        </button>
      )}

      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}

      <InfoCard
        icon={<MdEmail className="text-[#0ea5e9]" />}
        label="Email"
        value={
          (details?.email || worker.email) ? (
            <a href={`mailto:${details?.email || worker.email}`} className="text-[#0ea5e9] hover:underline text-sm font-medium break-all">
              {details?.email || worker.email}
            </a>
          ) : (
            <span className="text-sm text-gray-400 italic">Not set</span>
          )
        }
      />

      <InfoCard
        icon={<MdPhone className="text-[#10b981]" />}
        label="Phone"
        value={<span className="text-sm font-semibold text-gray-900">{details?.phone || worker.phone || 'N/A'}</span>}
      />

      <InfoCard
        icon={<MdAttachMoney className="text-[#8b5cf6]" />}
        label="Hourly Rate"
        value={<span className="text-sm font-semibold text-gray-900">{typeof rate === 'number' ? `€${rate.toFixed(2)}/hr` : 'N/A'}</span>}
      />

      <InfoCard
        icon={<MdLocationOn className="text-[#f59e0b]" />}
        label="Base Location"
        value={<span className="text-sm font-semibold text-gray-900">{location || 'N/A'}</span>}
      />

      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Languages</div>
        <div className="flex flex-wrap gap-2">
          {languages && languages.length > 0 ? (
            languages.map((lang) => (
              <span key={lang} className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#e0f2fe] text-[#0284c7]">
                {lang}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">None specified</span>
          )}
        </div>
      </div>

      {loading ? (
        <DetailSkeleton blocks={5} />
      ) : details ? (
        <>
          <Section title="Work">
            <Row label="Position" value={details.position || worker.position} />
            <Row label="Worker type" value={titleCase(details.worker_type) || worker.workerType} />
            <Row label="Status" value={titleCase(details.status)} />
            <Row label="Total shifts" value={details.total_shifts_count} />
            <Row label="Completed shifts" value={details.completed_shifts_count} />
            <Row label="Rating" value={typeof details.rating === 'number' ? `${details.rating} / 5` : undefined} />
          </Section>

          <Section title="Personal">
            <Row label="Nationality" value={details.nationality} />
            <Row label="Date of birth" value={formatDate(details.dob)} />
          </Section>

          <Section title="Account">
            <Row label="Account status" value={titleCase(details.account_status)} />
            <Row label="Approval" value={titleCase(details.approval_status)} />
            <Row label="Approved" value={formatBool(details.is_approved)} />
            <Row label="Profile completed" value={formatBool(details.is_profile_completed)} />
            <Row label="Signed up" value={formatBool(details.is_signup)} />
            <Row label="Temp password changed" value={formatBool(details.temp_password_changed)} />
            <Row label="Last login" value={formatDateTime(details.last_login_at)} />
            <Row label="Created" value={formatDateTime(details.created_at)} />
            <Row label="Last updated" value={formatDateTime(details.updated_at)} />
          </Section>
        </>
      ) : null}
    </div>
  );
}

const titleCase = (value?: string | null) => value ? value.replaceAll('_', ' ').split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';
const formatBool = (value?: boolean) => value === undefined ? undefined : value ? 'Yes' : 'No';
const formatDate = (value?: string | null) => { if (!value) return undefined; const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(); };
const formatDateTime = (value?: string | null) => { if (!value) return undefined; const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString(); };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</div>
      <div className="rounded border border-gray-100 bg-gray-50 divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2.5">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="text-xs font-semibold text-gray-900 text-right break-words">
        {value === undefined || value === null || value === '' ? <span className="font-normal text-gray-400 italic">Not set</span> : value}
      </span>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-lg shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</div>
        {value}
      </div>
    </div>
  );
}

/* ─── Performance Tab ─────────────────────────────────── */

function PerformanceTab({ details, loading }: { details: WorkerDetailsApi | null; loading: boolean }) {
  if (loading) return <div className="p-5"><DetailSkeleton blocks={4} /></div>;

  const total = details?.total_shifts_count ?? 0;
  const completed = details?.completed_shifts_count ?? 0;
  const rating = details?.rating;
  // Share of assigned shifts actually finished, the closest thing to a reliability score.
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Total Shifts" value={total} />
        <StatBox label="Completed" value={completed} tone="text-[#10b981]" />
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded p-5">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rating</div>
        <div className="text-3xl font-bold text-gray-900">
          {typeof rating === 'number' ? rating.toFixed(1) : 'N/A'}
          <span className="text-lg text-gray-400 font-medium">/5</span>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Completion Rate</div>
            <div className="text-3xl font-bold text-gray-900">{completionRate}<span className="text-lg text-gray-400 font-medium">%</span></div>
          </div>
          <div className="text-[11px] text-gray-400">{completed} of {total} shifts</div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-[#0ea5e9] transition-all" style={{ width: `${completionRate}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Late Days" value={details?.attendance_summary?.late_days ?? 0} tone="text-[#f59e0b]" />
        <StatBox label="Absent Days" value={details?.attendance_summary?.absent_days ?? 0} tone="text-[#ef4444]" />
      </div>
    </div>
  );
}

function StatBox({ label, value, tone = 'text-gray-900' }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded p-4 text-center">
      <div className={`text-xl font-bold ${tone}`}>{value}</div>
      <div className="text-[10px] text-gray-400 font-semibold mt-1">{label}</div>
    </div>
  );
}

const shiftStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'text-[#10b981]';
    case 'in progress': return 'text-[#0ea5e9]';
    case 'upcoming': return 'text-[#f59e0b]';
    default: return 'text-gray-500';
  }
};

function ShiftsTab({ details, loading }: { details: WorkerDetailsApi | null; loading: boolean }) {
  if (loading) return <div className="p-5"><DetailSkeleton blocks={5} /></div>;

  const shifts = details?.shifts ?? [];
  const summary = details?.shifts_summary;

  return (
    <div className="p-5 space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Completed" value={summary?.completed ?? 0} />
        <StatBox label="In Progress" value={summary?.in_progress ?? 0} tone="text-[#0ea5e9]" />
        <StatBox label="Upcoming" value={summary?.upcoming ?? 0} tone="text-[#f59e0b]" />
      </div>

      {shifts.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">No shifts recorded</p>
      ) : (
        <div className="bg-white rounded border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_0.6fr_0.9fr] gap-1 px-4 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <div>Date</div>
            <div>Location</div>
            <div>Hours</div>
            <div className="text-right">Status</div>
          </div>
          <div className="divide-y divide-gray-50">
            {shifts.map((shift) => (
              <div key={shift.shift_id} className="grid grid-cols-[1fr_1fr_0.6fr_0.9fr] gap-1 items-center px-4 py-3.5 hover:bg-gray-50/60 transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{formatDate(shift.date) || shift.date}</div>
                  <div className="text-[10px] text-gray-400 truncate">{shift.shift_id}</div>
                </div>
                <div className="text-xs text-gray-500 truncate" title={shift.location}>{shift.location}</div>
                <div className="text-sm font-semibold text-gray-900">{shift.hours}</div>
                <div className={`text-xs font-semibold text-right ${shiftStatusColor(shift.status)}`}>{shift.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const attendanceStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'on time': return 'text-[#10b981]';
    case 'late': return 'text-[#ef4444]';
    case 'absent': return 'text-gray-400';
    default: return 'text-gray-500';
  }
};

function AttendanceTab({ details, loading }: { details: WorkerDetailsApi | null; loading: boolean }) {
  if (loading) return <div className="p-5"><DetailSkeleton blocks={5} /></div>;

  const records = details?.attendance ?? [];
  const summary = details?.attendance_summary;

  return (
    <div className="p-5 space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="This Month" value={summary?.this_month_hours ?? '0h'} />
        <StatBox label="Late Days" value={summary?.late_days ?? 0} tone="text-[#f59e0b]" />
        <StatBox label="Absent Days" value={summary?.absent_days ?? 0} tone="text-[#ef4444]" />
      </div>

      {records.length === 0 ? (
        <p className="py-10 text-center text-xs text-gray-400">No attendance recorded</p>
      ) : (
        <div className="bg-white rounded border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.6fr_0.8fr] gap-1 px-4 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <div>Date</div>
            <div>Check-In</div>
            <div>Check-Out</div>
            <div>Hours</div>
            <div className="text-right">Status</div>
          </div>
          <div className="divide-y divide-gray-50">
            {records.map((record, index) => (
              <div key={`${record.shift_id}-${index}`} className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.6fr_0.8fr] gap-1 items-center px-4 py-3.5 hover:bg-gray-50/60 transition-colors">
                <div className="text-sm font-medium text-gray-900">{formatDate(record.date) || record.date}</div>
                <div className="text-sm text-gray-700">{record.check_in}</div>
                <div className="text-sm text-gray-700">{record.check_out}</div>
                <div className="text-sm font-semibold text-gray-900">{record.hours}</div>
                <div className={`text-xs font-semibold text-right ${attendanceStatusColor(record.status)}`}>{record.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ worker, details, loading }: { worker: Worker; details: WorkerDetailsApi | null; loading: boolean }) {
  const [preview, setPreview] = useState<WorkerDocumentFile | null>(null);

  // The API returns a ready-made documents list; the individual url fields are the
  // fallback for older records that predate it.
  const files: WorkerDocumentFile[] = details?.documents?.length
    ? details.documents
    : [
        { name: 'ID Card Front', type: 'id_card_front', url: details?.id_card_front ?? '' },
        { name: 'ID Card Back', type: 'id_card_back', url: details?.id_card_back ?? '' },
        ...(details?.certificates ?? []).map((url, index) => ({ name: `Certificate ${index + 1}`, type: 'certificate', url })),
      ];

  // Records created before real uploads existed hold placeholder text rather than a file.
  const uploaded = files.filter((file) => isViewable(file.url));

  if (loading) return <div className="p-5"><DetailSkeleton blocks={3} /></div>;

  if (uploaded.length === 0 && worker.documents.length === 0) {
    return <p className="p-8 text-center text-xs text-gray-400">No documents uploaded</p>;
  }

  return (
    <div className="p-5 space-y-3">
      {uploaded.map((file, index) => (
        <button
          key={`${file.type}-${index}`}
          type="button"
          onClick={() => setPreview(file)}
          className="w-full bg-gray-50 border border-gray-100 rounded p-4 flex items-center gap-3 text-left hover:bg-gray-100/60 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded bg-[#e0f2fe] flex items-center justify-center shrink-0">
            <MdDescription className="text-[#0ea5e9] text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900">{file.name}</div>
            <div className="text-[11px] text-gray-400 mt-0.5 truncate">{fileLabel(file.url)}</div>
          </div>
          <MdVisibility className="text-[#0ea5e9] text-lg shrink-0" />
        </button>
      ))}
      {preview && <DocumentPreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}


/* ─── Invoices Tab ────────────────────────────────────── */

const money = (value?: number) => `€${(value ?? 0).toFixed(2)}`;

const invoiceStatusColor = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'paid': return 'text-[#10b981]';
    case 'partial': return 'text-[#f59e0b]';
    case 'processing': return 'text-[#0ea5e9]';
    case 'pending': return 'text-[#ef4444]';
    default: return 'text-gray-500';
  }
};

function InvoicesTab({ worker }: { worker: Worker }) {
  const [earnings, setEarnings] = useState<WorkerEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getWorkerEarnings(worker.id);
    setLoading(false);
    if (!result.success) return setError(result.error);
    setError('');
    setEarnings(result.data);
  }, [worker.id]);

  useEffect(() => { void load(); }, [load]);

  // Gross is rate x hours worked; what is left is that minus everything paid out so far.
  const rate = earnings?.hourly_rate ?? worker.hourlyRate ?? 0;
  const hours = earnings?.total_hours_worked ?? 0;
  const totalEarned = earnings?.gross_earnings ?? rate * hours;
  const paid = earnings?.total_paid ?? 0;
  const remaining = earnings?.balance_due ?? Math.max(totalEarned - paid, 0);
  const fullyPaid = remaining <= 0;
  const invoices = earnings?.invoices ?? [];

  if (loading) return <div className="p-5"><DetailSkeleton blocks={5} /></div>;

  return (
    <div className="p-5 space-y-5">
      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#e0f7fa] border border-[#b2ebf2] rounded p-4 text-center">
          <div className="text-lg font-bold text-[#0ea5e9]">{money(totalEarned)}</div>
          <div className="text-[10px] text-[#0ea5e9] font-semibold mt-1">Total Earned</div>
        </div>
        <div className="bg-[#e8f5e9] border border-[#c8e6c9] rounded p-4 text-center">
          <div className="text-lg font-bold text-[#10b981]">{money(paid)}</div>
          <div className="text-[10px] text-[#10b981] font-semibold mt-1">Paid</div>
        </div>
        <div className="bg-[#fff3e0] border border-[#ffe0b2] rounded p-4 text-center">
          <div className="text-lg font-bold text-[#f59e0b]">{money(remaining)}</div>
          <div className="text-[10px] text-[#f59e0b] font-semibold mt-1">Remaining</div>
        </div>
      </div>

      {/* How the total was reached */}
      <div className="rounded border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>{earnings?.month_name || 'This month'}</span>
          <span className="font-semibold text-gray-700">
            {hours}h × {money(rate)}/hr = {money(totalEarned)}
          </span>
        </div>
        {Boolean(earnings?.total_shifts_worked) && (
          <div className="mt-1 text-[11px] text-gray-400">{earnings?.total_shifts_worked} shift(s) worked</div>
        )}
      </div>

      {/* Nothing left to pay for the period, so block further payouts rather than letting
          the worker be overpaid. */}
      <button
        type="button"
        disabled={fullyPaid}
        title={fullyPaid ? 'Everything earned this period has already been paid' : undefined}
        onClick={() => setRecording(true)}
        className="flex w-full items-center justify-center gap-2 rounded border border-[#0ea5e9] px-4 py-2 text-xs font-semibold text-[#0ea5e9] transition-colors hover:bg-[#0ea5e9] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 cursor-pointer"
      >
        <MdPayments className="text-base" /> {fullyPaid ? 'Fully paid for this period' : 'Record payment'}
      </button>

      {/* Table */}
      {invoices.length === 0 ? (
        <p className="py-8 text-center text-xs text-gray-400">No payments recorded yet</p>
      ) : (
        <div className="bg-white rounded border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[1.4fr_0.6fr_0.7fr_0.8fr_0.8fr] gap-1 px-4 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <div>Invoice #</div>
            <div>Hours</div>
            <div>Rate</div>
            <div>Amount</div>
            <div className="text-right">Status</div>
          </div>
          <div className="divide-y divide-gray-50">
            {invoices.map((invoice) => (
              <div key={invoice.invoice_id} className="grid grid-cols-[1.4fr_0.6fr_0.7fr_0.8fr_0.8fr] gap-1 items-center px-4 py-3.5 hover:bg-gray-50/60 transition-colors">
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-gray-900">{invoice.invoice_number || invoice.invoice_id}</div>
                  {invoice.paid_at && <div className="text-[10px] text-gray-400">{formatDate(invoice.paid_at)}</div>}
                </div>
                <div className="text-xs text-gray-700">{invoice.hours_worked ?? 0}h</div>
                <div className="text-xs text-gray-700">{money(invoice.hourly_rate)}</div>
                <div className="text-xs font-semibold text-gray-900">{money(invoice.net_payout)}</div>
                <div className={`text-xs font-semibold text-right capitalize ${invoiceStatusColor(invoice.status)}`}>
                  {invoice.status || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recording && (
        <RecordPaymentModal
          workerId={worker.id}
          workerName={worker.name}
          earnings={earnings}
          onClose={() => setRecording(false)}
          onRecorded={() => { setRecording(false); void load(); }}
        />
      )}
    </div>
  );
}

/* ─── Availability Tab ────────────────────────────────── */

function AvailabilityTab({
  worker,
  details,
  loading,
}: {
  worker: Worker;
  details: WorkerDetailsApi | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="p-5 space-y-4 animate-pulse">
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-44 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const availabilityObj = details?.availability;
  const availabilityList =
    availabilityObj?.weekly_availability ||
    details?.weekly_availability ||
    worker.weekly_availability ||
    [];
  const preferredHours =
    availabilityObj?.preferred_hours_per_week ??
    details?.preferred_hours_per_week ??
    worker.preferred_hours_per_week;
  const leaveRequests = availabilityObj?.leave_requests ?? [];

  const daysSchedule = [
    { key: "monday", label: "Mon", full: "Monday" },
    { key: "tuesday", label: "Tue", full: "Tuesday" },
    { key: "wednesday", label: "Wed", full: "Wednesday" },
    { key: "thursday", label: "Thu", full: "Thursday" },
    { key: "friday", label: "Fri", full: "Friday" },
    { key: "saturday", label: "Sat", full: "Saturday" },
    { key: "sunday", label: "Sun", full: "Sunday" },
  ].map((d, i) => {
    const slot = availabilityList.find((s) => s.day?.toLowerCase() === d.key);
    const isAvailable = slot ? slot.is_available : (worker.weeklyAvailability?.[i] ?? false);
    const startTime = slot?.start_time || "08:00 AM";
    const endTime = slot?.end_time || "05:00 PM";
    return { ...d, isAvailable, startTime, endTime };
  });

  const availableCount = daysSchedule.filter((d) => d.isAvailable).length;

  return (
    <div className="p-5 space-y-4">
      {/* Summary Card */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-bold text-gray-800">Weekly Working Days</div>
            <div className="text-[11px] text-gray-500">{availableCount} of 7 days available</div>
          </div>
          {preferredHours !== undefined && preferredHours > 0 && (
            <span className="inline-flex items-center rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 border border-sky-100">
              {preferredHours} hrs / week
            </span>
          )}
        </div>

        {/* Quick Circles Row */}
        <div className="flex gap-2 flex-wrap pt-1">
          {daysSchedule.map((d) => (
            <div
              key={d.key}
              title={`${d.full}: ${d.isAvailable ? `${d.startTime} - ${d.endTime}` : 'Day Off'}`}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                d.isAvailable
                  ? "bg-[#0ea5e9] text-white shadow-xs"
                  : "bg-white text-gray-400 border border-gray-200"
              }`}
            >
              {d.label}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Schedule Breakdown */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            Daily Hours Schedule
          </span>
          <span className="text-[10px] text-gray-400 font-medium">Standard Hours</span>
        </div>
        <div className="divide-y divide-gray-100">
          {daysSchedule.map((d) => (
            <div key={d.key} className="flex items-center justify-between px-4 py-2.5 text-xs">
              <span className="font-semibold text-gray-800 w-24">{d.full}</span>
              <div className="flex-1 text-center">
                {d.isAvailable ? (
                  <span className="text-gray-700 font-medium">
                    {d.startTime} – {d.endTime}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Day Off</span>
                )}
              </div>
              <div className="w-20 text-right">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                    d.isAvailable
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {d.isAvailable ? "Available" : "Off"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Requests (if any) */}
      {leaveRequests.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              Leave Requests
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              {leaveRequests.length} request(s)
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {leaveRequests.map((leave, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-xs">
                <div>
                  <div className="font-semibold text-gray-800">
                    {leave.start_date} – {leave.end_date}
                  </div>
                  {leave.reason && (
                    <div className="text-[11px] text-gray-400">{leave.reason}</div>
                  )}
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">
                  {leave.status || "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

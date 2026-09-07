"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineClose, MdEmail, MdPhone, MdLocationOn, MdDescription, MdEdit, MdAttachMoney } from 'react-icons/md';
import { Worker, WorkerSidebarTab } from './types';

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
            {onEdit && (
              <button
                onClick={() => onEdit(worker)}
                className="flex items-center gap-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded transition-colors cursor-pointer"
                title="Edit Worker Details"
              >
                <MdEdit className="text-sm" /> Edit
              </button>
            )}
            <button
              className="text-gray-400 hover:text-white cursor-pointer transition-colors p-1"
              onClick={onClose}
            >
              <MdOutlineClose className="text-xl" />
            </button>
          </div>

          <div className="flex items-center gap-3 pr-20">
            <img src="/avatar-placeholder.svg" alt={worker.name} className="h-12 w-12 shrink-0 rounded-full border border-white/20 object-cover" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight truncate">{worker.name}</h3>
              <div className="text-xs text-gray-400 font-medium mt-0.5">
                {worker.position} · {worker.code}
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
          {activeTab === 'General' && <GeneralTab worker={worker} onEdit={onEdit} />}
          {activeTab === 'Performance' && <PerformanceTab worker={worker} />}
          {activeTab === 'Shifts' && <ShiftsTab worker={worker} />}
          {activeTab === 'Attendance' && <AttendanceTab worker={worker} />}
          {activeTab === 'Documents' && <DocumentsTab worker={worker} />}
          {activeTab === 'Invoices' && <InvoicesTab worker={worker} />}
          {activeTab === 'Availability' && <AvailabilityTab worker={worker} />}
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

function GeneralTab({ worker, onEdit }: { worker: Worker; onEdit?: (worker: Worker) => void }) {
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

      {/* Email */}
      <InfoCard
        icon={<MdEmail className="text-[#0ea5e9]" />}
        label="Email"
        value={
          worker.email ? (
            <a href={`mailto:${worker.email}`} className="text-[#0ea5e9] hover:underline text-sm font-medium">
              {worker.email}
            </a>
          ) : (
            <span className="text-sm text-gray-400 italic">Not set</span>
          )
        }
      />

      {/* Phone */}
      <InfoCard
        icon={<MdPhone className="text-[#10b981]" />}
        label="Phone"
        value={<span className="text-sm font-semibold text-gray-900">{worker.phone || 'N/A'}</span>}
      />

      {/* Hourly Rate */}
      <InfoCard
        icon={<MdAttachMoney className="text-[#8b5cf6]" />}
        label="Hourly Rate"
        value={<span className="text-sm font-semibold text-gray-900">€{worker.hourlyRate ?? 25}/hr</span>}
      />

      {/* Location */}
      <InfoCard
        icon={<MdLocationOn className="text-[#f59e0b]" />}
        label="Location"
        value={<span className="text-sm font-semibold text-gray-900">{worker.location || 'N/A'}</span>}
      />

      {/* Languages */}
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Languages</div>
        <div className="flex flex-wrap gap-2">
          {worker.languages && worker.languages.length > 0 ? (
            worker.languages.map((lang) => (
              <span key={lang} className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#e0f2fe] text-[#0284c7]">
                {lang}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">None specified</span>
          )}
        </div>
      </div>

      {/* Position */}
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Position</div>
        <div className="text-sm font-semibold text-gray-900">{worker.position || 'N/A'}</div>
      </div>
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

function PerformanceTab({ worker }: { worker: Worker }) {
  return (
    <div className="p-5 space-y-4">
      <div className="bg-gray-50 border border-gray-100 rounded p-5">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Completed Shifts</div>
        <div className="text-3xl font-bold text-gray-900">{worker.completedShifts}</div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded p-5">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Photo Score</div>
        <div className="text-3xl font-bold text-gray-900">
          {worker.avgPhotoScore}
          <span className="text-lg text-gray-400 font-medium">/100</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Shifts Tab ──────────────────────────────────────── */

function ShiftsTab({ worker }: { worker: Worker }) {
  const completed = worker.shiftRecords.filter(s => s.status === 'Completed').length;
  const inProgress = worker.shiftRecords.filter(s => s.status === 'In Progress').length;
  const upcoming = worker.shiftRecords.filter(s => s.status === 'Upcoming').length;

  const shiftStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-[#10b981]';
      case 'In Progress': return 'text-[#0ea5e9]';
      case 'Upcoming': return 'text-[#f59e0b]';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-5 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 border border-gray-100 rounded p-4 text-center">
          <div className="text-xl font-bold text-gray-900">{completed}</div>
          <div className="text-[10px] text-gray-400 font-semibold mt-1">Completed</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded p-4 text-center">
          <div className="text-xl font-bold text-[#0ea5e9]">{inProgress}</div>
          <div className="text-[10px] text-gray-400 font-semibold mt-1">In Progress</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded p-4 text-center">
          <div className="text-xl font-bold text-[#f59e0b]">{upcoming}</div>
          <div className="text-[10px] text-gray-400 font-semibold mt-1">Upcoming</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_0.7fr_0.8fr] gap-1 px-4 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <div>Date</div>
          <div>Location</div>
          <div>Hours</div>
          <div className="text-right">Status</div>
        </div>
        <div className="divide-y divide-gray-50">
          {worker.shiftRecords.map((shift, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_0.7fr_0.8fr] gap-1 items-center px-4 py-3.5 hover:bg-gray-50/60 transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-900">{shift.date}</div>
                <div className="text-[10px] text-gray-400">{shift.startTime} – {shift.endTime}</div>
              </div>
              <div className="text-xs text-gray-500 truncate">{shift.location}</div>
              <div className="text-sm font-semibold text-gray-900">{shift.hours}</div>
              <div className={`text-xs font-semibold text-right ${shiftStatusColor(shift.status)}`}>{shift.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Attendance Tab ──────────────────────────────────── */

function AttendanceTab({ worker }: { worker: Worker }) {
  const attendanceStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': return 'text-[#10b981]';
      case 'Late': return 'text-[#ef4444]';
      case 'Absent': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-5 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 border border-gray-100 rounded p-4 text-center">
          <div className="text-xl font-bold text-gray-900">{worker.monthlyHours}</div>
          <div className="text-[10px] text-[#0ea5e9] font-semibold mt-1">This Month</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded p-4 text-center">
          <div className="text-xl font-bold text-gray-900">{worker.lateDays}</div>
          <div className="text-[10px] text-[#f59e0b] font-semibold mt-1">Late Days</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded p-4 text-center">
          <div className="text-xl font-bold text-gray-900">{worker.absentDays}</div>
          <div className="text-[10px] text-[#ef4444] font-semibold mt-1">Absent Days</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr_0.8fr] gap-1 px-4 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <div>Date</div>
          <div>Check-In</div>
          <div>Check-Out</div>
          <div>Hours</div>
          <div className="text-right">Status</div>
        </div>
        <div className="divide-y divide-gray-50">
          {worker.attendanceRecords.map((record, i) => (
            <div key={i} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr_0.8fr] gap-1 items-center px-4 py-3.5 hover:bg-gray-50/60 transition-colors">
              <div className="text-sm font-medium text-gray-900">{record.date}</div>
              <div className="text-sm text-gray-700">{record.checkIn}</div>
              <div className="text-sm text-gray-700">{record.checkOut}</div>
              <div className="text-sm font-semibold text-gray-900">{record.hours}</div>
              <div className={`text-xs font-semibold text-right ${attendanceStatusColor(record.status)}`}>{record.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Documents Tab ───────────────────────────────────── */

function DocumentsTab({ worker }: { worker: Worker }) {
  return (
    <div className="p-5 space-y-3">
      {worker.documents.map((doc, i) => (
        <div
          key={i}
          className="bg-gray-50 border border-gray-100 rounded p-4 flex items-center gap-3 hover:bg-gray-100/60 transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded bg-[#e0f2fe] flex items-center justify-center shrink-0">
            <MdDescription className="text-[#0ea5e9] text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900">{doc.title}</div>
            <div className="text-[11px] text-gray-400 mt-0.5 truncate">{doc.filename} · {doc.date}</div>
          </div>
          <span className="text-xs font-semibold text-[#10b981] shrink-0">{doc.status}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Invoices Tab ────────────────────────────────────── */

function InvoicesTab({ worker }: { worker: Worker }) {
  return (
    <div className="p-5 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#e0f7fa] border border-[#b2ebf2] rounded p-4 text-center">
          <div className="text-lg font-bold text-[#0ea5e9]">€{worker.totalEarned}</div>
          <div className="text-[10px] text-[#0ea5e9] font-semibold mt-1">Total Earned</div>
        </div>
        <div className="bg-[#e8f5e9] border border-[#c8e6c9] rounded p-4 text-center">
          <div className="text-lg font-bold text-[#10b981]">€{worker.totalPaid}</div>
          <div className="text-[10px] text-[#10b981] font-semibold mt-1">Paid</div>
        </div>
        <div className="bg-[#fff3e0] border border-[#ffe0b2] rounded p-4 text-center">
          <div className="text-lg font-bold text-[#f59e0b]">€{worker.remaining}</div>
          <div className="text-[10px] text-[#f59e0b] font-semibold mt-1">Remaining</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[1.2fr_0.6fr_0.6fr_0.7fr_0.8fr] gap-1 px-4 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <div>Invoice #</div>
          <div>Hours</div>
          <div>Rate</div>
          <div>Amount</div>
          <div className="text-right">Status</div>
        </div>
        <div className="divide-y divide-gray-50">
          {worker.invoices.map((inv, i) => (
            <div key={i} className="grid grid-cols-[1.2fr_0.6fr_0.6fr_0.7fr_0.8fr] gap-1 items-center px-4 py-3.5 hover:bg-gray-50/60 transition-colors">
              <div className="text-sm font-semibold text-[#0ea5e9]">{inv.invoiceNo}</div>
              <div className="text-sm text-gray-700">{inv.hours}</div>
              <div className="text-sm text-gray-500">{inv.rate}</div>
              <div className="text-sm font-bold text-gray-900">{inv.amount}</div>
              <div className="text-right">
                {inv.status === 'Paid' ? (
                  <span className="text-xs font-semibold text-[#10b981]">Paid</span>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs font-semibold text-[#f59e0b]">Pending</span>
                    <button className="text-[10px] font-semibold text-[#0ea5e9] border border-[#0ea5e9] rounded px-2 py-1 hover:bg-[#0ea5e9] hover:text-white transition-colors cursor-pointer">
                      Mark Paid
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Availability Tab ────────────────────────────────── */

function AvailabilityTab({ worker }: { worker: Worker }) {
  return (
    <div className="p-5">
      <div className="bg-gray-50 border border-gray-100 rounded p-5">
        <div className="text-xs font-semibold text-gray-600 mb-4">Weekly Availability</div>
        <div className="flex gap-2 flex-wrap">
          {DAY_LABELS.map((day, i) => {
            const isAvailable = worker.weeklyAvailability[i];
            return (
              <div
                key={day}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isAvailable
                    ? 'bg-[#0ea5e9] text-white shadow-sm'
                    : 'bg-white text-gray-400 border border-gray-200'
                  }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineClose, MdArrowForward, MdLocationOn } from 'react-icons/md';
import { TbClock, TbCalendarStats, TbHourglass, TbUserPlus, TbPencil } from 'react-icons/tb';
import { useRouter } from 'next/navigation';
import { WorkerInfo } from './types';
import { useGetShiftAttendanceSummaryQuery, type Period } from '@/redux/api/shiftsApi';
import { DetailSkeleton } from '@/components/shared/SkeletonLoader';
import { planIdFromShift } from '@/components/roster/types';
import { PlanForm } from '@/components/cleaningPlans/PlanForm';
import { AssignWorkersModal } from '@/components/cleaningPlans/AssignWorkersModal';
import { useGetCleaningPlanQuery } from '@/redux/api/endpoints/cleaningPlans.api';
import { useModalJump } from '@/hooks/useModalJump';

interface EmployeeDetailsModalProps {
  worker: WorkerInfo;
  onClose: () => void;
  onChanged?: () => void;
}

/**
 * Check-in/out come back either as a short clock label ("10:39") or as a raw timestamp
 * ("2026-09-08T10:45:06.089000"). The time portion is read straight off the string rather
 * than parsed into a Date, so the value shown matches what the API reports elsewhere
 * instead of being shifted into the browser's timezone.
 */
const formatTime = (value?: string | null) => {
  if (!value) return '--:--';
  const timestamp = /T(\d{2}):(\d{2})/.exec(value);
  if (timestamp) return `${timestamp[1]}:${timestamp[2]}`;
  return value;
};

const statusTone = (status: string) => {
  const value = status.toLowerCase();
  if (value.includes('late')) return 'bg-amber-50 text-amber-700 ring-amber-200';
  if (value.includes('missing') || value.includes('no')) return 'bg-red-50 text-red-700 ring-red-200';
  return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
};

export function EmployeeDetailsModal({ worker, onClose, onChanged }: EmployeeDetailsModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Today' | 'Weekly' | 'Monthly'>('Today');
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { triggerJump, jumpClassName } = useModalJump();

  // Live-status shifts generated from a cleaning plan carry the plan id, which is what makes
  // editing and reassigning possible from here without a shift-level endpoint.
  const planId = planIdFromShift(String(worker.shiftId));
  // The shared plan modals take the record, not the id, and going through RTK means the
  // cleaning-plan caches invalidate on save instead of needing a page reload.
  const { data: planRecord } = useGetCleaningPlanQuery(planId, { skip: !planId });

  const period = activeTab.toLowerCase() as Period;
  const { data: summary, isLoading: loading } = useGetShiftAttendanceSummaryQuery(
    { workerId: String(worker.id), period },
    { skip: !worker.id },
  );

  const hoursWorked = summary ? `${summary.total_hours}h` : '0h';
  const shiftsCount = summary?.completed_shifts ?? 0;
  const avgDuration =
    summary && summary.completed_shifts > 0
      ? `${(summary.total_hours / summary.completed_shifts).toFixed(1)}h`
      : '0h';

  /**
   * The per-shift breakdown and the live check-in/check-out pair have no endpoint in the
   * current API, so those stay blank until one lands.
   */
  const rows: Array<{ date: string; checkIn: string; checkOut: string; scheduled: string; hours: string }> = [];

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          triggerJump();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white animate-in fade-in zoom-in-95 duration-150 ${jumpClassName}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="flex shrink-0 items-start gap-3 border-b border-slate-200 px-5 py-4">
          <img src="/avatar-placeholder.svg" alt={worker.name} className="h-11 w-11 shrink-0 rounded-full border border-slate-200 object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-bold text-slate-900">{worker.name}</h3>
              <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${statusTone(worker.status)}`}>
                {worker.status}
              </span>
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
              <span>{worker.role}</span>
              {worker.location && <span className="flex items-center gap-1"><MdLocationOn className="text-sm text-slate-400" />{worker.location}</span>}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-slate-400">{worker.shiftId}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close worker details"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <MdOutlineClose className="text-lg" />
          </button>
        </header>

        {/* Period tabs */}
        <div className="flex shrink-0 gap-1 border-b border-slate-200 px-5 pt-3">
          {(['Today', 'Weekly', 'Monthly'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer border-b-2 px-4 pb-2.5 text-xs font-semibold transition-colors ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? <DetailSkeleton blocks={5} /> : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <Stat icon={<TbClock />} value={hoursWorked} label="Hours worked" />
                <Stat icon={<TbCalendarStats />} value={String(shiftsCount)} label="Shifts" />
                <Stat icon={<TbHourglass />} value={avgDuration} label="Avg duration" />
              </div>

              {activeTab === 'Today' ? (
                <section className="overflow-hidden rounded-xl border border-slate-200">
                  <h4 className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Shift details
                  </h4>
                  <dl className="divide-y divide-slate-100 text-sm">
                    <Row label="Check-in" value={formatTime(undefined)} />
                    <Row
                      label="Check-out"
                      value={'Still on shift'}
                      tone={'text-amber-600'}
                    />
                    <Row label="Duration" value={'0h'} tone="text-primary" />
                    <Row label="Status" value={worker.status} />
                  </dl>
                </section>
              ) : (
                <section className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <span className="w-28">Date</span>
                    <span className="flex-1 text-center">Check-in</span>
                    <span className="flex-1 text-center">Check-out</span>
                    <span className="w-16 text-right">Hours</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-sm">
                    {rows.length === 0 ? (
                      <p className="py-10 text-center text-xs text-slate-400">No shifts in this period</p>
                    ) : rows.map((row, index) => (
                      <div key={`${row.date}-${index}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
                        <span className="w-28 min-w-0">
                          <b className="block truncate text-xs font-semibold text-slate-700">{row.date}</b>
                          <small className="block truncate text-[10px] text-slate-400">{row.scheduled}</small>
                        </span>
                        <span className="flex-1 text-center text-xs text-slate-500">{row.checkIn}</span>
                        <span className="flex-1 text-center text-xs text-slate-500">{row.checkOut}</span>
                        <span className="w-16 text-right text-xs font-bold text-slate-900">{row.hours}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-200 px-5 py-3">
          <button
            onClick={() => router.push(`/shift-monitoring/history/${worker.id}`)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            View activity history <MdArrowForward className="text-sm" />
          </button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {planId && (
              <>
                <button
                  onClick={() => setAssigning(true)}
                  className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <TbUserPlus className="text-sm" /> Assign workers
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0284c7]"
                >
                  <TbPencil className="text-sm" /> Edit shift
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </footer>
      </div>

      {editing && planRecord && (
        <PlanForm
          key={planRecord._id}
          plan={planRecord}
          onClose={() => { setEditing(false); onChanged?.(); }}
        />
      )}

      {assigning && planId && (
        <AssignWorkersModal
          target={{
            planId,
            date: new Date().toISOString().slice(0, 10),
            planTitle: planRecord?.title,
            locationName: worker.location,
          }}
          onClose={() => { setAssigning(false); onChanged?.(); }}
        />
      )}
    </div>,
    document.body,
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <span className="mx-auto flex w-fit text-base text-primary">{icon}</span>
      <p className="mt-1 text-lg font-bold leading-tight text-slate-900">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={`text-xs font-semibold ${tone ?? 'text-slate-900'}`}>{value}</dd>
    </div>
  );
}

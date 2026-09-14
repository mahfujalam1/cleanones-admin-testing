"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineClose, MdLocationOn, MdAccessTime, MdTrendingUp } from 'react-icons/md';
import { TbClock, TbCalendarStats, TbBuildingSkyscraper, TbUsers, TbUserCheck, TbArrowUpRight } from 'react-icons/tb';
import { useRouter } from 'next/navigation';
import { useGetLiveStatusQuery } from '@/redux/api/shiftMonitoringApi';
import type { Period } from '@/services/actions/shiftMonitoring';
import { useModalJump } from '@/hooks/useModalJump';

export interface LocationItem {
  location_id: string;
  location_name: string;
  client_id: string;
  client_name: string;
  workers_count: number;
  hours_worked: string;
  hours_worked_numeric: number;
  shifts_count: number;
}

interface LocationDetailsModalProps {
  location: LocationItem;
  period: Period;
  onClose: () => void;
}

const statusTone = (status: string) => {
  const value = status.toLowerCase();
  if (value.includes('late')) return 'bg-amber-50 text-amber-700 ring-amber-200';
  if (value.includes('missing') || value.includes('no')) return 'bg-red-50 text-red-700 ring-red-200';
  return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
};

export function LocationDetailsModal({ location, period, onClose }: LocationDetailsModalProps) {
  const router = useRouter();

  // Query live shift status to see which workers are active right now at this location
  const { data: liveRes, isLoading: loadingLive } = useGetLiveStatusQuery({
    search: location.location_name,
  });

  const { triggerJump, jumpClassName } = useModalJump();

  const liveShifts = (liveRes?.items ?? []).filter(
    (item) => item.location_id === location.location_id || item.location_name.toLowerCase() === location.location_name.toLowerCase()
  );

  const avgHoursPerShift = location.shifts_count > 0
    ? (location.hours_worked_numeric / location.shifts_count).toFixed(1)
    : '0.0';

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          triggerJump();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${jumpClassName}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="relative flex shrink-0 items-start justify-between border-b border-slate-200 bg-white px-6 py-4.5 text-slate-900">
          <div className="flex items-start gap-3.5 pr-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
              <MdLocationOn className="text-2xl" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-medium text-slate-900 tracking-tight">{location.location_name}</h2>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-600 uppercase">
                  {period} view
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <TbBuildingSkyscraper className="text-slate-400" />
                  Client: <span className="font-medium text-slate-800">{location.client_name}</span>
                </span>
                <span>•</span>
                <span className="font-mono text-[11px] text-slate-400">ID: #{location.location_id}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <MdOutlineClose className="text-lg" />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6">
          {/* 4 Summary Stats - Unified Clean Theme */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Workers</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <TbUsers className="text-base" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-medium tracking-tight text-slate-900">{location.workers_count}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Assigned staff</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Hours Worked</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <TbClock className="text-base" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-medium tracking-tight text-slate-900">{location.hours_worked}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Logged duration</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Total Shifts</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <TbCalendarStats className="text-base" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-medium tracking-tight text-slate-900">{location.shifts_count}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Completed operations</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Avg / Shift</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <MdTrendingUp className="text-base" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-medium tracking-tight text-slate-900">{avgHoursPerShift}h</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Hours per shift</p>
            </div>
          </div>

          {/* Live / Recent Operations at this Location */}
          <section className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-medium uppercase tracking-wider text-slate-700">
                  Active Shifts at this Site ({liveShifts.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">Real-time status</span>
            </header>

            {loadingLive ? (
              <div className="p-5 space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : liveShifts.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <TbUserCheck className="text-xl" />
                </div>
                <p className="text-xs font-medium text-slate-600">No shifts actively running right now at this site.</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Past operations and overall logged hours are recorded in the summary metrics above.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {liveShifts.map((shift) => (
                  <div key={shift.shift_id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={shift.profile_picture || shift.profile_photo || '/avatar-placeholder.svg'}
                        alt={shift.worker_name}
                        className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-slate-900 font-medium">{shift.worker_name}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-medium">
                            {shift.worker_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <MdAccessTime className="text-slate-400" />
                          <span>{shift.shift_start_time} - {shift.shift_end_time}</span>
                          <span>•</span>
                          <span>{shift.hours_worked_display} worked</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium capitalize ring-1 ring-inset ${statusTone(shift.status)}`}>
                        {shift.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Location Details Info */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs text-slate-600 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Associated Client:</span>
              <span className="font-medium text-slate-800">{location.client_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Location ID:</span>
              <span className="font-mono text-slate-600">{location.location_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Operations Period:</span>
              <span className="font-medium text-slate-700 capitalize">{period} timeframe</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={() => {
              onClose();
              router.push('/shift-monitoring');
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Go to Live Shift Monitor
            <TbArrowUpRight className="text-sm text-slate-500" />
          </button>

          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

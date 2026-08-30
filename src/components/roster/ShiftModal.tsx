"use client";
import React, { useEffect, useState } from 'react';
import { MdAccessTime, MdLocationOn, MdOutlineClose, MdTag } from 'react-icons/md';
import { Shift } from './types';
import { deleteRosterShift, getRosterShift } from '@/services/actions/roster';
import { DetailSkeleton } from '@/components/shared/SkeletonLoader';

interface ShiftModalProps {
  shift: Shift;
  onClose: () => void;
  onDeleted?: (id: string) => void;
}

export function ShiftModal({ shift, onClose, onDeleted }: ShiftModalProps) {
  const [details, setDetails] = useState<{ worker_name: string; assignment_label: string; location_name: string; location_address: string } | null>(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => { void getRosterShift(shift.id).then((result) => result.success ? setDetails(result.data) : setError(result.error)); }, [shift.id]);
  const remove = async () => {
    setError('');
    setDeleting(true);
    if (shift.id.startsWith('new-')) {
      setDeleting(false);
      onDeleted?.(shift.id);
      onClose();
      return;
    }
    const result = await deleteRosterShift(shift.id);
    setDeleting(false);
    if (!result.success) return setError(result.error);
    onDeleted?.(shift.id);
    onClose();
  };

  const getAccentColor = (theme: string) => {
    switch (theme) {
      case 'pink': return 'bg-pink-500';
      case 'blue': return 'bg-primary';
      case 'orange': return 'bg-orange-500';
      case 'purple': return 'bg-purple-500';
      case 'green': return 'bg-emerald-500';
      case 'teal': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-md border border-gray-200 bg-white animate-in fade-in zoom-in-95 duration-150"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={`h-1 w-full ${getAccentColor(shift.theme)}`} />
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${getAccentColor(shift.theme)}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Shift details</span>
            </div>
            <h3 className="truncate text-base font-semibold text-slate-800">{details?.worker_name ?? shift.workerName}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{details?.assignment_label ?? 'Scheduled assignment'}</p>
          </div>
          <button onClick={onClose} aria-label="Close shift details" className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-700">
            <MdOutlineClose className="text-lg" />
          </button>
        </div>

        {!details && !error ? <div className="p-5"><DetailSkeleton blocks={3} /></div> : <div className="space-y-2 p-5">
          <div className="flex items-start gap-3 rounded border border-gray-200 bg-gray-50/70 p-3">
            <MdLocationOn className="mt-0.5 shrink-0 text-base text-slate-400" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Location</div>
              <div className="mt-0.5 text-sm font-medium text-slate-700">{details?.location_name ?? shift.location}</div>
              {details?.location_address && <div className="text-xs text-slate-400">{details.location_address}</div>}
            </div>
          </div>
          <div className="flex items-start gap-3 rounded border border-gray-200 bg-gray-50/70 p-3">
            <MdAccessTime className="mt-0.5 shrink-0 text-base text-slate-400" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Time</div>
              <div className="mt-0.5 text-sm font-medium text-slate-700">{shift.startTime} – {shift.endTime}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded border border-gray-200 bg-gray-50/70 p-3">
            <MdTag className="mt-0.5 shrink-0 text-base text-slate-400" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Shift ID</div>
              <div className="mt-0.5 text-sm font-medium text-slate-700">{shift.id}</div>
            </div>
          </div>
        </div>}
        {error && <p className="mx-5 mb-3 rounded bg-red-50 p-2 text-xs text-red-700">{error}</p>}
        <div className="flex justify-end border-t px-5 py-3">
          <button
            onClick={onClose}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

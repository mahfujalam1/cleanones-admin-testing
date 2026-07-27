import React from 'react';
import { MdAccessTime, MdLocationOn, MdOutlineClose, MdTag } from 'react-icons/md';
import { Shift } from './types';

interface ShiftModalProps {
  shift: Shift;
  onClose: () => void;
}

export function ShiftModal({ shift, onClose }: ShiftModalProps) {

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
            <h3 className="truncate text-base font-semibold text-slate-800">{shift.workerName}</h3>
            <p className="mt-0.5 text-xs text-slate-500">Scheduled assignment</p>
          </div>
          <button onClick={onClose} aria-label="Close shift details" className="flex h-8 w-8 items-center justify-center rounded text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-700">
            <MdOutlineClose className="text-lg" />
          </button>
        </div>

        <div className="space-y-2 p-5">
          <div className="flex items-start gap-3 rounded border border-gray-200 bg-gray-50/70 p-3">
            <MdLocationOn className="mt-0.5 shrink-0 text-base text-slate-400" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Location</div>
              <div className="mt-0.5 text-sm font-medium text-slate-700">{shift.location}</div>
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
        </div>
      </div>
    </div>
  );
}

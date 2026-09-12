"use client";

import React from 'react';
import { Worker } from './types';
import { usePathname } from 'next/navigation';
import { getLocale } from '@/lib/locale';
import { getDashboardTranslation } from '@/lib/translations';
import { MdEdit, MdDeleteOutline, MdRestore, MdBlock, MdVisibility } from 'react-icons/md';

interface WorkersTableProps {
  workers: Worker[];
  onViewWorker: (worker: Worker) => void;
  onEditWorker?: (worker: Worker) => void;
  onDeleteWorker?: (worker: Worker) => void;
  onChangeStatus?: (worker: Worker) => void;
  onRestoreWorker?: (worker: Worker) => void;
  mode?: 'active' | 'deleted';
}

export function WorkersTable({ workers, onViewWorker, onEditWorker, onDeleteWorker, onChangeStatus, onRestoreWorker, mode = 'active' }: WorkersTableProps) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const statusColor = (status: Worker['status']) => {
    switch (status) {
      case 'On Shift': return 'text-[#0ea5e9]';
      case 'Active': return 'text-[#10b981]';
      case 'Off Duty': return 'text-gray-400';
      case 'Suspended': return 'text-amber-500';
      case 'Banned': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const typeColor = (type: Worker['workerType']) =>
    type === 'Employee'
      ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]'
      : 'bg-[#8b5cf6]/10 text-[#8b5cf6]';

  return (
    <div className="dashboard-card overflow-hidden border border-slate-200 bg-white rounded-lg">
      <div className="overflow-x-auto w-full">
        <div className="min-w-[720px]">
          {/* Header row */}
          <div className="grid grid-cols-[2fr_1.1fr_1fr_0.7fr_0.8fr_1.3fr] gap-2 px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <div>{t.managerAccess.name}</div>
            <div>{t.managerAccess.role}</div>
            <div>Hourly Rate</div>
            <div>{t.common.duration}</div>
            <div>{t.common.status}</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className="grid grid-cols-[2fr_1.1fr_1fr_0.7fr_0.8fr_1.3fr] gap-2 items-center px-6 py-4 hover:bg-gray-50/60 transition-colors group"
          >
            {/* Name */}
            <div className="flex items-center gap-3 min-w-0">
              <img src={worker.profilePhoto || "/avatar-placeholder.svg"} alt={worker.name} className="h-9 w-9 shrink-0 rounded-full border border-gray-200 bg-white object-cover" />
              <span className="text-sm font-semibold text-gray-900 truncate">{worker.name}</span>
            </div>

            {/* Worker Type */}
            <div>
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor(worker.workerType)}`}>
                {worker.workerType}
              </span>
            </div>

            {/* Hourly rate */}
            <div className="text-sm text-gray-700">
              {typeof worker.hourlyRate === 'number'
                ? <><span className="font-semibold text-gray-900">&euro;{worker.hourlyRate.toFixed(2)}</span><span className="text-xs text-gray-400">/hr</span></>
                : <span className="text-gray-400">&mdash;</span>}
            </div>

            {/* Hours */}
            <div className="text-sm font-semibold text-gray-900">{worker.hours}</div>

            {/* Status */}
            <div className={`text-xs font-semibold ${statusColor(worker.status)}`}>
              {worker.status}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1">
              {mode === 'deleted' ? (
                onRestoreWorker && (
                  <button
                    onClick={() => onRestoreWorker(worker)}
                    className="flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 cursor-pointer"
                    title="Restore worker"
                  >
                    <MdRestore className="text-sm" /> Restore
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={() => onViewWorker(worker)}
                    className="p-1 rounded text-gray-400 hover:text-[#0ea5e9] hover:bg-sky-50 transition-colors cursor-pointer"
                    title={t.topbar.viewAll}
                    aria-label={`${t.topbar.viewAll} ${worker.name}`}
                  >
                    <MdVisibility className="text-base" />
                  </button>
                  {onChangeStatus && (
                    <button
                      onClick={() => onChangeStatus(worker)}
                      className="p-1 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      title="Activate, suspend or ban"
                    >
                      <MdBlock className="text-base" />
                    </button>
                  )}
                  {onEditWorker && (
                    <button
                      onClick={() => onEditWorker(worker)}
                      className="p-1 rounded text-gray-400 hover:text-[#0ea5e9] hover:bg-sky-50 transition-colors cursor-pointer"
                      title="Edit Worker Details"
                    >
                      <MdEdit className="text-base" />
                    </button>
                  )}
                  {onDeleteWorker && (
                    <button
                      onClick={() => onDeleteWorker(worker)}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete worker"
                    >
                      <MdDeleteOutline className="text-base" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {workers.length === 0 && (
          <p className="py-12 text-center text-xs text-slate-400">{t.common.noDataFound}</p>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}


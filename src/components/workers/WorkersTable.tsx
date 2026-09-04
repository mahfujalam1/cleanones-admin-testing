"use client";

import React from 'react';
import { Worker } from './types';
import { usePathname } from 'next/navigation';
import { getLocale } from '@/lib/locale';
import { getDashboardTranslation } from '@/lib/translations';

interface WorkersTableProps {
  workers: Worker[];
  onViewWorker: (worker: Worker) => void;
}

export function WorkersTable({ workers, onViewWorker }: WorkersTableProps) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const statusColor = (status: Worker['status']) => {
    switch (status) {
      case 'On Shift': return 'text-[#0ea5e9]';
      case 'Active': return 'text-[#10b981]';
      case 'Off Duty': return 'text-gray-400';
    }
  };

  const typeColor = (type: Worker['workerType']) =>
    type === 'Employee'
      ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]'
      : 'bg-[#8b5cf6]/10 text-[#8b5cf6]';

  return (
    <div className="dashboard-card overflow-hidden border border-slate-200 bg-white rounded-lg">
      <div className="overflow-x-auto w-full">
        <div className="min-w-[1000px]">
          {/* Header row */}
          <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1.4fr_1.4fr_0.8fr_0.8fr_0.6fr] gap-2 px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <div>{t.managerAccess.name}</div>
            <div>{t.managerAccess.role}</div>
            <div>{t.managerAccess.permissions}</div>
            <div>{t.extraServices.location}</div>
            <div>{t.settings.language}</div>
            <div>{t.common.duration}</div>
            <div>{t.common.status}</div>
            <div>{t.topbar.viewAll}</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className="grid grid-cols-[2fr_1.2fr_1.2fr_1.4fr_1.4fr_0.8fr_0.8fr_0.6fr] gap-2 items-center px-6 py-4 hover:bg-gray-50/60 transition-colors group"
          >
            {/* Name */}
            <div className="flex items-center gap-3 min-w-0">
              <img src="/avatar-placeholder.svg" alt={worker.name} className="h-9 w-9 shrink-0 rounded-full border border-gray-200 object-cover" />
              <span className="text-sm font-semibold text-gray-900 truncate">{worker.name}</span>
            </div>

            {/* Worker Type */}
            <div>
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor(worker.workerType)}`}>
                {worker.workerType}
              </span>
            </div>

            {/* Position */}
            <div className="text-sm text-gray-700 truncate">{worker.position}</div>

            {/* Location */}
            <div className="text-sm text-gray-500 truncate">{worker.location}</div>

            {/* Languages */}
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {worker.languages.slice(0, 2).map((lang) => (
                <span key={lang} className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#e0f2fe] text-[#0284c7]">
                  {lang}
                </span>
              ))}
              {worker.languages.length > 2 && (
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                  +{worker.languages.length - 2}
                </span>
              )}
            </div>

            {/* Hours */}
            <div className="text-sm font-semibold text-gray-900">{worker.hours}</div>

            {/* Status */}
            <div className={`text-xs font-semibold ${statusColor(worker.status)}`}>
              {worker.status}
            </div>

            {/* View */}
            <div>
              <button
                onClick={() => onViewWorker(worker)}
                className="text-xs text-[#0ea5e9] font-medium hover:underline cursor-pointer opacity-60 group-hover:opacity-100 transition-opacity"
              >
                {t.topbar.viewAll}
              </button>
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

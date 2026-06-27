"use client";

import React from 'react';
import { Worker } from './types';

interface WorkersTableProps {
  workers: Worker[];
  onViewWorker: (worker: Worker) => void;
}

export function WorkersTable({ workers, onViewWorker }: WorkersTableProps) {
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
    <div className="bg-white rounded  shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1.4fr_1.4fr_0.8fr_0.8fr_0.6fr] gap-2 px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        <div>Name</div>
        <div>Worker Type</div>
        <div>Position</div>
        <div>Location</div>
        <div>Languages</div>
        <div>Hours</div>
        <div>Status</div>
        <div></div>
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
              <div className={`w-9 h-9 rounded-full ${worker.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm`}>
                {worker.initials}
              </div>
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
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { MdSearch, MdLocationOn, MdAccessTime } from 'react-icons/md';
import { WORKERS } from '@/components/shift-monitoring/data';
import { EmployeeSidebar } from '@/components/shift-monitoring/EmployeeSidebar';
import { WorkerInfo } from '@/components/shift-monitoring/types';

export default function LiveStatusPage() {
  const [selectedWorker, setSelectedWorker] = useState<WorkerInfo | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'On Time' | 'Late' | 'Missing'>('All');
  const [search, setSearch] = useState('');

  const filteredWorkers = WORKERS.filter(w => {
    if (statusFilter !== 'All' && w.status !== statusFilter) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const onTimeCount = WORKERS.filter(w => w.status === 'On Time').length;
  const lateCount = WORKERS.filter(w => w.status === 'Late').length;
  const missingCount = WORKERS.filter(w => w.status === 'Missing').length;

  return (
    <div className="h-full flex relative animate-in fade-in duration-300 space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex-1 transition-all duration-300 w-full flex flex-col h-full">

        {/* Filters */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded text-sm w-64 focus:outline-none shadow-sm bg-gray-50"
              />
            </div>
            <div className="flex bg-gray-100 p-1 rounded">
              {(['All', 'On Time', 'Late', 'Missing'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${statusFilter === filter
                      ? 'bg-[#0ea5e9] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded text-xs font-bold text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> {onTimeCount} On Time
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fffbeb] border border-[#fde68a] rounded text-xs font-bold text-[#f59e0b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span> {lateCount} Late
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fef2f2] border border-[#fecaca] rounded text-xs font-bold text-[#ef4444]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span> {missingCount} Missing
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-white">
                <th className="px-6 py-4">Employee Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Check-In Time</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm bg-white">
              {filteredWorkers.map((worker) => (
                <tr
                  key={worker.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedWorker?.id === worker.id ? 'bg-[#f0fdfa]' : ''}`}
                  onClick={() => setSelectedWorker(worker)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${worker.color} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                        {worker.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{worker.name}</div>
                        <div className="text-[11px] text-gray-500">{worker.role} · Shift {worker.shiftId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 flex items-center gap-1.5 mt-2.5">
                    <MdLocationOn className="text-gray-400" /> {worker.location}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MdAccessTime className="text-gray-400" /> {worker.checkIn}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-6">
                      <div className="flex items-center gap-1.5 font-semibold text-xs">
                        <span className={`w-2 h-2 rounded-full ${worker.status === 'On Time' ? 'bg-[#10b981]' :
                            worker.status === 'Late' ? 'bg-[#f59e0b]' :
                              'bg-[#ef4444]'
                          }`}></span>
                        <span className={worker.statusColor}>{worker.status}</span>
                      </div>
                      <button className="text-[#0ea5e9] text-xs font-medium hover:underline cursor-pointer">View &gt;</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Slide-over Panel using EmployeeSidebar component */}
      {selectedWorker && (
        <EmployeeSidebar
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
        />
      )}
    </div>
  );
}

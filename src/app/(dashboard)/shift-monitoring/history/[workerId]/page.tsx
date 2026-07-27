"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { WORKERS } from '@/components/shift-monitoring/data';

interface ShiftHistory {
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: 'On Time' | 'Late' | 'Missing';
}

const mockHistory: ShiftHistory[] = [
  { date: '9 Jun 2026', checkIn: '08:00', checkOut: '16:00', totalHours: '8h', status: 'On Time' },
  { date: '8 Jun 2026', checkIn: '08:05', checkOut: '16:10', totalHours: '8h', status: 'On Time' },
  { date: '7 Jun 2026', checkIn: '08:18', checkOut: '16:22', totalHours: '8h', status: 'Late' },
  { date: '6 Jun 2026', checkIn: '07:58', checkOut: '16:02', totalHours: '8h', status: 'On Time' },
  { date: '5 Jun 2026', checkIn: '08:01', checkOut: '16:00', totalHours: '8h', status: 'On Time' },
  { date: '4 Jun 2026', checkIn: '08:00', checkOut: '16:05', totalHours: '8h', status: 'On Time' },
  { date: '3 Jun 2026', checkIn: '08:22', checkOut: '16:30', totalHours: '8h', status: 'Late' },
];

export default function HistoryPage({ params }: { params: Promise<{ workerId: string }> }) {
  const router = useRouter();
  const { workerId } = use(params);
  
  const worker = WORKERS.find(w => w.id === parseInt(workerId)) || WORKERS[0]; // fallback to first worker if not found

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span>←</span> Back
        </button>
        <div className="flex items-center gap-3">
          <img src="/avatar-placeholder.svg" alt={worker.name} className="h-10 w-10 rounded-full border border-gray-200 object-cover" />
          <div>
            <h2 className="text-xl font-bold text-gray-800 leading-tight">{worker.name} — Daily Activity</h2>
            <div className="text-sm text-gray-500">June 2026</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#f0f9ff] border border-[#e0f2fe] rounded p-5">
          <div className="text-xs font-semibold text-[#0ea5e9] mb-1">Total Hours</div>
          <div className="text-3xl font-bold text-[#0ea5e9]">56h</div>
        </div>
        <div className="bg-[#ecfdf5] border border-[#d1fae5] rounded p-5">
          <div className="text-xs font-semibold text-[#10b981] mb-1">Attendance %</div>
          <div className="text-3xl font-bold text-[#10b981]">100%</div>
        </div>
        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded p-5">
          <div className="text-xs font-semibold text-[#f59e0b] mb-1">Late Days</div>
          <div className="text-3xl font-bold text-[#f59e0b]">2</div>
        </div>
        <div className="bg-[#fef2f2] border border-[#fee2e2] rounded p-5">
          <div className="text-xs font-semibold text-[#ef4444] mb-1">Absent Days</div>
          <div className="text-3xl font-bold text-[#ef4444]">0</div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Check-In Time</th>
              <th className="px-6 py-4">Check-Out Time</th>
              <th className="px-6 py-4">Total Hours</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockHistory.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-800">{row.date}</td>
                <td className="px-6 py-4 text-gray-600">{row.checkIn}</td>
                <td className="px-6 py-4 text-gray-600">{row.checkOut}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{row.totalHours}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    row.status === 'On Time' ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#10b981]' : 
                    row.status === 'Late' ? 'bg-[#fffbeb] border-[#fde68a] text-[#f59e0b]' : 
                    'bg-[#fef2f2] border-[#fecaca] text-[#ef4444]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      row.status === 'On Time' ? 'bg-[#10b981]' : 
                      row.status === 'Late' ? 'bg-[#f59e0b]' : 
                      'bg-[#ef4444]'
                    }`}></span>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineClose } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { WorkerInfo } from './types';
import { getLiveWorkerDetails, getWorkerStats, type Period } from '@/services/actions/shiftMonitoring';
import { DetailSkeleton } from '@/components/shared/SkeletonLoader';

interface EmployeeSidebarProps {
  worker: WorkerInfo;
  onClose: () => void;
}

export function EmployeeSidebar({ worker, onClose }: EmployeeSidebarProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Today' | 'Weekly' | 'Monthly'>('Today');
  const [details, setDetails] = useState<{ hours_worked: string; shifts_count: number; avg_duration: string; shift_details: { check_in: string; check_out: string; duration: string; status: string } } | null>(null);
  const [rows, setRows] = useState<Array<{ date: string; checkIn: string; checkOut: string; hours: string }>>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); const period = activeTab.toLowerCase() as Period; void Promise.all([getLiveWorkerDetails(String(worker.id), period), getWorkerStats(String(worker.id), period)]).then(([live, stats]) => { setLoading(false); if (live.success) setDetails(live.data); if (stats.success) setRows(stats.data.shifts.map((shift) => ({ date: shift.date, checkIn: shift.checkin_time || shift.start_time, checkOut: shift.checkout_time || shift.end_time, hours: `${shift.duration_hours}h` }))); }); }, [worker.id, activeTab]);

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
    <>
      {/* Invisible backdrop to detect outside clicks */}
      <div 
        className="modal-backdrop fixed inset-0 z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col border-l border-gray-200 bg-white sm:w-[400px] animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-[#1a2332] text-white p-6 relative flex-shrink-0">
          <button 
            className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer transition-colors"
            onClick={onClose}
          >
            <MdOutlineClose className="text-xl" />
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/avatar-placeholder.svg" alt={worker.name} className="h-12 w-12 rounded-full border border-white/20 object-cover" />
              <div>
                <h3 className="font-bold text-xl leading-tight">{worker.name}</h3>
                <div className="text-sm text-gray-400 font-medium">{worker.role} · Shift {worker.shiftId}</div>
              </div>
            </div>
            
            <div className={`text-xs font-semibold ${worker.statusColor}`}>
              {worker.status}
            </div>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto bg-white flex flex-col">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-100 flex-shrink-0">
            {(['Today', 'Weekly', 'Monthly'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 cursor-pointer text-center ${
                  activeTab === tab 
                    ? 'text-[#0ea5e9] border-[#0ea5e9]' 
                    : 'text-gray-400 hover:text-gray-600 border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-6 flex-1 flex flex-col">
            {loading ? <DetailSkeleton blocks={6} /> : <>
            
            {/* Top Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 border border-gray-100 rounded p-4 text-center shadow-sm">
                <div className="text-xl font-bold text-gray-900">
                  {details?.hours_worked ?? '0h'}
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold mt-1">Hours Worked</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded p-4 text-center shadow-sm">
                <div className="text-xl font-bold text-gray-900">
                  {details?.shifts_count ?? 0}
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold mt-1">Shifts</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded p-4 text-center shadow-sm">
                <div className="text-xl font-bold text-gray-900">
                  {details?.avg_duration ?? '0h'}
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold mt-1">Avg Duration</div>
              </div>
            </div>

            {/* Today View - Shift Details */}
            {activeTab === 'Today' && (
              <div className="border border-gray-100 rounded shadow-sm flex-1 overflow-hidden flex flex-col bg-white">
                <div className="px-5 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Shift Details
                </div>
                <div className="divide-y divide-gray-100 text-sm">
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-gray-500">Check-In</span>
                    <span className="font-semibold text-gray-900">{details?.shift_details.check_in ?? '--:--'}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-gray-500">Check-Out</span>
                    <span className="font-semibold text-gray-900">{details?.shift_details.check_out ?? '--:--'}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-semibold text-[#0ea5e9]">{details?.shift_details.duration ?? '0h'}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-semibold ${worker.statusColor}`}>{worker.status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly / Monthly View - Table */}
            {activeTab !== 'Today' && (
              <div className="border border-gray-100 rounded shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <div className="w-24">Date</div>
                  <div className="flex-1 text-center">Check-In</div>
                  <div className="flex-1 text-center">Check-Out</div>
                  <div className="w-16 text-right">Hours</div>
                </div>
                
                <div className="divide-y divide-gray-100 text-sm overflow-y-auto flex-1 bg-white">
                  {rows.map((row, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors">
                      <div className="w-24 text-gray-700 font-medium">{row.date}</div>
                      <div className="flex-1 text-center text-gray-500">{row.checkIn}</div>
                      <div className="flex-1 text-center text-gray-500">{row.checkOut}</div>
                      <div className="w-16 text-right font-bold text-gray-900">{row.hours}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>}

            {/* View Activity History Button */}
            <button 
              onClick={() => router.push(`/shift-monitoring/history/${worker.id}`)}
              className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold py-3.5 rounded transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-auto"
            >
              View Activity History
            </button>
            
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

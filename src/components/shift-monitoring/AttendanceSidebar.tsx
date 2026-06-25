"use client";

import React, { useEffect } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { WorkerInfo } from './types';

const weeklyData = [
  { name: 'W1', hours: 32 },
  { name: 'W2', hours: 35 },
  { name: 'W3', hours: 38 },
  { name: 'W4', hours: 36 },
];

const monthlyData = [
  { name: 'Jan', hours: 160 },
  { name: 'Feb', hours: 155 },
  { name: 'Mar', hours: 170 },
  { name: 'Apr', hours: 168 },
  { name: 'May', hours: 165 },
  { name: 'Jun', hours: 80 },
];

interface AttendanceSidebarProps {
  worker: WorkerInfo;
  onClose: () => void;
}

export function AttendanceSidebar({ worker, onClose }: AttendanceSidebarProps) {
  const router = useRouter();

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/10 animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="fixed inset-y-0 right-0 w-[400px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-[#1a2332] text-white p-6 relative flex-shrink-0">
          <button 
            className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer transition-colors"
            onClick={onClose}
          >
            <MdOutlineClose className="text-xl" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${worker.color} text-white flex items-center justify-center text-lg font-bold shadow-md`}>
              {worker.initials}
            </div>
            <div>
              <h3 className="font-bold text-xl leading-tight">{worker.name}</h3>
              <div className="text-sm text-gray-400 font-medium">{worker.role}</div>
            </div>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-5">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
              <div className="text-[10px] text-[#0ea5e9] uppercase font-bold tracking-wider mb-1">Hours Worked</div>
              <div className="text-2xl font-bold text-[#0ea5e9]">{worker.hoursWorked || 168}h</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
              <div className="text-[10px] text-[#10b981] uppercase font-bold tracking-wider mb-1">Completed Shifts</div>
              <div className="text-2xl font-bold text-[#10b981]">{worker.totalShifts || 22}</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
              <div className="text-[10px] text-[#6366f1] uppercase font-bold tracking-wider mb-1">Avg Shift Duration</div>
              <div className="text-2xl font-bold text-[#6366f1]">{worker.avgDuration || '7.6h'}</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
              <div className="text-[10px] text-[#f59e0b] uppercase font-bold tracking-wider mb-1">Late Check-Ins</div>
              <div className="text-2xl font-bold text-[#f59e0b]">{worker.lateDays || 1}</div>
            </div>
          </div>

          {/* View Activity History Button */}
          <button 
            onClick={() => router.push(`/shift-monitoring/history/${worker.id}`)}
            className="w-full bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] font-semibold py-3 rounded-md transition-colors border border-[#7dd3fc] shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            View Activity History
          </button>

          {/* Weekly Hours Trend */}
          <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-4">Weekly Hours Trend</h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="hours" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Hours Trend */}
          <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm">
            <h4 className="text-sm font-bold text-gray-800 mb-4">Monthly Hours Trend</h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

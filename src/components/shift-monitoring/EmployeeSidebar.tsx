"use client";

import React, { useEffect, useState } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { WorkerInfo } from './types';

interface EmployeeSidebarProps {
  worker: WorkerInfo;
  onClose: () => void;
}

export function EmployeeSidebar({ worker, onClose }: EmployeeSidebarProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Today' | 'Weekly' | 'Monthly'>('Today');

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Mock data for Weekly
  const weeklyData = [
    { date: 'Mon 9 Jun', checkIn: '08:00', checkOut: '16:00', hours: '8h' },
    { date: 'Tue 8 Jun', checkIn: '08:05', checkOut: '16:10', hours: '8h' },
    { date: 'Wed 7 Jun', checkIn: '07:58', checkOut: '16:02', hours: '8h' },
    { date: 'Thu 6 Jun', checkIn: '08:01', checkOut: '16:00', hours: '8h' },
    { date: 'Fri 5 Jun', checkIn: '08:00', checkOut: '16:00', hours: '8h' },
  ];

  // Mock data for Monthly
  const monthlyData = [
    { date: 'W1', checkIn: '08:01', checkOut: '16:02', hours: '40h' },
    { date: 'W2', checkIn: '08:00', checkOut: '16:00', hours: '40h' },
    { date: 'W3', checkIn: '08:03', checkOut: '16:05', hours: '40h' },
    { date: 'W4', checkIn: '08:00', checkOut: '16:00', hours: '40h' },
  ];

  return (
    <>
      {/* Invisible backdrop to detect outside clicks */}
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${worker.color} text-white flex items-center justify-center text-lg font-bold shadow-md`}>
                {worker.initials}
              </div>
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
            
            {/* Top Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 border border-gray-100 rounded-md p-4 text-center shadow-sm">
                <div className="text-xl font-bold text-gray-900">
                  {activeTab === 'Monthly' ? '160h' : activeTab === 'Weekly' ? '40h' : '8h'}
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold mt-1">Hours Worked</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-md p-4 text-center shadow-sm">
                <div className="text-xl font-bold text-gray-900">
                  {activeTab === 'Monthly' ? '4' : activeTab === 'Weekly' ? '5' : '1'}
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold mt-1">Shifts</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-md p-4 text-center shadow-sm">
                <div className="text-xl font-bold text-gray-900">
                  {activeTab === 'Monthly' ? '40.0h' : '8.0h'}
                </div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold mt-1">Avg Duration</div>
              </div>
            </div>

            {/* Today View - Shift Details */}
            {activeTab === 'Today' && (
              <div className="border border-gray-100 rounded-md shadow-sm flex-1 overflow-hidden flex flex-col bg-white">
                <div className="px-5 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Shift Details
                </div>
                <div className="divide-y divide-gray-100 text-sm">
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-gray-500">Check-In</span>
                    <span className="font-semibold text-gray-900">{worker.checkIn || '08:00'}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-gray-500">Check-Out</span>
                    <span className="font-semibold text-gray-900">16:00</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-semibold text-[#0ea5e9]">8h</span>
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
              <div className="border border-gray-100 rounded-md shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <div className="w-24">Date</div>
                  <div className="flex-1 text-center">Check-In</div>
                  <div className="flex-1 text-center">Check-Out</div>
                  <div className="w-16 text-right">Hours</div>
                </div>
                
                <div className="divide-y divide-gray-100 text-sm overflow-y-auto flex-1 bg-white">
                  {(activeTab === 'Monthly' ? monthlyData : weeklyData).map((row, i) => (
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

            {/* View Activity History Button */}
            <button 
              onClick={() => router.push(`/shift-monitoring/history/${worker.id}`)}
              className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold py-3.5 rounded-md transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-auto"
            >
              View Activity History
            </button>
            
          </div>
        </div>
      </div>
    </>
  );
}

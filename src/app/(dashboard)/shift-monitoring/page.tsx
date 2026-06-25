"use client";

import React, { useState } from 'react';
import { MdSearch, MdLocationOn, MdAccessTime, MdOutlineClose } from 'react-icons/md';

const workers = [
  { id: 1, initials: 'LV', name: 'Lisa Visser', role: 'Employee', shiftId: '#1041', location: 'NH Hotel Amsterdam', checkIn: '08:00', status: 'On Time', color: 'bg-[#10b981]', statusColor: 'text-[#10b981]' },
  { id: 2, initials: 'ES', name: 'Emma Smit', role: 'Employee', shiftId: '#1042', location: 'Hilton Rotterdam', checkIn: '08:12', status: 'Late', color: 'bg-[#0ea5e9]', statusColor: 'text-[#f59e0b]' },
  { id: 3, initials: 'NB', name: 'Noah Bos', role: 'Freelancer', shiftId: '#1043', location: 'UMC Utrecht', checkIn: '—', status: 'Missing', color: 'bg-[#8b5cf6]', statusColor: 'text-[#ef4444]' },
  { id: 4, initials: 'SB', name: 'Sophie de Boer', role: 'Employee', shiftId: '#1044', location: 'Van der Valk Eindhoven', checkIn: '07:02', status: 'On Time', color: 'bg-[#0ea5e9]', statusColor: 'text-[#10b981]' },
  { id: 5, initials: 'LM', name: 'Lucas Meijer', role: 'Employee', shiftId: '#1045', location: 'NH Hotel Groningen', checkIn: '06:05', status: 'On Time', color: 'bg-[#0ea5e9]', statusColor: 'text-[#10b981]' },
  { id: 6, initials: 'AM', name: 'Anna Mulder', role: 'Employee', shiftId: '#1046', location: 'Keizersgracht Kantoren', checkIn: '—', status: 'Missing', color: 'bg-[#0ea5e9]', statusColor: 'text-[#ef4444]' },
  { id: 7, initials: 'DB', name: 'Daan van den Berg', role: 'Freelancer', shiftId: '#1047', location: 'Haarlem Stadsschouwburg', checkIn: '08:25', status: 'Late', color: 'bg-[#0ea5e9]', statusColor: 'text-[#f59e0b]' },
  { id: 8, initials: 'MD', name: 'Milan Dekker', role: 'Employee', shiftId: '#1048', location: 'Academisch Ziekenhuis Leiden', checkIn: '09:30', status: 'On Time', color: 'bg-[#0ea5e9]', statusColor: 'text-[#10b981]' },
];

export default function ShiftMonitoringPage() {
  const [selectedWorker, setSelectedWorker] = useState<typeof workers[0] | null>(null);

  return (
    <div className="h-full flex relative">
      <div className={`flex-1 transition-all duration-300 ${selectedWorker ? 'mr-80' : ''}`}>
        {/* Sub-navigation */}
        <div className="flex border-b border-gray-200 mb-6 gap-6 px-2">
          <button className="text-sm font-semibold text-[#0ea5e9] border-b-2 border-[#0ea5e9] pb-3 flex items-center gap-2 cursor-pointer">
            <span className="text-lg">⚡</span> Live Status
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-900 pb-3 flex items-center gap-2 cursor-pointer">
            <MdAccessTime className="text-lg" /> Attendance & Time Tracking
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-900 pb-3 flex items-center gap-2 cursor-pointer">
            Employee Statistics
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-900 pb-3 flex items-center gap-2 cursor-pointer">
            Location Statistics
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-900 pb-3 flex items-center gap-2 cursor-pointer">
            Client Statistics
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input 
                type="text" 
                placeholder="Search employee..." 
                className="pl-9 pr-4 py-2 border border-gray-200 rounded text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] shadow-sm bg-gray-50"
              />
            </div>
            <div className="flex bg-gray-100 p-1 rounded">
              <button className="px-4 py-1.5 bg-[#0ea5e9] text-white rounded text-xs font-semibold shadow-sm cursor-pointer">All</button>
              <button className="px-4 py-1.5 text-gray-600 hover:text-gray-900 rounded text-xs font-medium cursor-pointer">On Time</button>
              <button className="px-4 py-1.5 text-gray-600 hover:text-gray-900 rounded text-xs font-medium cursor-pointer">Late</button>
              <button className="px-4 py-1.5 text-gray-600 hover:text-gray-900 rounded text-xs font-medium cursor-pointer">Missing</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded text-xs font-bold text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> 4 On Time
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fffbeb] border border-[#fde68a] rounded text-xs font-bold text-[#f59e0b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span> 2 Late
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fef2f2] border border-[#fecaca] rounded text-xs font-bold text-[#ef4444]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span> 2 Missing
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Employee Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Check-In Time</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {workers.map((worker) => (
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
                        <span className={`w-2 h-2 rounded-full ${worker.status === 'On Time' ? 'bg-[#10b981]' : worker.status === 'Late' ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'}`}></span>
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

      {/* Slide-over Panel */}
      {selectedWorker && (
        <div className="fixed right-0 top-16 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col transform transition-transform">
          {/* Header */}
          <div className="bg-[#1a2332] text-white p-6 relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setSelectedWorker(null)}
            >
              <MdOutlineClose className="text-xl" />
            </button>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${selectedWorker.color} text-white flex items-center justify-center text-sm font-bold shadow`}>
                  {selectedWorker.initials}
                </div>
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{selectedWorker.name}</h3>
                  <div className="text-xs text-gray-400">{selectedWorker.role} · Shift {selectedWorker.shiftId}</div>
                </div>
              </div>
              <div className={`text-xs font-semibold ${selectedWorker.statusColor}`}>
                {selectedWorker.status}
              </div>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex border-b border-gray-100 mb-6">
              <button className="flex-1 pb-3 text-sm font-semibold text-[#0ea5e9] border-b-2 border-[#0ea5e9] cursor-pointer text-center">Today</button>
              <button className="flex-1 pb-3 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent cursor-pointer text-center">Weekly</button>
              <button className="flex-1 pb-3 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent cursor-pointer text-center">Monthly</button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="border border-gray-100 rounded-lg p-3 text-center shadow-sm">
                <div className="text-lg font-bold text-gray-900">8h</div>
                <div className="text-[10px] text-gray-500 uppercase font-semibold">Hours Worked</div>
              </div>
              <div className="border border-gray-100 rounded-lg p-3 text-center shadow-sm bg-gray-50">
                <div className="text-lg font-bold text-gray-900">1</div>
                <div className="text-[10px] text-gray-500 uppercase font-semibold">Shifts</div>
              </div>
              <div className="border border-gray-100 rounded-lg p-3 text-center shadow-sm">
                <div className="text-lg font-bold text-gray-900">8h</div>
                <div className="text-[10px] text-gray-500 uppercase font-semibold">Avg Duration</div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Shift Details
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-medium">Check-In</span>
                  <span className="font-semibold text-gray-900">{selectedWorker.checkIn !== '—' ? selectedWorker.checkIn : 'Pending'}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-medium">Check Out</span>
                  <span className="font-semibold text-gray-900">16:00</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-medium">Duration</span>
                  <span className="font-semibold text-gray-900">8h</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span className={`font-semibold ${selectedWorker.statusColor}`}>{selectedWorker.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

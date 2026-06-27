import React, { useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { WORKERS } from './data';
import { WorkerInfo } from './types';

interface Props {
  onWorkerSelect: (worker: WorkerInfo) => void;
  selectedWorkerId: number | null;
}

export function AttendanceTimeTracking({ onWorkerSelect, selectedWorkerId }: Props) {
  const [timeRange, setTimeRange] = useState<'Today' | 'Weekly' | 'Monthly'>('Today');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Employee' | 'Freelancer'>('All');
  const [search, setSearch] = useState('');

  const filteredWorkers = WORKERS.filter(w => {
    if (roleFilter !== 'All' && w.role !== roleFilter) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      {/* Controls Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded">
            {(['Today', 'Weekly', 'Monthly'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-4 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${timeRange === tr ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {tr}
              </button>
            ))}
          </div>

          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none shadow-sm bg-gray-50"
            />
          </div>

          <div className="flex bg-gray-100 p-1 rounded">
            {(['All', 'Employee', 'Freelancer'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${roleFilter === r ? 'bg-[#0ea5e9] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-200 rounded px-3 py-1.5 text-xs font-semibold text-gray-600 flex items-center gap-2 shadow-sm">
            01/06/2026 - 09/06/2026
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Hours Worked</th>
              <th className="px-6 py-4">Total Shifts</th>
              <th className="px-6 py-4">Late Days</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm bg-white">
            {filteredWorkers.map((worker) => (
              <tr 
                key={worker.id} 
                className={`hover:bg-gray-50 transition-colors ${selectedWorkerId === worker.id ? 'bg-[#f0f9ff]' : ''}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${worker.color} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                      {worker.initials}
                    </div>
                    <div className="font-semibold text-gray-900">{worker.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[11px] font-semibold tracking-wide ${worker.role === 'Employee' ? 'text-[#0ea5e9]' : 'text-[#8b5cf6]'}`}>
                    {worker.role}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">
                  {worker.hoursWorked}h
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">
                  {worker.totalShifts}
                </td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${worker.lateDays > 0 ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
                    {worker.lateDays}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onWorkerSelect(worker)}
                    className="inline-flex items-center justify-center bg-[#e0f2fe] text-[#0284c7] hover:bg-[#bae6fd] text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    Stats <span className="ml-1 text-[10px]">▶</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from 'react';
import { WORKERS } from './data';
import { WorkerInfo } from './types';

interface Props {
  onWorkerSelect: (worker: WorkerInfo) => void;
  selectedWorkerId: number | null;
}

export function EmployeeStatistics({ onWorkerSelect, selectedWorkerId }: Props) {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="mb-6">
        <p className="text-sm text-gray-500 font-medium">Select an employee to view detailed statistics and analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {WORKERS.map(worker => {
          const isSelected = selectedWorkerId === worker.id;
          return (
            <div 
              key={worker.id}
              onClick={() => onWorkerSelect(worker)}
              className={`dashboard-card cursor-pointer p-5 transition-[border-color,box-shadow] hover:border-[#d7dbe4] hover:shadow ${isSelected ? 'border-[#0ea5e9] shadow ring-1 ring-[#0ea5e9]' : ''}`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <img src="/avatar-placeholder.svg" alt={worker.name} className="h-10 w-10 rounded-full border border-gray-200 object-cover" />
                <div>
                  <h3 className="font-semibold text-gray-900 leading-tight">{worker.name}</h3>
                  <div className={`text-[10px] font-semibold tracking-wide ${worker.role === 'Employee' ? 'text-[#0ea5e9]' : 'text-[#8b5cf6]'}`}>
                    {worker.role}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 rounded p-2.5 border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Hours</div>
                  <div className="text-lg font-bold text-gray-800">{worker.hoursWorked}h</div>
                </div>
                <div className="bg-gray-50 rounded p-2.5 border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Shifts</div>
                  <div className="text-lg font-bold text-gray-800">{worker.totalShifts}</div>
                </div>
              </div>

              {/* Footer Stat */}
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Late Days</div>
                <div className="text-sm font-bold text-gray-800">{worker.lateDays}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

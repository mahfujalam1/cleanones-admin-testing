import React from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { Shift } from './types';

interface ShiftModalProps {
  shift: Shift;
  onClose: () => void;
}

export function ShiftModal({ shift, onClose }: ShiftModalProps) {

  // Custom header color based on theme
  const getHeaderColor = (theme: string) => {
    switch (theme) {
      case 'pink': return 'bg-[#ec4899]';
      case 'blue': return 'bg-[#0ea5e9]';
      case 'orange': return 'bg-[#f97316]';
      case 'purple': return 'bg-[#a855f7]';
      case 'green': return 'bg-[#22c55e]';
      case 'teal': return 'bg-[#14b8a6]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`p-5 text-white relative ${getHeaderColor(shift.theme)}`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <MdOutlineClose className="text-xl" />
          </button>
          <h3 className="font-bold text-lg">{shift.workerName}</h3>
          <p className="text-sm opacity-90">{shift.location.split(' ')[0]}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">Location</div>
            <div className="text-sm font-medium text-gray-800">{shift.location}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">Time</div>
            <div className="text-sm font-medium text-gray-800">{shift.startTime} - {shift.endTime}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">Shift ID</div>
            <div className="text-sm font-medium text-gray-800">{shift.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

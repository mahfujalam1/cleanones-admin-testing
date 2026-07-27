import React from 'react';
import { MdLocationOn } from 'react-icons/md';
import { LOCATIONS } from './data';

const getThemeForLocation = (index: number) => {
  const themes = [
    { bg: 'bg-[#e0f2fe]', text: 'text-[#0284c7]' },
    { bg: 'bg-[#dcfce7]', text: 'text-[#15803d]' },
    { bg: 'bg-[#f3e8ff]', text: 'text-[#7e22ce]' },
    { bg: 'bg-[#ffedd5]', text: 'text-[#c2410c]' },
    { bg: 'bg-[#e0f2fe]', text: 'text-[#0284c7]' },
    { bg: 'bg-[#fce7f3]', text: 'text-[#be185d]' },
  ];
  return themes[index % themes.length];
};

export function LocationStatistics() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {LOCATIONS.map((loc, idx) => {
          const theme = getThemeForLocation(idx);
          return (
            <div 
              key={loc.name}
              className="dashboard-card p-5 transition-[border-color,box-shadow] hover:border-[#d7dbe4] hover:shadow"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded ${theme.bg} ${theme.text} flex items-center justify-center text-lg shadow-sm`}>
                  <MdLocationOn />
                </div>
                <h3 className="font-semibold text-gray-900 leading-tight flex-1">{loc.name}</h3>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">{loc.workers}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Workers</div>
                </div>
                <div className="text-center border-l border-gray-100">
                  <div className="text-lg font-bold text-gray-800">{loc.hours}h</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Hours</div>
                </div>
                <div className="text-center border-l border-gray-100">
                  <div className="text-lg font-bold text-gray-800">{loc.shifts}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Shifts</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

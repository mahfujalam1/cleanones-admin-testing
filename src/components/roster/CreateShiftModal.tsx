import React, { useState, useMemo } from 'react';
import { MdOutlineClose, MdSearch, MdCheck } from 'react-icons/md';
import { ShiftTheme } from './types';

interface Worker {
  id: string;
  initials: string;
  name: string;
  role: 'Employee' | 'Freelancer';
  status: 'Available' | 'On Shift' | 'Off Duty';
  color: string;
}

const WORKERS: Worker[] = [
  { id: 'w1', initials: 'LV', name: 'Lisa Visser', role: 'Employee', status: 'Available', color: 'bg-[#0ea5e9]' },
  { id: 'w2', initials: 'ES', name: 'Emma Smit', role: 'Employee', status: 'Available', color: 'bg-[#8b5cf6]' },
  { id: 'w3', initials: 'NB', name: 'Noah Bos', role: 'Freelancer', status: 'Available', color: 'bg-[#f97316]' },
  { id: 'w4', initials: 'SB', name: 'Sophie de Boer', role: 'Employee', status: 'On Shift', color: 'bg-[#ec4899]' },
  { id: 'w5', initials: 'LM', name: 'Lucas Meijer', role: 'Freelancer', status: 'Available', color: 'bg-[#10b981]' },
  { id: 'w6', initials: 'AM', name: 'Anna Mulder', role: 'Employee', status: 'Available', color: 'bg-[#14b8a6]' },
  { id: 'w7', initials: 'DB', name: 'Daan van den Berg', role: 'Freelancer', status: 'Off Duty', color: 'bg-[#6366f1]' },
  { id: 'w8', initials: 'MD', name: 'Milan Dekker', role: 'Employee', status: 'Available', color: 'bg-[#22c55e]' },
];

const CLIENTS = ['NH Hotels', 'Hilton Group', 'Van der Valk', 'UMC Utrecht', 'Academisch Ziekenhuis'];
const LOCATIONS = ['NH Hotel Amsterdam', 'Hilton Rotterdam', 'Van der Valk Eindhoven', 'UMC Utrecht', 'NH Hotel Groningen', 'Keizersgracht Kantoren', 'Haarlem Stadsschouwburg', 'Academisch Ziekenhuis Leiden'];

const THEME_OPTIONS: ShiftTheme[] = ['blue', 'pink', 'orange', 'purple', 'green', 'teal'];

interface CreateShiftModalProps {
  onClose: () => void;
  onSave: (shifts: {
    workerName: string;
    location: string;
    date: string;
    startTime: string;
    endTime: string;
    theme: ShiftTheme;
  }[]) => void;
}

export function CreateShiftModal({ onClose, onSave }: CreateShiftModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [notes, setNotes] = useState('');

  // Step 2 state
  const [teamLeader, setTeamLeader] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Employee' | 'Freelancer'>('All');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);

  const filteredWorkers = useMemo(() => {
    return WORKERS.filter(w => {
      const matchesRole = roleFilter === 'All' || w.role === roleFilter;
      const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [searchQuery, roleFilter]);

  const selectedWorkers = WORKERS.filter(w => selectedWorkerIds.includes(w.id));

  const toggleWorker = (workerId: string) => {
    setSelectedWorkerIds(prev =>
      prev.includes(workerId)
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  const selectAll = () => {
    setSelectedWorkerIds(filteredWorkers.map(w => w.id));
  };

  const clearAll = () => {
    setSelectedWorkerIds([]);
  };

  const handleSave = () => {
    const newShifts = selectedWorkers.map((w, i) => ({
      workerName: w.name,
      location: location || 'Unassigned Location',
      date,
      startTime,
      endTime,
      theme: THEME_OPTIONS[i % THEME_OPTIONS.length],
    }));
    onSave(newShifts);
  };

  const canProceedToStep2 = location.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-[640px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1a2332] text-white px-6 py-4 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold">Create New Shift</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Step {step} of 2 — {step === 1 ? 'Shift Information' : 'Assign Employees'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors mt-1 cursor-pointer">
            <MdOutlineClose className="text-xl" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${step === 1 ? 'text-white bg-[#0ea5e9]' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
          >
            <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${step === 1 ? 'bg-white/30 text-white' : 'bg-[#0ea5e9] text-white'}`}>1</span>
            Shift Information
          </button>
          <button
            onClick={() => { if (canProceedToStep2) setStep(2); }}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${step === 2 ? 'text-white bg-[#0ea5e9]' : 'text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
          >
            <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${step === 2 ? 'bg-white/30 text-white' : 'bg-gray-300 text-white'}`}>2</span>
            Assign Employees
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
              {/* Client & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Client</label>
                  <select
                    value={client}
                    onChange={e => setClient(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select client...</option>
                    {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select location...</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Shift Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Team Leader */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Team Leader</label>
                <select
                  value={teamLeader}
                  onChange={e => setTeamLeader(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select team leader...</option>
                  {WORKERS.filter(w => w.role === 'Employee').map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9]"
                  />
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-medium">
                  {(['All', 'Employee', 'Freelancer'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${roleFilter === r ? 'bg-[#0ea5e9] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select All / Clear */}
              <div className="flex items-center gap-3">
                <button onClick={selectAll} className="text-xs font-semibold text-[#0ea5e9] border border-[#0ea5e9] px-3 py-1 rounded-full hover:bg-[#e0f2fe] transition-colors cursor-pointer">
                  Select All
                </button>
                {selectedWorkerIds.length > 0 && (
                  <button onClick={clearAll} className="text-xs font-semibold text-[#ef4444] border border-[#ef4444] px-3 py-1 rounded-full hover:bg-red-50 transition-colors cursor-pointer">
                    Clear
                  </button>
                )}
                {selectedWorkerIds.length > 0 && (
                  <span className="ml-auto text-xs font-semibold text-[#0ea5e9] bg-[#e0f2fe] px-3 py-1 rounded-full">
                    {selectedWorkerIds.length} selected
                  </span>
                )}
              </div>

              {/* Worker Grid */}
              <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
                {filteredWorkers.map(worker => {
                  const isSelected = selectedWorkerIds.includes(worker.id);
                  return (
                    <button
                      key={worker.id}
                      onClick={() => toggleWorker(worker.id)}
                      className={`flex items-center gap-3 p-3 rounded-md border-2 transition-all duration-200 text-left cursor-pointer ${isSelected ? 'border-[#0ea5e9] bg-[#f0f9ff] shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      <div className={`w-10 h-10 rounded-full ${worker.color} text-white flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0 relative`}>
                        {worker.initials}
                        {isSelected && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#0ea5e9] rounded-full flex items-center justify-center border-2 border-white">
                            <MdCheck className="text-white text-[8px]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{worker.name}</div>
                        <div className="text-[10px] text-gray-500">
                          {worker.role} · <span className={worker.status === 'Available' ? 'text-[#10b981]' : worker.status === 'On Shift' ? 'text-[#f59e0b]' : 'text-gray-400'}>{worker.status}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Assigned Tags */}
              {selectedWorkers.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Assigned</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkers.map(w => (
                      <span key={w.id} className="inline-flex items-center gap-1.5 bg-[#e0f2fe] text-[#0284c7] text-xs font-medium px-3 py-1.5 rounded-full">
                        {w.name}
                        <button onClick={() => toggleWorker(w.id)} className="hover:text-[#ef4444] transition-colors cursor-pointer">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50 flex-shrink-0">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all shadow-sm cursor-pointer ${canProceedToStep2 ? 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                Next: Assign Employees →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={selectedWorkerIds.length === 0}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all shadow-sm cursor-pointer ${selectedWorkerIds.length > 0 ? 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                Save Shift ({selectedWorkerIds.length} assigned)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

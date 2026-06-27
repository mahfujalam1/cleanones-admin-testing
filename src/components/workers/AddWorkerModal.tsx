"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MdOutlineClose, MdCloudUpload, MdCheckCircle } from 'react-icons/md';
import { Worker } from './types';

type NewWorker = Omit<Worker, 'id' | 'code' | 'completedShifts' | 'avgPhotoScore' | 'weeklyAvailability' | 'monthlyHours' | 'lateDays' | 'absentDays' | 'attendanceRecords' | 'documents' | 'invoices' | 'shiftRecords'> & {
  nidFile?: string;
  certFile?: string;
  contractFile?: string;
};

interface AddWorkerModalProps {
  onClose: () => void;
  onAdd: (worker: NewWorker) => void;
}

const LANGUAGES = ['Nederlands', 'Engels', 'Duits', 'Frans', 'Spaans', 'Pools', 'Turks', 'Arabisch'];

export function AddWorkerModal({ onClose, onAdd }: AddWorkerModalProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Nederlands', 'Engels']);
  const [name, setName] = useState('');
  const [workerType, setWorkerType] = useState<'Employee' | 'Freelancer'>('Employee');
  const [position, setPosition] = useState('Cleaner');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'On Shift' | 'Active' | 'Off Duty'>('Active');
  const [location, setLocation] = useState('Amsterdam-Centrum');

  // File Upload State
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    onAdd({
      name,
      initials: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      avatarColor: 'bg-[#0ea5e9]',
      workerType,
      position,
      location,
      languages: selectedLanguages,
      hours: '0h',
      status,
      email,
      phone,
      totalEarned: 0,
      totalPaid: 0,
      remaining: 0,
      nidFile: nidFile ? nidFile.name : undefined,
      certFile: certFile ? certFile.name : undefined,
      contractFile: contractFile ? contractFile.name : undefined
    });
  };

  return (
    <>
      {/* Modal Wrapper / Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto bg-black/40 animate-in fade-in duration-200"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-2xl w-full max-w-[560px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-7 pb-2 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add New Worker</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in worker details and upload documents.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1 -mt-1 -mr-1"
            >
              <MdOutlineClose className="text-xl" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lisa Visser"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
              />
            </div>

            {/* Worker Type + Position */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Worker Type</label>
                <select
                  value={workerType}
                  onChange={(e) => setWorkerType(e.target.value as NewWorker['workerType'])}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                >
                  <option value="Employee">Employee</option>
                  <option value="Freelancer">Freelancer</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                >
                  <option value="Cleaner">Cleaner</option>
                  <option value="Senior Cleaner">Senior Cleaner</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Specialist Cleaner">Specialist Cleaner</option>
                </select>
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@cleanones.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+31 20 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                />
              </div>
            </div>

            {/* Status + Base Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as NewWorker['status'])}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="On Shift">On Shift</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Base Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                >
                  <option value="Amsterdam-Centrum">Amsterdam-Centrum</option>
                  <option value="Rotterdam-Noord">Rotterdam-Noord</option>
                  <option value="Utrecht-Binnenstad">Utrecht-Binnenstad</option>
                  <option value="Eindhoven-Centrum">Eindhoven-Centrum</option>
                  <option value="Groningen-Centrum">Groningen-Centrum</option>
                  <option value="Haarlem-Centrum">Haarlem-Centrum</option>
                  <option value="Leiden-Centrum">Leiden-Centrum</option>
                  <option value="Delft-Centrum">Delft-Centrum</option>
                </select>
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Languages *</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${isSelected
                        ? 'bg-[#0ea5e9] text-white border-[#0ea5e9]'
                        : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider — DOCUMENTS */}
            <div className="relative pt-2">
              <div className="absolute inset-x-0 top-1/2 border-t border-gray-200" />
              <span className="relative bg-white pr-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Documents</span>
            </div>

            {/* National ID */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">National ID (NIF) *</label>
              <FileUploadArea
                onFileSelect={setNidFile}
                selectedFileName={nidFile?.name}
              />
            </div>

            {/* Certificate(s) */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Certificate(s) *</label>
              <FileUploadArea
                onFileSelect={setCertFile}
                selectedFileName={certFile?.name}
              />
            </div>

            {/* Employment Contract */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                Employment Contract <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <FileUploadArea
                onFileSelect={setContractFile}
                selectedFileName={contractFile?.name}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              + Add Worker
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
  selectedFileName?: string;
}

function FileUploadArea({ onFileSelect, selectedFileName }: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="border-2 border-dashed border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center gap-1.5 hover:border-[#0ea5e9]/40 transition-colors cursor-pointer group bg-gray-50/50"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
      />
      {selectedFileName ? (
        <>
          <MdCheckCircle className="text-2xl text-[#10b981]" />
          <span className="text-sm text-gray-800 font-semibold truncate max-w-full px-4">
            {selectedFileName}
          </span>
          <span className="text-[10px] text-gray-400">Click to change file</span>
        </>
      ) : (
        <>
          <MdCloudUpload className="text-2xl text-gray-300 group-hover:text-[#0ea5e9]/60 transition-colors" />
          <span className="text-sm text-gray-500 font-medium">Click to upload</span>
          <span className="text-[10px] text-gray-400">PDF, JPG, PNG — max 10 MB</span>
        </>
      )}
    </div>
  );
}

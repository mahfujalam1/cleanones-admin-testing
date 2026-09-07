"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MdOutlineClose, MdCloudUpload, MdCheckCircle, MdEdit } from 'react-icons/md';
import type { Worker } from './types';
import type { UpdateWorkerInput } from '@/services/actions/workers';
import { getLocations } from '@/services/actions/locations';
import { getRoomLocations } from '@/services/actions/rooms';

interface EditWorkerModalProps {
  worker: Worker;
  onClose: () => void;
  onUpdate: (workerId: string, input: UpdateWorkerInput) => Promise<string | boolean | void> | void;
  error?: string;
}

const LANGUAGES = ['Nederlands', 'Engels', 'Duits', 'Frans', 'Spaans', 'Pools', 'Turks', 'Arabisch'];

export function EditWorkerModal({ worker, onClose, onUpdate, error: externalError }: EditWorkerModalProps) {
  const [fullName, setFullName] = useState(worker.name || '');
  const [workerType, setWorkerType] = useState<'Employee' | 'Freelancer'>(worker.workerType || 'Employee');
  const [position, setPosition] = useState(worker.position || 'Cleaner');
  const [email, setEmail] = useState(worker.email || '');
  const [phone, setPhone] = useState(worker.phone || '');
  const [hourlyRate, setHourlyRate] = useState<number | ''>(worker.hourlyRate ?? 25);
  
  // Status mapping
  const initialStatusMap = (): 'active' | 'on_shift' | 'off_duty' | 'suspended' | 'banned' => {
    const s = (worker.status || '').toLowerCase().replace(' ', '_');
    if (s === 'on_shift') return 'on_shift';
    if (s === 'off_duty') return 'off_duty';
    if (s === 'suspended') return 'suspended';
    if (s === 'banned') return 'banned';
    return 'active';
  };

  const [status, setStatus] = useState<'active' | 'on_shift' | 'off_duty' | 'suspended' | 'banned'>(initialStatusMap());
  const [location, setLocation] = useState(worker.location || '');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(worker.languages && worker.languages.length > 0 ? worker.languages : ['Nederlands', 'Engels']);
  const [nationalId, setNationalId] = useState(worker.nationalId || '');
  const [certificatesInput, setCertificatesInput] = useState((worker.certificates || []).join(', '));

  const [locationOptions, setLocationOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // File Upload State
  const [nidFrontFile, setNidFrontFile] = useState<File | null>(null);
  const [nidBackFile, setNidBackFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);

  // Load locations dynamically from API
  useEffect(() => {
    let isMounted = true;
    setLocationsLoading(true);
    void getRoomLocations().then((res) => {
      if (!isMounted) return;
      if (res.success && Array.isArray(res.data?.locations) && res.data.locations.length > 0) {
        const list = res.data.locations.map((item) => ({ id: item.id, name: item.name }));
        setLocationOptions(list);
        if (!worker.location && list.length > 0) setLocation(list[0].name);
        setLocationsLoading(false);
      } else {
        void getLocations({ page: 1, limit: 100 }).then((locRes) => {
          if (!isMounted) return;
          if (locRes.success && Array.isArray(locRes.data?.locations) && locRes.data.locations.length > 0) {
            const list = locRes.data.locations.map((item) => ({ id: item.location_id, name: item.location_name || item.address }));
            setLocationOptions(list);
            if (!worker.location && list.length > 0) setLocation(list[0].name);
          }
          setLocationsLoading(false);
        });
      }
    });
    return () => { isMounted = false; };
  }, [worker.location]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (hourlyRate !== '' && (hourlyRate <= 0 || hourlyRate > 1000)) {
      setModalError('Hourly rate must be > 0 and <= 1000.');
      return;
    }

    setSubmitting(true);

    const updatePayload: UpdateWorkerInput = {
      full_name: fullName,
      name: fullName,
      email,
      phone,
      phone_number: phone,
      worker_type: workerType.toLowerCase(),
      position,
      base_location: location,
      hourly_rate: typeof hourlyRate === 'number' ? hourlyRate : undefined,
      languages: selectedLanguages,
      status,
      national_id: nationalId,
      certificates: certificatesInput
        ? certificatesInput.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    if (nidFrontFile) updatePayload.national_id_front = nidFrontFile.name;
    if (nidBackFile) updatePayload.national_id_back = nidBackFile.name;
    if (contractFile) updatePayload.employee_contract_pdf = contractFile.name;

    const err = await onUpdate(worker.id, updatePayload);

    setSubmitting(false);
    if (typeof err === 'string' && err) {
      setModalError(err);
    }
  };

  const activeError = modalError || externalError;

  return (
    <>
      {/* Modal Wrapper / Backdrop overlay */}
      <div
        onClick={onClose}
        className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4 animate-in fade-in duration-200"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-md shadow w-full max-w-[580px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-7 pb-2 shrink-0 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0ea5e9]">
                <MdEdit className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Update Worker Details</h2>
                <p className="text-xs text-gray-500">Edit details for {worker.name} ({worker.code})</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1 -mt-1 -mr-1"
            >
              <MdOutlineClose className="text-xl" />
            </button>
          </div>

          {/* Error Message inside Modal */}
          {activeError && (
            <div className="mx-7 mt-4 rounded border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 animate-in fade-in">
              {activeError}
            </div>
          )}

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rahim Ahmed"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
              />
            </div>

            {/* Worker Type + Position */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Worker Type</label>
                <select
                  value={workerType}
                  onChange={(e) => setWorkerType(e.target.value as 'Employee' | 'Freelancer')}
                  className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                >
                  <option value="Employee">Employee</option>
                  <option value="Freelancer">Freelancer</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Position</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Cleaner"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  placeholder="rahim.worker@yopmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+8801700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                />
              </div>
            </div>

            {/* Hourly Rate + Status + Base Location */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Hourly Rate (€/hr)</label>
                <input
                  type="number"
                  min="0.1"
                  max="1000"
                  step="0.1"
                  placeholder="30.5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="on_shift">On Shift</option>
                  <option value="off_duty">Off Duty</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Base Location</label>
                {locationOptions.length > 0 ? (
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={locationsLoading}
                    className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer disabled:bg-gray-50"
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc.id || loc.name} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Amsterdam-Centrum"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                  />
                )}
              </div>
            </div>

            {/* National ID & Certificates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">National ID / NID</label>
                <input
                  type="text"
                  placeholder="NID-12345678"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Certificates (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="Advanced Cleaning Cert, First Aid"
                  value={certificatesInput}
                  onChange={(e) => setCertificatesInput(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                />
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                        isSelected
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
              <span className="relative bg-white pr-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Update Document Files (Optional)</span>
            </div>

            {/* Document Upload Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">NID Front</label>
                <FileUploadArea
                  onFileSelect={setNidFrontFile}
                  selectedFileName={nidFrontFile?.name}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">NID Back</label>
                <FileUploadArea
                  onFileSelect={setNidBackFile}
                  selectedFileName={nidBackFile?.name}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Employee Contract</label>
                <FileUploadArea
                  onFileSelect={setContractFile}
                  selectedFileName={contractFile?.name}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
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
      className="border-2 border-dashed border-gray-200 rounded p-3 flex flex-col items-center justify-center gap-1 hover:border-[#0ea5e9]/40 transition-colors cursor-pointer group bg-gray-50/50 text-center"
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
          <MdCheckCircle className="text-xl text-[#10b981]" />
          <span className="text-xs text-gray-800 font-semibold truncate max-w-full px-1">
            {selectedFileName}
          </span>
          <span className="text-[9px] text-gray-400">Click to replace</span>
        </>
      ) : (
        <>
          <MdCloudUpload className="text-xl text-gray-300 group-hover:text-[#0ea5e9]/60 transition-colors" />
          <span className="text-xs text-gray-500 font-medium">Upload file</span>
          <span className="text-[9px] text-gray-400">PDF, JPG, PNG</span>
        </>
      )}
    </div>
  );
}

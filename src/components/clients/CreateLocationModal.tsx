"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MdOutlineClose, MdCloudUpload, MdCheckCircle } from 'react-icons/md';

interface CreateLocationModalProps {
  onClose: () => void;
  onSave: (locationData: { name: string; type: string; address: string; roomsCount: number }) => void;
}

export function CreateLocationModal({ onClose, onSave }: CreateLocationModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Room');
  const [address, setAddress] = useState('');
  const [roomsCount, setRoomsCount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [refImage, setRefImage] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    onSave({
      name,
      type,
      address,
      roomsCount: roomsCount || 0
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRefImage(file);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fixed inset-0 z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-md shadow w-full max-w-[500px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create Location</h2>
              <p className="text-xs text-gray-400 mt-0.5">Add a new location for client</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1"
            >
              <MdOutlineClose className="text-xl" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
            {/* Location Name */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Location Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amsterdam Hoofdkantoor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
              />
            </div>

            {/* Location Type */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Location Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
              >
                <option value="Room">Room</option>
                <option value="Office">Office</option>
                <option value="Floor">Floor</option>
              </select>
            </div>

            {/* Address & Number of Rooms */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Herengracht 500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Number of Rooms</label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={roomsCount || ''}
                  onChange={(e) => setRoomsCount(parseInt(e.target.value) || 0)}
                  className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Description</label>
              <textarea
                placeholder="Describe this location, layout, or special notes..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors resize-none"
              />
            </div>

            {/* Reference Image */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Reference Image</label>
              <div
                onClick={handleUploadClick}
                className="border-2 border-dashed border-gray-200 rounded p-5 flex flex-col items-center justify-center gap-1 hover:border-[#0ea5e9]/40 transition-colors cursor-pointer group bg-gray-50/50"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                {refImage ? (
                  <>
                    <MdCheckCircle className="text-2xl text-[#10b981]" />
                    <span className="text-sm text-gray-800 font-semibold truncate max-w-full px-4">
                      {refImage.name}
                    </span>
                    <span className="text-[10px] text-gray-400">Click to change reference image</span>
                  </>
                ) : (
                  <>
                    <MdCloudUpload className="text-2xl text-gray-300 group-hover:text-[#0ea5e9]/60 transition-colors" />
                    <span className="text-xs text-gray-600 font-semibold">Upload reference image</span>
                    <span className="text-[10px] text-gray-400">Shows workers the expected cleaning standard</span>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded shadow-sm transition-colors cursor-pointer"
              >
                + Save Location
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

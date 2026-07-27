"use client";

import React, { useState, useEffect } from 'react';
import { MdOutlineClose } from 'react-icons/md';

interface AddContactModalProps {
  onClose: () => void;
  onSave: (contactData: { name: string; role: string; email: string; phone: string }) => void;
}

export function AddContactModal({ onClose, onSave }: AddContactModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Operations Contact');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    onSave({ name, role, email, phone });
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
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-md shadow w-full max-w-[420px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add New Contact</h2>
              <p className="text-xs text-gray-400 mt-0.5">Add a contact person for this client.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1"
            >
              <MdOutlineClose className="text-xl" />
            </button>
          </div>

          {/* Fields */}
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Johan Brouwer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
              >
                <option value="Facility Manager">Facility Manager</option>
                <option value="Operations Contact">Operations Contact</option>
                <option value="Operations Manager">Operations Manager</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Email *</label>
              <input
                type="email"
                required
                placeholder="johndoe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Phone *</label>
              <input
                type="tel"
                required
                placeholder="+31 20 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
              />
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
                + Add Contact
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

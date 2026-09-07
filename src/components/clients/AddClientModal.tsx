"use client";

import React, { useState, useEffect } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import type { Client } from './types';
import { createClient } from '@/services/actions/clients';

type NewClient = Omit<Client, 'id' | 'locationsCount' | 'contractStatus' | 'contractExpiryDate' | 'activeTasks' | 'contacts' | 'locations'>;

interface AddClientModalProps {
  onClose: () => void;
  onAdd: (client: Client) => void;
}

export function AddClientModal({ onClose, onAdd }: AddClientModalProps) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState<'Corporate' | 'Healthcare' | 'Hospitality'>('Corporate');
  const [mainContactName, setMainContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseExpirationDate, setLicenseExpirationDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mainContactName || !email || !phone) return;

    if (!licenseExpirationDate) return setError('License expiration date is required');
    setSaving(true); setError(''); const result = await createClient({ company_name: name, email, industry, license_expiration_date: licenseExpirationDate, phone, primary_contact_name: mainContactName }); setSaving(false);
    if (!result.success) return setError(result.error);
    onAdd({ id: result.data.id, name: result.data.company_name, industry: result.data.industry, status: result.data.status, mainContactName: result.data.primary_contact_name, email: result.data.email, phone: result.data.phone, locationsCount: result.data.locations_count, contractStatus: result.data.contract_status, contractExpiryDate: result.data.license_expiration_date, activeTasks: 0, contacts: [], locations: [] });
  };

  return (
    <div
      onClick={onClose}
      className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-md shadow w-full max-w-[480px] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add New Client</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the client details below.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Company Name */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Company Name *</label>
            <input
              type="text"
              required
              placeholder="bijv. Schoonmaak Amsterdam BV"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
            />
          </div>

          <div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as typeof industry)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
              >
                <option value="Corporate">Corporate</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Hospitality">Hospitality</option>
              </select>
            </div>
          </div>
          <div><label className="text-xs font-semibold text-gray-700 mb-1.5 block">License Expiration Date *</label><input type="date" required value={licenseExpirationDate} onChange={(event) => setLicenseExpirationDate(event.target.value)} className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm" /></div>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          {/* Primary Contact Name */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Primary Contact Name *</label>
            <input
              type="text"
              required
              placeholder="bijv. Johan Brouwer"
              value={mainContactName}
              onChange={(e) => setMainContactName(e.target.value)}
              className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Email *</label>
              <input
                type="email"
                required
                placeholder="email@company.com"
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
                placeholder="+31 20 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded shadow-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Adding...' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  );
}

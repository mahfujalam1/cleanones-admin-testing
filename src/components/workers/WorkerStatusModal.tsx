"use client";

import React, { useState } from 'react';
import { MdOutlineClose, MdBlock } from 'react-icons/md';
import type { Worker } from './types';
import { updateWorkerStatus } from '@/services/actions/workers';
import { usePathname } from 'next/navigation';
import { getLocale } from '@/lib/locale';
import { getPlaceholderTranslation } from '@/lib/translations';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', hint: 'Worker can be scheduled and log in as usual.' },
  { value: 'suspended', label: 'Suspended', hint: 'Temporarily blocked from shifts; can be reactivated later.' },
  { value: 'banned', label: 'Banned', hint: 'Permanently blocked from the platform.' },
];

const currentStatus = (worker: Worker) => {
  const value = (worker.status || '').toLowerCase().replaceAll(' ', '_');
  return value === 'suspended' || value === 'banned' ? value : 'active';
};

export function WorkerStatusModal({ worker, onClose, onUpdated }: { worker: Worker; onClose: () => void; onUpdated: () => void }) {
  const p = getPlaceholderTranslation(getLocale(usePathname()));
  const [status, setStatus] = useState(currentStatus(worker));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    // A suspension or ban is a record someone will need to justify later, so require a note.
    if (status !== 'active' && !reason.trim()) {
      setError('Give a reason for suspending or banning this worker.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await updateWorkerStatus(worker.id, status, reason.trim());
      if (!result.success) {
        setError(result.error);
        return;
      }
      onUpdated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} className="modal-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-md bg-white shadow-xl"
      >
        <header className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600">
            <MdBlock className="text-lg" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-gray-900">Change worker status</h2>
            <p className="truncate text-xs text-gray-500">{worker.name} ({worker.code})</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            {STATUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded border p-3 transition-colors ${status === option.value ? 'border-[#0ea5e9] bg-sky-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <input
                  type="radio"
                  name="worker-status"
                  value={option.value}
                  checked={status === option.value}
                  onChange={() => setStatus(option.value)}
                  className="mt-0.5 h-4 w-4 accent-sky-500"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-800">{option.label}</span>
                  <span className="block text-xs text-gray-500">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">
              Reason {status !== 'active' && <span className="text-red-500">*</span>}
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={p.reason}
              className="min-h-20 w-full rounded border border-gray-300 bg-white p-3 text-sm outline-none transition-colors focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]"
            />
          </label>

          {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}
        </div>

        <footer className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-[#0ea5e9] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0284c7] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update status'}
          </button>
        </footer>
      </form>
    </div>
  );
}

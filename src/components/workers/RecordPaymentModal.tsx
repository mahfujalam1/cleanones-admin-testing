"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineClose, MdPayments } from 'react-icons/md';
import { createWorkerInvoice, type WorkerEarnings } from '@/services/actions/workerInvoices';
import { usePathname } from 'next/navigation';
import { getLocale } from '@/lib/locale';
import { getPlaceholderTranslation } from '@/lib/translations';

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'other', label: 'Other' },
];

const money = (value: number) => `€${value.toFixed(2)}`;

export function RecordPaymentModal({
  workerId,
  workerName,
  earnings,
  onClose,
  onRecorded,
}: {
  workerId: string;
  workerName: string;
  earnings: WorkerEarnings | null;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const p = getPlaceholderTranslation(getLocale(usePathname()));
  const now = new Date();
  const gross = earnings?.gross_earnings ?? 0;
  const alreadyPaid = earnings?.total_paid ?? 0;
  const outstanding = earnings?.balance_due ?? Math.max(gross - alreadyPaid, 0);

  // Default to clearing the outstanding balance, which is the common case.
  const [amount, setAmount] = useState<string>(outstanding > 0 ? String(outstanding) : '');
  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const parsed = Number(amount);
  const remainingAfter = Math.max(gross - alreadyPaid - (Number.isFinite(parsed) ? parsed : 0), 0);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    // Guard against overpaying: the payout cannot exceed what the worker actually earned
    // in this period minus what has already been paid out.
    if (outstanding <= 0) {
      setError('This period is already fully paid.');
      return;
    }
    if (parsed > outstanding) {
      setError(`Amount cannot exceed the outstanding balance of ${money(outstanding)}.`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await createWorkerInvoice({
        worker_id: workerId,
        amount_paid: parsed,
        period_month: earnings?.month ?? now.getMonth() + 1,
        period_year: earnings?.year ?? now.getFullYear(),
        payment_method: method,
        // Anything short of the full balance is a partial payout.
        payment_status: remainingAfter > 0 ? 'partial' : 'paid',
        ...(reference.trim() ? { payment_reference: reference.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      onRecorded();
    } finally {
      setSaving(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => { event.stopPropagation(); onClose(); }}
      className="modal-backdrop fixed inset-0 z-[95] flex items-center justify-center p-4"
    >
      <form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-md bg-white shadow-xl">
        <header className="flex items-start gap-3 border-b border-gray-200 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-[#0ea5e9]">
            <MdPayments className="text-lg" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-gray-900">Record payment</h2>
            <p className="truncate text-xs text-gray-500">{workerName}{earnings?.month_name ? ` · ${earnings.month_name}` : ''}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-2 rounded border border-gray-100 bg-gray-50 p-3 text-center">
            <div>
              <div className="text-sm font-bold text-[#0ea5e9]">{money(gross)}</div>
              <div className="text-[10px] font-semibold text-gray-400">Total earned</div>
            </div>
            <div>
              <div className="text-sm font-bold text-[#10b981]">{money(alreadyPaid)}</div>
              <div className="text-[10px] font-semibold text-gray-400">Already paid</div>
            </div>
            <div>
              <div className="text-sm font-bold text-[#f59e0b]">{money(outstanding)}</div>
              <div className="text-[10px] font-semibold text-gray-400">Outstanding</div>
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Amount paid (&euro;) <span className="text-red-500">*</span></span>
            <input
              type="number"
              min="0.01"
              max={outstanding || undefined}
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm outline-none transition-colors focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]"
            />
            <span className="mt-1 block text-[11px] text-gray-400">
              Remaining after this payment: <b className="text-gray-600">{money(remainingAfter)}</b>
            </span>
            {parsed > outstanding && outstanding > 0 && (
              <span className="mt-1 block text-[11px] font-medium text-red-600">
                Cannot pay more than the outstanding {money(outstanding)}.
              </span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Payment method</span>
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#0ea5e9] cursor-pointer"
              >
                {PAYMENT_METHODS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">Reference</span>
              <input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder={p.number}
                className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[#0ea5e9]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={p.notes}
              className="min-h-16 w-full rounded border border-gray-300 bg-white p-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[#0ea5e9]"
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
            disabled={saving || outstanding <= 0 || !Number.isFinite(parsed) || parsed <= 0 || parsed > outstanding}
            className="rounded bg-[#0ea5e9] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0284c7] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'Recording...' : 'Record payment'}
          </button>
        </footer>
      </form>
    </div>,
    document.body
  );
}

"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { MdOutlineClose, MdPayments } from "react-icons/md";
import { useCreateInvoiceMutation } from "@/redux/api/invoicesApi";
import { apiError } from "@/redux/api/apiError";
import type { Worker } from "@/redux/api/endpoints/workers.api";
import { workerName as getWorkerName } from "@/redux/api/endpoints/workers.api";
import { useModalJump } from "@/hooks/useModalJump";

const PAYMENT_METHODS = [
  { value: "Bank Transfer", label: "Bank transfer" },
  { value: "Cash", label: "Cash" },
  { value: "Card", label: "Card" },
  { value: "Other", label: "Other" },
];

const money = (value: number) => `€${value.toFixed(2)}`;

interface RecordPaymentModalProps {
  worker?: Worker | { _id?: string; id?: string; name?: string; hourly_rate?: number; hourlyRate?: number };
  workerId?: string;
  workerName?: string;
  earnings?: { gross_earnings?: number; total_paid?: number; balance_due?: number; month_name?: string } | null;
  totalEarned?: number;
  paid?: number;
  remaining?: number;
  onClose: () => void;
  onRecorded?: () => void;
}

export function RecordPaymentModal({
  worker,
  workerId,
  workerName,
  earnings,
  totalEarned,
  paid,
  remaining,
  onClose,
  onRecorded,
}: RecordPaymentModalProps) {
  const [createInvoice, { isLoading: saving }] = useCreateInvoiceMutation();

  const effectiveWorkerId = worker?._id || (worker as { id?: string })?.id || workerId || "";
  const effectiveWorkerName = worker ? getWorkerName(worker as Worker) : workerName || "Worker";

  const effectiveTotalEarned = totalEarned ?? earnings?.gross_earnings ?? 0;
  const effectivePaid = paid ?? earnings?.total_paid ?? 0;
  const effectiveRemaining = remaining ?? earnings?.balance_due ?? Math.max(effectiveTotalEarned - effectivePaid, 0);

  const now = new Date();
  const currentMonthName = earnings?.month_name || now.toLocaleString("en-US", { month: "long" });
  const currentYear = now.getFullYear();

  const [amount, setAmount] = useState<string>(effectiveRemaining > 0 ? String(effectiveRemaining) : "");
  const [method, setMethod] = useState("Bank Transfer");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const parsed = Number(amount);
  const remainingAfter = Math.max(effectiveRemaining - (Number.isFinite(parsed) ? parsed : 0), 0);
  const { triggerJump, jumpClassName } = useModalJump();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Please enter a valid payment amount greater than €0.00");
      return;
    }
    if (parsed > effectiveRemaining && effectiveRemaining > 0) {
      setError(`Payment cannot exceed the remaining balance of ${money(effectiveRemaining)}`);
      return;
    }
    if (!transactionId.trim()) {
      setError("Please provide a valid Transaction ID.");
      return;
    }
    setError("");

    try {
      await createInvoice({
        worker: effectiveWorkerId,
        amount: parsed,
        payment_method: method,
        transaction_id: transactionId.trim(),
        notes: notes.trim() || undefined,
      }).unwrap();

      onRecorded?.();
      onClose();
    } catch (cause) {
      setError(apiError(cause));
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget && !saving) {
          triggerJump();
        }
      }}
      className="modal-backdrop fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-100 ${jumpClassName}`}
      >
        <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-[#0ea5e9]">
            <MdPayments className="text-xl" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-slate-900">Record payment</h2>
            <p className="truncate text-xs text-slate-500">
              {effectiveWorkerName} · {currentMonthName} {currentYear}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        <div className="space-y-4 p-5">

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-center">
            <div>
              <div className="text-sm font-bold text-[#0ea5e9]">{money(effectiveTotalEarned)}</div>
              <div className="text-[10px] font-semibold text-slate-400">Total earned</div>
            </div>
            <div>
              <div className="text-sm font-bold text-[#10b981]">{money(effectivePaid)}</div>
              <div className="text-[10px] font-semibold text-slate-400">Already paid</div>
            </div>
            <div>
              <div className="text-sm font-bold text-[#f59e0b]">{money(effectiveRemaining)}</div>
              <div className="text-[10px] font-semibold text-slate-400">Outstanding</div>
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              Amount paid (€) <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              min="0.01"
              max={effectiveRemaining > 0 ? effectiveRemaining : undefined}
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]"
            />
            <span className="mt-1.5 block text-[11px] text-slate-500">
              Remaining after this payment: <b className="text-slate-700">{money(remainingAfter)}</b>
            </span>
            {parsed > effectiveRemaining && effectiveRemaining > 0 && (
              <span className="mt-1 block text-[11px] font-medium text-red-600">
                Cannot pay more than the outstanding {money(effectiveRemaining)}.
              </span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Payment method</span>
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#0ea5e9] cursor-pointer"
              >
                {PAYMENT_METHODS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Transaction ID <span className="text-red-500">*</span>
              </span>
              <input
                required
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                placeholder="e.g. TXN-2026-0912-001"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">Notes</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add notes or instructions..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] resize-none"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 animate-in fade-in">
              {error}
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || effectiveRemaining <= 0 || !Number.isFinite(parsed) || parsed <= 0 || parsed > effectiveRemaining || !transactionId.trim()}
            className="rounded-lg bg-[#0ea5e9] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0284c7] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
          >
            {saving ? "Recording..." : "Record payment"}
          </button>
        </footer>
      </form>
    </div>,
    document.body
  );
}

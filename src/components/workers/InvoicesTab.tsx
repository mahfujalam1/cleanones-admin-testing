"use client";

import React, { useState } from "react";
import { MdPayments } from "react-icons/md";
import { useGetAllInvoicesQuery } from "@/redux/api/invoicesApi";
import type { Worker } from "@/redux/api/endpoints/workers.api";
import { RecordPaymentModal } from "./RecordPaymentModal";

const money = (value?: number) => `€${(value ?? 0).toFixed(2)}`;

export function InvoicesTab({ worker }: { worker: Worker }) {
  const [recording, setRecording] = useState(false);

  const {
    data: invoicesData,
    isLoading,
    refetch,
  } = useGetAllInvoicesQuery({
    worker: worker._id,
    limit: 100,
  });

  const invoices = invoicesData?.result ?? [];


  const invoicesSum = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const paid = worker.total_paid !== undefined ? worker.total_paid : invoicesSum;
  
  const totalEarned =
    worker.total_earning !== undefined && worker.total_earning > 0
      ? worker.total_earning
      : worker.pending_amount !== undefined
      ? (worker.pending_amount || 0) + paid
      : paid;

  const remaining =
    worker.pending_amount !== undefined
      ? worker.pending_amount
      : Math.max(totalEarned - paid, 0);

  const fullyPaid = remaining <= 0;

  const now = new Date();
  const currentMonthName = now.toLocaleString("en-US", { month: "long" });
  const currentYear = now.getFullYear();

  const rate = worker.hourly_rate ?? 0;
  const hours = rate > 0 ? (totalEarned / rate).toFixed(1) : undefined;

  return (
    <div className="space-y-4">
      {/* 3 Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#e0f7fa] border border-[#b2ebf2] rounded-lg p-3.5 sm:p-4 text-center">
          <div className="text-base sm:text-lg font-bold text-[#0ea5e9]">{money(totalEarned)}</div>
          <div className="text-[10px] sm:text-[11px] text-[#0ea5e9] font-semibold mt-1">Total Earned</div>
        </div>
        <div className="bg-[#e8f5e9] border border-[#c8e6c9] rounded-lg p-3.5 sm:p-4 text-center">
          <div className="text-base sm:text-lg font-bold text-[#10b981]">{money(paid)}</div>
          <div className="text-[10px] sm:text-[11px] text-[#10b981] font-semibold mt-1">Paid</div>
        </div>
        <div className="bg-[#fff3e0] border border-[#ffe0b2] rounded-lg p-3.5 sm:p-4 text-center">
          <div className="text-base sm:text-lg font-bold text-[#f59e0b]">{money(remaining)}</div>
          <div className="text-[10px] sm:text-[11px] text-[#f59e0b] font-semibold mt-1">Remaining</div>
        </div>
      </div>

      {/* Period summary banner */}
      <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="font-medium text-slate-700">
            {currentMonthName} {currentYear}
          </span>
          <span className="font-semibold text-slate-700">
            {hours !== undefined ? `${hours}h × ${money(rate)}/hr = ${money(totalEarned)}` : money(totalEarned)}
          </span>
        </div>
        <div className="mt-0.5 text-[11px] text-slate-400">
          {invoices.length} payment(s) recorded
        </div>
      </div>

      {/* Record payment action button */}
      {fullyPaid ? (
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
        >
          <MdPayments className="text-base" /> Fully paid for this period
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setRecording(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#0ea5e9] bg-white px-4 py-2 text-xs font-semibold text-[#0ea5e9] transition-all hover:bg-[#0ea5e9] hover:text-white cursor-pointer shadow-2xs active:scale-[0.99]"
        >
          <MdPayments className="text-base" /> Record payment
        </button>
      )}

      {/* Invoices Table */}
      {isLoading ? (
        <div className="space-y-2 py-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center">
          <p className="text-xs font-medium text-slate-500">No payments recorded yet</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Recorded payout invoices for this worker will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-100 bg-white overflow-hidden shadow-2xs">
          <div className="grid grid-cols-[1.5fr_1fr_0.8fr_1fr_0.7fr] gap-2 px-4 py-2.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div>Invoice / TXN #</div>
            <div>Method</div>
            <div>Rate</div>
            <div>Amount</div>
            <div className="text-right">Status</div>
          </div>
          <div className="divide-y divide-slate-50">
            {invoices.map((invoice) => {
              const invoiceDate = invoice.createdAt;
              const dateFormatted = invoiceDate
                ? new Date(invoiceDate).toLocaleDateString()
                : "--";

              return (
                <div
                  key={invoice._id}
                  className="grid grid-cols-[1.5fr_1fr_0.8fr_1fr_0.7fr] gap-2 items-center px-4 py-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-900" title={invoice.transaction_id || invoice._id}>
                      {invoice.transaction_id || invoice._id}
                    </div>
                    <div className="text-[10px] text-slate-400">{dateFormatted}</div>
                  </div>
                  <div className="text-xs text-slate-600 truncate" title={invoice.payment_method}>
                    {invoice.payment_method || "Bank Transfer"}
                  </div>
                  <div className="text-xs text-slate-600">
                    {rate > 0 ? money(rate) : "—"}
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {money(invoice.amount)}
                  </div>
                  <div className="text-right text-xs font-semibold text-[#10b981] capitalize">
                    Paid
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {recording && (
        <RecordPaymentModal
          worker={worker}
          totalEarned={totalEarned}
          paid={paid}
          remaining={remaining}
          onClose={() => setRecording(false)}
          onRecorded={() => {
            void refetch();
          }}
        />
      )}
    </div>
  );
}

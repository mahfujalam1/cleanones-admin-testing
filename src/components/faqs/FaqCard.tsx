"use client";

import React from "react";
import { FiHelpCircle, FiEdit2, FiTrash2, FiMessageSquare } from "react-icons/fi";
import type { FaqItem } from "@/services/actions/faqs";

interface FaqCardProps {
  item: FaqItem;
  serialNo?: number;
  onEdit: (item: FaqItem) => void;
  onDelete: (item: FaqItem) => void;
}

export function FaqCard({ item, serialNo, onEdit, onDelete }: FaqCardProps) {
  const serial = serialNo ?? item.serial_no ?? 1;
  const rawDate = item.updatedAt || item.createdAt;
  const parsedDate = rawDate ? new Date(rawDate) : null;
  const formattedDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString("en-US")
      : new Date().toLocaleDateString("en-US");

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs">
      <div>
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="shrink-0 rounded bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-600">
              #{serial}
            </span>
            <FiHelpCircle className="h-4 w-4 shrink-0 text-sky-500" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-[15px] leading-snug">
              {item.question}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              title="Edit FAQ"
              onClick={() => onEdit(item)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            >
              <FiEdit2 className="text-xs" />
            </button>
            <button
              type="button"
              title="Delete FAQ"
              onClick={() => onDelete(item)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-slate-200 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <FiTrash2 className="text-xs" />
            </button>
          </div>
        </div>

        
        <div className="my-3.5 flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/90 p-3 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">
          <FiMessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
          <p className="whitespace-pre-line font-normal">{item.answer}</p>
        </div>
      </div>

      
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 pt-1">
        <span>Order: #{serial}</span>
        <span>Updated: {formattedDate}</span>
      </div>
    </article>
  );
}

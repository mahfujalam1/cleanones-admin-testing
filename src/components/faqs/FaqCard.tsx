"use client";

import React, { useState } from "react";
import {
  MdEdit,
  MdDeleteOutline,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdQuestionAnswer,
  MdHelpOutline,
} from "react-icons/md";
import type { FaqItem } from "@/services/actions/faqs";

interface FaqCardProps {
  item: FaqItem;
  onEdit: (item: FaqItem) => void;
  onDelete: (item: FaqItem) => void;
}

export function FaqCard({ item, onEdit, onDelete }: FaqCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Serial Number Badge */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-xs font-bold text-primary border border-sky-100">
            #{item.serial_no}
          </span>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-snug flex items-start gap-1.5">
              <MdHelpOutline className="text-primary text-lg mt-0.5 shrink-0" />
              <span>{item.question}</span>
            </h3>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            title="Edit FAQ"
            onClick={() => onEdit(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors cursor-pointer"
          >
            <MdEdit className="text-base" />
          </button>
          <button
            type="button"
            title="Delete FAQ"
            onClick={() => onDelete(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
          >
            <MdDeleteOutline className="text-base" />
          </button>
        </div>
      </div>

      {/* Answer */}
      <div className="mt-3.5 rounded-xl bg-slate-50/80 p-3.5 border border-slate-100 text-sm text-slate-700">
        <div className="flex items-start gap-2">
          <MdQuestionAnswer className="text-slate-400 text-base mt-0.5 shrink-0" />
          <div className="flex-1 whitespace-pre-line leading-relaxed">
            {expanded || item.answer.length <= 150
              ? item.answer
              : `${item.answer.slice(0, 150)}...`}
          </div>
        </div>

        {item.answer.length > 150 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            {expanded ? (
              <>Show less <MdKeyboardArrowUp /></>
            ) : (
              <>Read full answer <MdKeyboardArrowDown /></>
            )}
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-400">
        <span>Order: #{item.serial_no}</span>
        <span>Updated: {new Date(item.updated_at || item.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

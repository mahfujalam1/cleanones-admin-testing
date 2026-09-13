"use client";

import React, { useState } from "react";
import { MdEdit, MdDeleteOutline, MdKeyboardArrowDown } from "react-icons/md";
import type { FaqItem } from "@/services/actions/faqs";

interface FaqCardProps {
  item: FaqItem;
  onEdit: (item: FaqItem) => void;
  onDelete: (item: FaqItem) => void;
  /** Open by default — used for the first row so the list never looks empty. */
  defaultOpen?: boolean;
}

export function FaqCard({ item, onEdit, onDelete, defaultOpen = false }: FaqCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className="group rounded-xl border border-slate-200 bg-white shadow-2xs transition-all hover:border-primary/40">
      <div className="flex items-start gap-3 p-3.5">
        {/* Serial */}
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-[11px] font-bold text-primary">
          {item.serial_no}
        </span>

        {/* Question — whole row toggles the answer */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-primary">{item.question}</h3>
          {!open && (
            <p className="mt-1 truncate text-xs text-slate-500">{item.answer}</p>
          )}
        </button>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            title="Edit FAQ"
            onClick={() => onEdit(item)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-primary/40 hover:bg-sky-50 hover:text-primary"
          >
            <MdEdit className="text-base" />
          </button>
          <button
            type="button"
            title="Delete FAQ"
            onClick={() => onDelete(item)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <MdDeleteOutline className="text-base" />
          </button>
          <button
            type="button"
            aria-label={open ? "Collapse answer" : "Expand answer"}
            onClick={() => setOpen(!open)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <MdKeyboardArrowDown className={`text-lg transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-3.5 py-3 pl-[3.75rem]">
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-600">{item.answer}</p>
          <p className="mt-2.5 text-[11px] text-slate-400">
            Updated {new Date(item.updated_at || item.created_at).toLocaleDateString()}
          </p>
        </div>
      )}
    </article>
  );
}

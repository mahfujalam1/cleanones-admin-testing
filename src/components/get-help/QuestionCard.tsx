"use client";

import React, { useState } from "react";
import { MdEdit, MdDeleteOutline, MdKeyboardArrowDown } from "react-icons/md";
import type { SuggestedQuestion } from "@/services/actions/suggestedQuestions";

interface QuestionCardProps {
  item: SuggestedQuestion;
  onEdit: (item: SuggestedQuestion) => void;
  onDelete: (item: SuggestedQuestion) => void;
  /** Open by default — used when the list has a single row so it never looks empty. */
  defaultOpen?: boolean;
}

export function QuestionCard({ item, onEdit, onDelete, defaultOpen = false }: QuestionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Sources that omit timestamps would otherwise render "Invalid Date".
  const raw = item.updated_at || item.created_at;
  const parsed = raw ? new Date(raw) : null;
  const stamp = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString() : "";

  return (
    <article className="group rounded-xl border border-slate-200 bg-white shadow-2xs transition-all hover:border-primary/40">
      <div className="flex items-start gap-3 p-3.5">
        {/* Question — the whole row toggles the answer */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-primary">{item.question}</h3>
          {!open && <p className="mt-1 truncate text-xs text-slate-500">{item.answer}</p>}
        </button>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            title="Edit Question"
            onClick={() => onEdit(item)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-primary/40 hover:bg-sky-50 hover:text-primary"
          >
            <MdEdit className="text-base" />
          </button>
          <button
            type="button"
            title="Delete Question"
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
        <div className="border-t border-slate-100 px-3.5 py-3">
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-600">{item.answer}</p>
          {stamp && <p className="mt-2.5 text-[11px] text-slate-400">Updated {stamp}</p>}
        </div>
      )}
    </article>
  );
}

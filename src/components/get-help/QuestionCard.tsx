"use client";

import React, { useState } from "react";
import {
  MdEdit,
  MdDeleteOutline,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdHelp,
  MdQuestionAnswer,
  MdBusinessCenter,
  MdPeople,
  MdPublic,
} from "react-icons/md";
import type { SuggestedQuestion } from "@/services/actions/suggestedQuestions";

interface QuestionCardProps {
  item: SuggestedQuestion;
  onEdit: (item: SuggestedQuestion) => void;
  onDelete: (item: SuggestedQuestion) => void;
  onToggleStatus: (item: SuggestedQuestion) => void;
  isUpdating?: boolean;
}

const roleBadges: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  all: { label: "General (All)", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: MdPublic },
  client: { label: "Client", className: "bg-sky-50 text-sky-700 border-sky-200", icon: MdBusinessCenter },
  worker: { label: "Worker", className: "bg-violet-50 text-violet-700 border-violet-200", icon: MdPeople },
};

export function QuestionCard({ item, onEdit, onDelete, onToggleStatus, isUpdating }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const roleConfig = roleBadges[item.target_role.toLowerCase()] ?? {
    label: item.target_role,
    className: "bg-slate-100 text-slate-700 border-slate-200",
    icon: MdPublic,
  };
  const RoleIcon = roleConfig.icon;

  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Role Badge & Question */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${roleConfig.className}`}>
              <RoleIcon className="text-xs" />
              {roleConfig.label}
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                item.is_active
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {item.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug flex items-start gap-2">
            <MdHelp className="text-primary text-lg mt-0.5 shrink-0" />
            <span>{item.question}</span>
          </h3>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            title="Edit Question"
            onClick={() => onEdit(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
          >
            <MdEdit className="text-base" />
          </button>
          <button
            type="button"
            title="Delete Question"
            onClick={() => onDelete(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <MdDeleteOutline className="text-base" />
          </button>
        </div>
      </div>

      {/* Answer Preview / Full */}
      <div className="mt-3 rounded-xl bg-slate-50/80 p-3.5 border border-slate-100 text-sm text-slate-700">
        <div className="flex items-start gap-2">
          <MdQuestionAnswer className="text-slate-400 text-base mt-0.5 shrink-0" />
          <div className="flex-1 whitespace-pre-line leading-relaxed">
            {expanded || item.answer.length <= 140
              ? item.answer
              : `${item.answer.slice(0, 140)}...`}
          </div>
        </div>

        {item.answer.length > 140 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {expanded ? <>Show less <MdKeyboardArrowUp /></> : <>Read full answer <MdKeyboardArrowDown /></>}
          </button>
        )}
      </div>

      {/* Footer: Status Toggle & Dates */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div>
          Updated: {new Date(item.updated_at || item.created_at).toLocaleDateString()}
        </div>
        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onToggleStatus(item)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
            item.is_active
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          {item.is_active ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { MdWarning } from "react-icons/md";
import type { SuggestedQuestion } from "@/services/actions/suggestedQuestions";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  question?: SuggestedQuestion;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  question,
  isLoading,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const t = getHelpTranslation(getLocale(usePathname()));
  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-100">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
            <MdWarning className="text-2xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">
              {t.delete} {t.question}?
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {t.noFaqMatch}
            </p>
            <div className="mt-2.5 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700 italic border border-slate-100">
              &ldquo;{question.question}&rdquo;
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {isLoading ? t.deleting : t.yesDelete}
          </button>
        </div>
      </div>
    </div>
  );
}

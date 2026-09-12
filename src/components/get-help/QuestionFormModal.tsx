"use client";

import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import type { SuggestedQuestion, TargetRole } from "@/services/actions/suggestedQuestions";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";
import { getPlaceholderTranslation } from "@/lib/translations";

interface QuestionFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: SuggestedQuestion;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: { question: string; answer: string; target_role: string; is_active: boolean }) => void;
}

export function QuestionFormModal({
  isOpen,
  mode,
  initialData,
  isLoading,
  onClose,
  onSubmit,
}: QuestionFormModalProps) {
  const t = getHelpTranslation(getLocale(usePathname()));
  const p = getPlaceholderTranslation(getLocale(usePathname()));
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [targetRole, setTargetRole] = useState<string>("all");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setQuestion(initialData.question);
        setAnswer(initialData.answer);
        setTargetRole(initialData.target_role || "all");
        setIsActive(initialData.is_active);
      } else {
        setQuestion("");
        setAnswer("");
        setTargetRole("all");
        setIsActive(true);
      }
      setError("");
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError(t.questionRequired);
      return;
    }
    if (!answer.trim()) {
      setError(t.answerRequired);
      return;
    }
    setError("");
    onSubmit({
      question: question.trim(),
      answer: answer.trim(),
      target_role: targetRole,
      is_active: isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === "create" ? t.addQuestion : t.editQuestion}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.question} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={p.task}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.answer} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={p.notes}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.targetRole}
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">{t.generalAll}</option>
              <option value="client">{t.clientsOnly}</option>
              <option value="worker">{t.workersOnly}</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Determines who sees this question in their chat FAQ suggestions.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active_toggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
            />
            <label htmlFor="is_active_toggle" className="text-xs font-medium text-slate-700 cursor-pointer">
              Set question as active immediately
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isLoading ? t.deleting : mode === "create" ? t.createQuestion : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

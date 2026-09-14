"use client";

import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import type { FaqItem } from "@/services/actions/faqs";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";
import { getPlaceholderTranslation } from "@/lib/translations";
import { useModalJump } from "@/hooks/useModalJump";

interface FaqFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: FaqItem;
  nextSerialNo?: number;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: { question: string; answer: string; serial_no: number }) => void;
}

export function FaqFormModal({
  isOpen,
  mode,
  initialData,
  nextSerialNo = 1,
  isLoading,
  onClose,
  onSubmit,
}: FaqFormModalProps) {
  const t = getHelpTranslation(getLocale(usePathname()));
  const p = getPlaceholderTranslation(getLocale(usePathname()));
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [serialNo, setSerialNo] = useState<number>(1);
  const [error, setError] = useState("");
  const { triggerJump, jumpClassName } = useModalJump();

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setQuestion(initialData.question);
        setAnswer(initialData.answer);
        setSerialNo(initialData.serial_no ?? 1);
      } else {
        setQuestion("");
        setAnswer("");
        setSerialNo(nextSerialNo);
      }
      setError("");
    }
  }, [isOpen, mode, initialData, nextSerialNo]);

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
      serial_no: Number(serialNo) || 1,
    });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          triggerJump();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className={`w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-100 ${jumpClassName}`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === "create" ? t.addNewFaq : t.editFaq}
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
              {t.serial} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              readOnly
              value={serialNo}
              className="w-32 rounded-xl border border-slate-200 bg-slate-100/90 px-3.5 py-2 text-sm font-semibold text-slate-600 cursor-not-allowed select-none focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Auto-generated sequence number (Read Only).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.question} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
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
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={p.notes}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? t.deleting : mode === "create" ? t.addFaq : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

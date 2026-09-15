"use client";

import React from "react";
import { MdOutlineWarningAmber, MdClose } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
import { useModalJump } from "@/hooks/useModalJump";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmText,
  cancelText,
  destructive = true,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const { triggerJump, jumpClassName } = useModalJump();

  const ui = getUiTranslation(getLocale(usePathname()));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 animate-in fade-in duration-150 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          triggerJump();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-lg border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 ${jumpClassName}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                destructive ? "bg-red-50 text-red-600" : "bg-sky-50 text-sky-600"
              }`}
            >
              <MdOutlineWarningAmber className="text-xl" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{ui.confirmAction}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <MdClose className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="text-xs leading-relaxed text-slate-600 font-normal">{description}</p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelText ?? ui.cancel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-medium text-white shadow-xs transition-colors disabled:opacity-50 ${
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {loading ? `${ui.delete}…` : (confirmText ?? ui.delete)}
          </button>
        </div>
      </div>
    </div>
  );
}

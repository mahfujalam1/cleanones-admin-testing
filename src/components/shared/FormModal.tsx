"use client";

import React, { useEffect } from "react";
import { MdOutlineClose } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
import { useModalJump } from "@/hooks/useModalJump";

type FormModalProps = {
  title: string;
  subtitle?: string;
  submitLabel: string;
  saving?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
};


export function FormModal({
  title,
  subtitle,
  submitLabel,
  saving = false,
  error,
  onClose,
  onSubmit,
  children,
}: FormModalProps) {
  const { triggerJump, jumpClassName } = useModalJump();
  const ui = getUiTranslation(getLocale(usePathname()));

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose, saving]);

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          triggerJump();
        }
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className={`flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${jumpClassName}`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={ui.close}
            className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">{children}</div>



        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-6 py-5">
          {error && (
            <p
              role="alert"
              className="mr-auto min-w-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            >
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {ui.cancel}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7] disabled:opacity-60"
          >
            {saving ? `${ui.save}…` : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

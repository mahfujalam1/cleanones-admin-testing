"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { MdCheck, MdOutlineClose, MdOutlineTimer } from "react-icons/md";

export type ApproveDurationCopy = {
  title: string;
  hint: string;
  label: string;
  minutes: string;
  cancel: string;
  confirm: string;
  saving: string;
  invalid: string;
};

/**
 * Sits on top of the request modal: the manager confirms (or corrects) the task duration
 * before the request is approved. `onConfirm` resolves to `null` once the duration has been
 * saved and the approval went through, at which point this closes first and the caller
 * closes the request modal behind it. Any other value is a failure message, which is shown
 * here rather than on the request modal underneath — the manager is looking at this dialog.
 */
export function ApproveDurationModal({
  copy,
  initialMinutes,
  onCancel,
  onConfirm,
}: {
  copy: ApproveDurationCopy;
  initialMinutes?: number;
  onCancel: () => void;
  onConfirm: (minutes: number) => Promise<string | null>;
}) {
  const [value, setValue] = useState(
    initialMinutes && initialMinutes > 0 ? String(initialMinutes) : ""
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const minutes = Number(value);
    if (!Number.isFinite(minutes) || !Number.isInteger(minutes) || minutes <= 0) {
      setError(copy.invalid);
      return;
    }
    setError("");
    setBusy(true);
    const failure = await onConfirm(minutes);
    // On success the parent unmounts this modal, so the reset only matters on failure.
    if (failure) {
      setError(failure);
      setBusy(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="modal-backdrop fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <MdOutlineTimer className="text-lg" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">{copy.title}</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{copy.hint}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label={copy.cancel}
            className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-50"
          >
            <MdOutlineClose className="text-lg" />
          </button>
        </header>

        <div className="px-5 py-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">{copy.label}</span>
            <div className="relative">
              <input
                type="number"
                min={1}
                step={1}
                autoFocus
                value={value}
                disabled={busy}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit();
                }}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-3.5 pr-16 text-sm text-slate-800 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50"
                placeholder="20"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                {copy.minutes}
              </span>
            </div>
          </label>
          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            >
              {error}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-sky-700 disabled:opacity-50"
          >
            <MdCheck className="text-base" />
            {busy ? copy.saving : copy.confirm}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

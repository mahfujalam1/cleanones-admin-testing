"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { MdCheck, MdOutlineClose, MdOutlineTimer } from "react-icons/md";
import type { PhotoRequirement } from "@/redux/api/endpoints/additionalTasks.api";

export type ApproveDurationCopy = {
  title: string;
  hint: string;
  label: string;
  minutes: string;
  cancel: string;
  confirm: string;
  saving: string;
  invalid: string;
  photoRequired: string;
  photoName: string;
  addPhoto: string;
  remove: string;
  photoNeeded: string;
  photoUnnamed: string;
};

/** What the manager settled on in this dialog, applied to the task before it is approved. */
export type ApproveDecision = {
  minutes: number;
  is_photo_required: boolean;
  photo_requirements: PhotoRequirement[];
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
  initialPhotoRequired,
  initialPhotoTitles,
  onCancel,
  onConfirm,
}: {
  copy: ApproveDurationCopy;
  initialMinutes?: number;
  initialPhotoRequired?: boolean;
  initialPhotoTitles?: string[];
  onCancel: () => void;
  onConfirm: (decision: ApproveDecision) => Promise<string | null>;
}) {
  const [value, setValue] = useState(
    initialMinutes && initialMinutes > 0 ? String(initialMinutes) : ""
  );
  const [photoRequired, setPhotoRequired] = useState(Boolean(initialPhotoRequired));
  const [titles, setTitles] = useState<string[]>(
    initialPhotoTitles?.length ? initialPhotoTitles : [""]
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const editTitle = (index: number, next: string) => {
    setTitles((current) => current.map((title, i) => (i === index ? next : title)));
    setError("");
  };

  const submit = async () => {
    const minutes = Number(value);
    if (!Number.isFinite(minutes) || !Number.isInteger(minutes) || minutes <= 0) {
      setError(copy.invalid);
      return;
    }

    const named = titles.map((title) => title.trim()).filter(Boolean);
    if (photoRequired) {
      if (named.length === 0) {
        setError(copy.photoNeeded);
        return;
      }
      // A blank row would be dropped from the payload without saying so.
      if (named.length !== titles.length) {
        setError(copy.photoUnnamed);
        return;
      }
    }

    setError("");
    setBusy(true);
    const failure = await onConfirm({
      minutes,
      is_photo_required: photoRequired,
      photo_requirements: photoRequired
        ? named.map((title) => ({ title, photo_url: "", is_uploaded: false }))
        : [],
    });
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
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
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

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
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
          <div className="border-t border-slate-100 pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={photoRequired}
                disabled={busy}
                onChange={(e) => {
                  setPhotoRequired(e.target.checked);
                  setError("");
                }}
                className="h-4 w-4 rounded border-slate-300 accent-sky-600"
              />
              {copy.photoRequired}
            </label>

            {photoRequired && (
              <div className="ml-1.5 mt-3 space-y-2 border-l-2 border-sky-500 pl-4">
                {titles.map((title, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={title}
                      disabled={busy}
                      onChange={(e) => editTitle(index, e.target.value)}
                      placeholder={copy.photoName}
                      className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                    />
                    <button
                      type="button"
                      disabled={busy || titles.length === 1}
                      onClick={() => {
                        setTitles((current) => current.filter((_, i) => i !== index));
                        setError("");
                      }}
                      className="cursor-pointer text-xs font-semibold text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {copy.remove}
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setTitles((current) => [...current, ""]);
                    setError("");
                  }}
                  className="cursor-pointer text-xs font-semibold text-sky-600 transition-colors hover:text-sky-700 disabled:opacity-50"
                >
                  {copy.addPhoto}
                </button>
              </div>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            >
              {error}
            </p>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
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

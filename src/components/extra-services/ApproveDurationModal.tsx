"use client";

import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { MdCheck, MdOutlineClose, MdOutlineTimer } from "react-icons/md";
import { getLocale } from "@/lib/locale";
import { getScreenCopy } from "@/lib/screen-copy";
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
  required: string;
  photoRequired: string;
  photoName: string;
  addPhoto: string;
  remove: string;
  photoNeeded: string;
  photoUnnamed: string;
};

export type ApproveDecision = {
  minutes: number;
  is_photo_required: boolean;
  photo_requirements: PhotoRequirement[];
};

const blankPhoto = (): PhotoRequirement => ({
  title: "",
  description: "",
  reference_image_url: "",
  photo_url: "",
  is_uploaded: false,
});

function parseDuration(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return null;
  const minutes = Number(trimmed);
  if (!Number.isInteger(minutes) || minutes <= 0) return null;
  return minutes;
}

function isInvalidHttpUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol !== "http:" && url.protocol !== "https:";
  } catch {
    return true;
  }
}

export function ApproveDurationModal({
  copy,
  initialMinutes,
  initialPhotoRequired,
  initialPhotoRequirements,
  onCancel,
  onConfirm,
}: {
  copy: ApproveDurationCopy;
  initialMinutes?: number;
  initialPhotoRequired?: boolean;
  initialPhotoRequirements?: PhotoRequirement[];
  onCancel: () => void;
  onConfirm: (decision: ApproveDecision) => Promise<string | null>;
}) {
  const screen = getScreenCopy(getLocale(usePathname()));
  const [value, setValue] = useState(
    initialMinutes && initialMinutes > 0 ? String(initialMinutes) : ""
  );
  const [photoRequired, setPhotoRequired] = useState(Boolean(initialPhotoRequired));
  const [photoRequirements, setPhotoRequirements] = useState<PhotoRequirement[]>(
    initialPhotoRequirements?.length
      ? initialPhotoRequirements.map((requirement) => ({
          ...requirement,
          title: requirement.title ?? "",
          description: requirement.description ?? "",
          reference_image_url: requirement.reference_image_url ?? "",
          photo_url: requirement.photo_url ?? "",
          is_uploaded: Boolean(requirement.is_uploaded),
        }))
      : [blankPhoto()]
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const namedPhotoRequirements = photoRequirements.filter((requirement) => requirement.title.trim() !== "");

  const updateRequirement = (index: number, patch: Partial<PhotoRequirement>) => {
    setPhotoRequirements((current) =>
      current.map((requirement, i) => (i === index ? { ...requirement, ...patch } : requirement))
    );
    setError("");
  };

  const minutes = parseDuration(value);

  const submit = async () => {
    if (!value.trim()) {
      setError(copy.required);
      return;
    }
    if (minutes == null) {
      setError(copy.invalid);
      return;
    }

    if (photoRequired) {
      if (photoRequirements.length === 0 || namedPhotoRequirements.length === 0) {
        setError(copy.photoNeeded);
        return;
      }
      if (namedPhotoRequirements.length !== photoRequirements.length) {
        setError(copy.photoUnnamed);
        return;
      }
      const invalidReference = photoRequirements.find((requirement) =>
        isInvalidHttpUrl(requirement.reference_image_url)
      );
      if (invalidReference) {
        setError(`Enter a valid reference image URL for "${invalidReference.title.trim()}".`);
        return;
      }
    }

    setError("");
    setBusy(true);
    const failure = await onConfirm({
      minutes,
      is_photo_required: photoRequired,
      photo_requirements: photoRequired
        ? namedPhotoRequirements.map((requirement) => ({
            title: requirement.title.trim(),
            description: requirement.description?.trim() ?? "",
            reference_image_url: requirement.reference_image_url?.trim() ?? "",
            photo_url: "",
            is_uploaded: false,
          }))
        : [],
    });

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
        className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
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
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              {copy.label} <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <input
                type="number"
                min={1}
                step={1}
                required
                aria-required="true"
                autoFocus
                value={value}
                disabled={busy}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError("");
                }}
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
              <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{screen.photoInstructions}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {screen.photoInstructionsHint}
                  </p>
                </div>

                {photoRequirements.map((req, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {screen.requiredPhoto} {index + 1}
                      </span>
                      <button
                        type="button"
                        disabled={busy || photoRequirements.length === 1}
                        onClick={() => {
                          setPhotoRequirements((current) => current.filter((_, i) => i !== index));
                          setError("");
                        }}
                        className="cursor-pointer text-xs font-semibold text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {copy.remove}
                      </button>
                    </div>

                    <div className="grid gap-3">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                          {screen.title} <span className="text-red-500">*</span>
                        </span>
                        <input
                          type="text"
                          value={req.title}
                          disabled={busy}
                          onChange={(e) => updateRequirement(index, { title: e.target.value })}
                          placeholder={copy.photoName}
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                          {screen.workerInstruction}
                        </span>
                        <textarea
                          value={req.description ?? ""}
                          disabled={busy}
                          onChange={(e) => updateRequirement(index, { description: e.target.value })}
                          rows={2}
                          placeholder={screen.workerInstructionPlaceholder}
                          className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-5 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                          {screen.exampleImageUrl}
                        </span>
                        <div className="flex items-center gap-3">
                          {req.reference_image_url?.trim() ? (
                            <img
                              src={req.reference_image_url}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-md border border-slate-200 bg-slate-50 object-cover"
                            />
                          ) : null}
                          <input
                            type="url"
                            value={req.reference_image_url ?? ""}
                            disabled={busy}
                            onChange={(e) => updateRequirement(index, { reference_image_url: e.target.value })}
                            placeholder="https://..."
                            className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50"
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setPhotoRequirements((current) => [...current, blankPhoto()]);
                    setError("");
                  }}
                  className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-sky-500/30 bg-white px-3 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-50 disabled:opacity-50"
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
            disabled={busy || minutes == null}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
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

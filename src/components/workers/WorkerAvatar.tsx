"use client";

import { useState } from "react";

/**
 * Worker avatar.
 *
 * The API carries no photo yet, so this falls back to the worker's initials on a tinted disc —
 * a placeholder that still tells rows apart, unlike one shared silhouette repeated down the
 * column. Pass `src` and a real photo takes over; a broken URL falls back the same way.
 */

const SIZES = {
  sm: "h-9 w-9 text-[11px]",
  md: "h-11 w-11 text-xs",
  lg: "h-14 w-14 text-sm",
} as const;

function initials(name?: string) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function WorkerAvatar({
  name,
  src,
  size = "sm",
}: {
  name?: string;
  src?: string;
  size?: keyof typeof SIZES;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(src) && !failed;

  if (showPhoto) {
    return (
      // A plain <img>: the photo host is not known ahead of time, so next/image cannot be configured for it.
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${SIZES[size]} shrink-0 rounded-full border border-slate-200 bg-white object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden
      title={name}
      className={`${SIZES[size]} flex shrink-0 select-none items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-semibold tracking-wide text-slate-500`}
    >
      {initials(name)}
    </span>
  );
}

"use client";

import React from "react";

/**
 * The red counter that sits on the notification bell and the Chat nav item. Counts past 99
 * are shown as "99+" so the pill keeps a predictable width.
 */
export function CountBadge({
  count,
  label,
  className = "",
}: {
  count: number;
  label: string;
  className?: string;
}) {
  if (count <= 0) return null;

  return (
    <span
      role="status"
      aria-label={`${count} ${label}`}
      className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white tabular-nums ring-2 ring-white ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

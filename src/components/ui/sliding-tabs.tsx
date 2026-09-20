"use client";

import type React from "react";
import Link from "next/link";

export type SlidingTabOption = {
  value: string;
  label: React.ReactNode;
  href?: string;
  count?: number;
};

export function SlidingTabs({
  value,
  options,
  onValueChange,
  className = "",
  compact = false,
}: {
  value: string;
  options: readonly SlidingTabOption[];
  onValueChange?: (value: string) => void;
  className?: string;
  compact?: boolean;
}) {
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const columns = Math.max(options.length, 1);
  const itemClass = `relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap rounded px-3 font-medium transition-colors duration-300 ${
    compact ? "h-7 text-[10px]" : "h-8 text-xs"
  }`;

  return (
    <div
      className={`relative grid max-w-full overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-0.5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(max-content, 1fr))` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0.5 left-0.5 top-0.5 rounded border border-slate-200 bg-white shadow-2xs transition-transform duration-300 ease-out"
        style={{
          width: `calc((100% - 4px) / ${columns})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {options.map((option) => {
        const active = option.value === value;
        const content = (
          <>
            <span>{option.label}</span>
            {typeof option.count === "number" && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                  active ? "bg-sky-50 text-primary" : "bg-slate-200/70 text-slate-500"
                }`}
              >
                {option.count}
              </span>
            )}
          </>
        );
        const stateClass = active ? "text-primary" : "text-slate-500 hover:text-slate-800";

        return option.href ? (
          <Link
            key={option.value}
            href={option.href}
            aria-current={active ? "page" : undefined}
            className={`${itemClass} ${stateClass}`}
          >
            {content}
          </Link>
        ) : (
          <button
            key={option.value}
            type="button"
            onClick={() => onValueChange?.(option.value)}
            aria-pressed={active}
            className={`${itemClass} cursor-pointer ${stateClass}`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

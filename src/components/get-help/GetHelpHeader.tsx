"use client";

import React from "react";
import { MdAdd, MdHelpOutline } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

interface GetHelpHeaderProps {
  total: number;
  onAddClick: () => void;
}

export function GetHelpHeader({ total, onAddClick }: GetHelpHeaderProps) {
  const t = getHelpTranslation(getLocale(usePathname()));
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white shadow-2xs">
          <MdHelpOutline className="text-xl" />
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold leading-tight text-slate-900">{t.getHelp}</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{total}</span>
          </div>
          <p className="truncate text-xs text-slate-500 mt-0.5">{t.getHelpDesc}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-sky-600 active:scale-[0.98]"
      >
        <MdAdd className="text-lg" />
        <span>{t.addQuestion}</span>
      </button>
    </div>
  );
}

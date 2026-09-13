"use client";

import React from "react";
import Link from "next/link";
import { MdArrowBack, MdAdd, MdLiveHelp } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

interface FaqHeaderProps {
  total: number;
  onAddClick: () => void;
}

export function FaqHeader({ total, onAddClick }: FaqHeaderProps) {
  const t = getHelpTranslation(getLocale(usePathname()));
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2.5">
        <Link
          href="/get-help"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-2xs transition-all hover:bg-slate-50 hover:text-primary"
          title={t.getHelp}
        >
          <MdArrowBack className="text-lg" />
        </Link>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-600">
          <MdLiveHelp className="text-xl" />
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold leading-tight text-slate-900">{t.faqManagement}</h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{total}</span>
          </div>
          <p className="truncate text-xs text-slate-500">{t.faqDesc}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.98]"
      >
        <MdAdd className="text-lg" />
        <span>{t.addFaq}</span>
      </button>
    </div>
  );
}

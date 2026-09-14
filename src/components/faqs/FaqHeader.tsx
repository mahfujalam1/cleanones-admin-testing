"use client";

import React from "react";
import Link from "next/link";
import { MdArrowBack, MdAdd, MdLiveHelp } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale, localizePath } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

interface FaqHeaderProps {
  total: number;
  onAddClick: () => void;
  backHref?: string;
}

export function FaqHeader({ total, onAddClick, backHref = "/settings" }: FaqHeaderProps) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getHelpTranslation(locale);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={localizePath(backHref, locale)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
          title="Back"
        >
          <MdArrowBack className="text-base" />
        </Link>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-2xs">
          <MdLiveHelp className="text-lg" />
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold leading-tight text-slate-900">{t.faqManagement}</h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{total}</span>
          </div>
          <p className="truncate text-xs text-slate-500 mt-0.5">{t.faqDesc}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-sky-600 active:scale-[0.98]"
      >
        <MdAdd className="text-lg" />
        <span>{t.addFaq}</span>
      </button>
    </div>
  );
}

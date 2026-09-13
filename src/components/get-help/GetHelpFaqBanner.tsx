"use client";

import React from "react";
import Link from "next/link";
import { MdLiveHelp, MdArrowForward } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

interface GetHelpFaqBannerProps {
  /** Slim single-line strip that links to the FAQ manager. */
  compact?: boolean;
}

export function GetHelpFaqBanner({ compact = true }: GetHelpFaqBannerProps) {
  const t = getHelpTranslation(getLocale(usePathname()));
  return (
    <Link
      href="/get-help/faqs"
      className="group flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-3 shadow-2xs transition-colors hover:border-amber-300 hover:bg-amber-50"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
        <MdLiveHelp className="text-xl" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">{t.faqs}</h2>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
            {t.generalHelp}
          </span>
        </div>
        {!compact && <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{t.faqDesc}</p>}
      </div>

      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white transition-colors group-hover:bg-amber-700">
        <span className="hidden sm:inline">{t.manageFaqs}</span>
        <MdArrowForward className="text-base transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { MdLiveHelp, MdArrowForward } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

export function GetHelpFaqBanner() {
  const t = getHelpTranslation(getLocale(usePathname()));
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <MdLiveHelp className="text-2xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {t.faqs}
              </h2>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                {t.generalHelp}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600 max-w-xl leading-relaxed">
              {t.faqDesc}
            </p>
          </div>
        </div>

        <Link
          href="/get-help/faqs"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-all shrink-0 cursor-pointer"
        >
          <span>{t.manageFaqs}</span>
          <MdArrowForward className="text-base" />
        </Link>
      </div>
    </div>
  );
}

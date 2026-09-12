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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
      <div className="flex items-center gap-3">
        {/* Back Page Arrow */}
        <Link
          href="/get-help"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary transition-all shadow-xs shrink-0"
          title="Back to Get Help"
        >
          <MdArrowBack className="text-xl" />
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-sm border border-amber-100 shrink-0">
            <MdLiveHelp className="text-2xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {t.faqManagement}
              </h1>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {total}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.faqDesc}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none active:scale-[0.98] transition-all shrink-0"
      >
        <MdAdd className="text-lg" />
        <span>{t.addFaq}</span>
      </button>
    </div>
  );
}

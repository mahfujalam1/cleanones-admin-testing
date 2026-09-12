"use client";

import React from "react";
import { MdAdd, MdHelpOutline, MdPeople, MdBusinessCenter, MdCheckCircle } from "react-icons/md";
import type { GetHelpStats } from "./types";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

interface GetHelpHeaderProps {
  stats: GetHelpStats;
  onAddClick: () => void;
}

export function GetHelpHeader({ stats, onAddClick }: GetHelpHeaderProps) {
  const t = getHelpTranslation(getLocale(usePathname()));
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm border border-sky-100">
            <MdHelpOutline className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {t.getHelp}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.getHelpDesc}
            </p>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
            {t.total}: <strong className="font-semibold text-slate-900">{stats.total}</strong>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
            <MdCheckCircle className="text-sm" /> {t.active}: <strong className="font-semibold">{stats.active}</strong>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
            <MdBusinessCenter className="text-sm" /> {t.clients}: <strong className="font-semibold">{stats.clients}</strong>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-violet-700">
            <MdPeople className="text-sm" /> {t.workers}: <strong className="font-semibold">{stats.workers}</strong>
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.98] transition-all shrink-0"
      >
        <MdAdd className="text-lg" />
        <span>{t.addQuestion}</span>
      </button>
    </div>
  );
}

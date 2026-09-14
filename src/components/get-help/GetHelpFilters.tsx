"use client";

import React from "react";
import { MdSearch, MdClose } from "react-icons/md";
import type { GetHelpFilterState } from "./types";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

interface GetHelpFiltersProps {
  filters: GetHelpFilterState;
  onChange: (filters: GetHelpFilterState) => void;
  resultCount?: number;
}

export function GetHelpFilters({ filters, onChange }: GetHelpFiltersProps) {
  const t = getHelpTranslation(getLocale(usePathname()));

  return (
    <div className="relative w-full">
      <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
      <input
        type="text"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder={t.searchQuestion || "Search questions or answers..."}
        className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs outline-none transition-all focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
      />
      {filters.search && (
        <button
          type="button"
          aria-label={t.clear}
          onClick={() => onChange({ ...filters, search: "" })}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <MdClose />
        </button>
      )}
    </div>
  );
}

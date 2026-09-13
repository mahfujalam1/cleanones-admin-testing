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

export function GetHelpFilters({ filters, onChange, resultCount }: GetHelpFiltersProps) {
  const t = getHelpTranslation(getLocale(usePathname()));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
      <div className="relative">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder={t.searchQuestion}
          className="w-full rounded-lg bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {filters.search && (
          <button
            type="button"
            aria-label={t.clear}
            onClick={() => onChange({ ...filters, search: "" })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <MdClose />
          </button>
        )}
      </div>

      {filters.search && (
        <div className="mt-2.5 flex items-center gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          {typeof resultCount === "number" && (
            <span className="font-medium text-slate-600">
              {resultCount} {resultCount === 1 ? "result" : "results"}
            </span>
          )}
          <button
            type="button"
            onClick={() => onChange({ search: "" })}
            className="ml-auto cursor-pointer rounded-md px-2 py-1 font-semibold text-primary hover:bg-sky-50"
          >
            {t.clear}
          </button>
        </div>
      )}
    </div>
  );
}

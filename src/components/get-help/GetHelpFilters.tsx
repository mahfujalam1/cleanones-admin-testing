"use client";

import React from "react";
import { MdSearch, MdClose, MdFilterList } from "react-icons/md";
import type { GetHelpFilterState } from "./types";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

interface GetHelpFiltersProps {
  filters: GetHelpFilterState;
  onChange: (filters: GetHelpFilterState) => void;
}

export function GetHelpFilters({ filters, onChange }: GetHelpFiltersProps) {
  const t = getHelpTranslation(getLocale(usePathname()));
  const roleOptions = [
    { value: "", label: t.allRoles }, { value: "all", label: t.generalAll },
    { value: "client", label: t.clientsOnly }, { value: "worker", label: t.workersOnly },
  ];
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder={t.searchQuestion}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, search: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <MdClose />
          </button>
        )}
      </div>

      {/* Target Role & Status Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Role Pills */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-medium">
          {roleOptions.map((opt) => {
            const active = filters.role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...filters, role: opt.value })}
                className={`rounded-lg px-3 py-1.5 transition-all ${active
                    ? "bg-white text-primary shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as GetHelpFilterState["status"] })
            }
            className="rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">{t.statusAll}</option>
            <option value="active">{t.activeOnly}</option>
            <option value="inactive">{t.inactiveOnly}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

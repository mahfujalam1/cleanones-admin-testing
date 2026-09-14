"use client";

import React from "react";
import { TbClipboardCheck } from "react-icons/tb";

interface ReportBlueprintHeaderProps {
  rangeLabel: string;
  dateRange?: string;
}

export function ReportBlueprintHeader({ rangeLabel, dateRange }: ReportBlueprintHeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 bg-white p-4 rounded-xl shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-primary border border-sky-100">
          <TbClipboardCheck className="text-2xl" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-bold text-slate-900">
              CleanOnes Quality Control & Performance Report
            </h1>
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800">
              {rangeLabel}
            </span>
            {dateRange && (
              <span className="text-xs text-slate-500 font-medium">({dateRange})</span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Automated operational metrics, shift trends, and quality analysis blueprint.
          </p>
        </div>
      </div>

      <div className="text-left sm:text-right text-xs text-slate-500 shrink-0">
        <p className="font-semibold text-slate-700">CleanOnes Operations</p>
        <p className="text-[11px] text-slate-400">Generated: {currentDate}</p>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { MdPictureAsPdf } from "react-icons/md";
import { TbLoader2 } from "react-icons/tb";
import type { ReportRange } from "./types";

interface ReportHeaderProps {
  ranges: ReportRange[];
  activeRange: ReportRange;
  rangeLabels: Record<ReportRange, string>;
  exporting: boolean;
  onRangeChange: (range: ReportRange) => void;
  onExportPdf: () => void;
  exportLabel?: string;
}

export function ReportHeader({
  ranges,
  activeRange,
  rangeLabels,
  exporting,
  onRangeChange,
  onExportPdf,
  exportLabel = "Generate PDF",
}: ReportHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 no-print">
      {/* Timeframe Selector */}
      <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-xs">
        {ranges.map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => onRangeChange(range)}
            className={`text-xs px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeRange === range
                ? "bg-[#0ea5e9] text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {rangeLabels[range]}
          </button>
        ))}
      </div>

      {/* PDF Generate & Download Button */}
      <button
        type="button"
        onClick={onExportPdf}
        disabled={exporting}
        className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 hover:text-primary active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        title="Generate PDF blueprint without sidebar"
      >
        {exporting ? (
          <>
            <TbLoader2 className="text-base text-primary animate-spin" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <MdPictureAsPdf className="text-base text-red-500" />
            <span>{exportLabel}</span>
          </>
        )}
      </button>
    </div>
  );
}

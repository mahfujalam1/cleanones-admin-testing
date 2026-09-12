"use client";

import React, { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { ContentSkeleton } from "@/components/shared/SkeletonLoader";
import type { ReportTimeframe } from "@/services/actions/reports";
import { useGetQualityControlReportQuery } from "@/redux/api/reportsApi";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import type { ReportRange } from "@/components/reports/types";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportBlueprintHeader } from "@/components/reports/ReportBlueprintHeader";
import { ReportMetricCards } from "@/components/reports/ReportMetricCards";
import { ShiftTrendsChart } from "@/components/reports/ShiftTrendsChart";
import { QualityDistributionChart } from "@/components/reports/QualityDistributionChart";
import { exportReportToPdf } from "@/components/reports/exportReportPdf";

const ranges: ReportRange[] = ["Week", "Month", "Quarter", "Year"];

export default function ReportsPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const [activeRange, setActiveRange] = useState<ReportRange>("Month");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const blueprintRef = useRef<HTMLDivElement | null>(null);

  const rangeLabels: Record<ReportRange, string> = {
    Week: t.reports.week,
    Month: t.reports.month,
    Quarter: t.reports.quarter,
    Year: t.reports.year,
  };

  const timeframe = activeRange.toLowerCase() as ReportTimeframe;
  const { data: report, isLoading: loading } = useGetQualityControlReportQuery(timeframe);

  const handleGeneratePdf = async () => {
    if (!blueprintRef.current) return;
    setExporting(true);
    setError("");
    try {
      const fileName = `CleanOnes-Report-${activeRange}-${new Date().toISOString().slice(0, 10)}.pdf`;
      const success = await exportReportToPdf(blueprintRef.current, fileName);
      if (!success) {
        setError("Could not generate PDF. Please try again.");
      }
    } catch (err: unknown) {
      console.error("PDF generation exception:", err);
      const msg = err instanceof Error ? err.message : "An error occurred while generating the PDF blueprint.";
      setError(msg);
    } finally {
      setExporting(false);
    }
  };

  const shiftTrendData = (report?.shift_trends ?? []).map((item) => ({
    label: item.label,
    count: item.count,
  }));

  const distribution = report?.photo_quality_distribution;
  const qualityData = [
    { name: t.reports.approved, value: distribution?.approved ?? 0, color: "#0ea5e9" },
    { name: t.reports.pending, value: distribution?.pending ?? 0, color: "#f59e0b" },
    { name: t.reports.rejected, value: distribution?.rejected ?? 0, color: "#ef4444" },
  ];

  return (
    <div className="space-y-5 pb-10">
      {/* Top Action Header (Range filters + PDF download button) */}
      <ReportHeader
        ranges={ranges}
        activeRange={activeRange}
        rangeLabels={rangeLabels}
        exporting={exporting}
        onRangeChange={setActiveRange}
        onExportPdf={handleGeneratePdf}
        exportLabel="Generate PDF"
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 shadow-xs">
          {error}
        </div>
      )}

      {loading ? (
        <ContentSkeleton />
      ) : (
        /* Printable & Capturable Report Blueprint Section (excludes sidebar and navigation) */
        <div ref={blueprintRef} className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <ReportBlueprintHeader rangeLabel={rangeLabels[activeRange]} />

          <ReportMetricCards
            totalShifts={report?.total_shifts ?? 0}
            photosApproved={report?.total_photos_approved ?? 0}
            escalations={report?.escalations_count ?? 0}
            labels={{
              totalShifts: t.reports.totalShifts,
              totalPhotosApproved: t.reports.totalPhotosApproved,
              escalations: t.reports.escalations,
            }}
          />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
            <ShiftTrendsChart
              title={`${rangeLabels[activeRange]} ${t.reports.shiftTrends}`}
              data={shiftTrendData}
            />

            <QualityDistributionChart
              title={t.reports.photoQualityDistribution}
              data={qualityData}
            />
          </div>
        </div>
      )}
    </div>
  );
}

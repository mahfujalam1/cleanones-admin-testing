"use client";

import React, { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { ContentSkeleton } from "@/components/shared/SkeletonLoader";
import type { ReportTimeframe } from "@/redux/api/reportsApi";
import { useGetShiftReportQuery } from "@/redux/api/reportsApi";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
import { getDashboardTranslation } from "@/lib/translations";
import type { ReportRange } from "@/components/reports/types";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportBlueprintHeader } from "@/components/reports/ReportBlueprintHeader";
import { ReportMetricCards } from "@/components/reports/ReportMetricCards";
import { ShiftTrendsChart } from "@/components/reports/ShiftTrendsChart";
import { QualityDistributionChart } from "@/components/reports/QualityDistributionChart";
import { exportReportToPdf } from "@/components/reports/exportReportPdf";

const ranges: ReportRange[] = ["Week", "Month", "Year"];

export default function ReportsPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const ui = getUiTranslation(getLocale(usePathname()));
  const t = getDashboardTranslation(locale);

  const [activeRange, setActiveRange] = useState<ReportRange>("Month");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const blueprintRef = useRef<HTMLDivElement | null>(null);

  const rangeLabels: Record<ReportRange, string> = {
    Week: t.reports.week,
    Month: t.reports.month,
    Year: t.reports.year,
  };

  const timeframe = activeRange.toLowerCase() as ReportTimeframe;
  const { data: report, isLoading: loading } = useGetShiftReportQuery(timeframe);

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
    label: item.label !== undefined && item.label !== null ? String(item.label) : (item.date ? String(item.date).slice(8, 10) : ""),
    count: Number(item.total_shift ?? item.count ?? 0),
  }));

  const issueStatus = report?.issue_report_status;
  const distribution = report?.photo_quality_distribution;

  const qualityData = issueStatus
    ? [
        { name: "Resolved", value: Number(issueStatus.RESOLVED ?? 0), color: "#10b981" },
        { name: "In Progress", value: Number(issueStatus.IN_PROGRESS ?? 0), color: "#f59e0b" },
        { name: "Pending", value: Number(issueStatus.PENDING ?? 0), color: "#ef4444" },
      ]
    : [
        { name: t.reports.approved, value: Number(distribution?.approved ?? 0), color: "#0ea5e9" },
        { name: t.reports.pending, value: Number(distribution?.pending ?? 0), color: "#f59e0b" },
        { name: t.reports.rejected, value: Number(distribution?.rejected ?? 0), color: "#ef4444" },
      ];

  const qualityChartTitle = issueStatus
    ? ui.issueStatusBreakdown
    : t.reports.photoQualityDistribution;

  const totalShifts = report?.summary?.total_shift ?? report?.total_shifts ?? 0;
  const totalIssues = report?.summary?.total_issue_report ?? report?.escalations_count ?? 0;
  const resolvedIssues = issueStatus ? Number(issueStatus.RESOLVED ?? 0) : undefined;
  const pendingIssues = issueStatus ? Number((issueStatus.PENDING ?? 0) + (issueStatus.IN_PROGRESS ?? 0)) : undefined;

  const dateRangeStr =
    report?.range?.from && report?.range?.to
      ? `${new Date(report.range.from).toLocaleDateString()} – ${new Date(report.range.to).toLocaleDateString()}`
      : undefined;

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
        exportLabel={ui.generatePdf}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 shadow-xs">
          {error}
        </div>
      )}

      {loading ? (
        <ContentSkeleton />
      ) : (
        /* Printable & Capturable Report Blueprint Section */
        <div ref={blueprintRef} className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <ReportBlueprintHeader
            rangeLabel={rangeLabels[activeRange]}
            dateRange={dateRangeStr}
          />

          <ReportMetricCards
            totalShifts={totalShifts}
            escalations={totalIssues}
            resolvedIssues={resolvedIssues}
            pendingIssues={pendingIssues}
            photosApproved={report?.total_photos_approved}
            labels={{
              totalShifts: t.reports.totalShifts,
              escalations: t.reports.escalations || ui.issueReports,
              resolvedIssues: ui.resolvedIssues,
              pendingIssues: ui.openIssues,
              totalPhotosApproved: t.reports.totalPhotosApproved,
            }}
          />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
            <ShiftTrendsChart
              title={`${rangeLabels[activeRange]} ${t.reports.shiftTrends}`}
              data={shiftTrendData}
            />

            <QualityDistributionChart
              title={qualityChartTitle}
              data={qualityData}
            />
          </div>
        </div>
      )}
    </div>
  );
}

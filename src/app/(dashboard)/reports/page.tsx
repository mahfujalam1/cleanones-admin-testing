"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MdInsertDriveFile } from "react-icons/md";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ContentSkeleton } from "@/components/shared/SkeletonLoader";
import { exportQualityControlPdf, type ReportTimeframe } from "@/services/actions/reports";
import { useGetQualityControlReportQuery } from "@/redux/api/reportsApi";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

type ReportRange = "Week" | "Month" | "Quarter" | "Year";

const ranges: ReportRange[] = ["Week", "Month", "Quarter", "Year"];

export default function ReportsPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const rangeLabels: Record<ReportRange, string> = {
    Week: t.reports.week,
    Month: t.reports.month,
    Quarter: t.reports.quarter,
    Year: t.reports.year,
  };

  const [activeRange, setActiveRange] = useState<ReportRange>("Month");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const timeframe = activeRange.toLowerCase() as ReportTimeframe;

  const { data: report, isLoading: loading } = useGetQualityControlReportQuery(timeframe);

  const downloadPdf = async () => {
    setExporting(true);
    const result = await exportQualityControlPdf(timeframe);
    setExporting(false);
    if (!result.success) return setError(result.error);
    window.open(result.data, "_blank", "noopener,noreferrer");
  };

  const shiftTrendData = (report?.shift_trends ?? []).map((item) => ({ label: item.label, count: item.count }));
  const distribution = report?.photo_quality_distribution;
  const qualityData = [
    { name: t.reports.approved, value: distribution?.approved ?? 0, color: "#0ea5e9" },
    { name: t.reports.pending, value: distribution?.pending ?? 0, color: "#f59e0b" },
    { name: t.reports.rejected, value: distribution?.rejected ?? 0, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex rounded border border-gray-200 bg-white p-1">
          {ranges.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setActiveRange(range)}
              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                activeRange === range
                  ? "bg-cyan-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {rangeLabels[range]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void downloadPdf()}
          disabled={exporting}
          className="flex h-9 items-center gap-1.5 rounded border border-gray-200 bg-gray-100 px-3 text-sm font-semibold text-slate-500 shadow-sm transition-colors hover:bg-white cursor-pointer"
        >
          <MdInsertDriveFile className="text-base" />
          {exporting ? t.reports.exporting : t.reports.pdf}
        </button>
      </div>

      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <ContentSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard label={t.reports.totalShifts} value={(report?.total_shifts ?? 0).toLocaleString()} />
            <MetricCard label={t.reports.totalPhotosApproved} value={(report?.total_photos_approved ?? 0).toLocaleString()} />
            <MetricCard label={t.reports.escalations} value={(report?.escalations_count ?? 0).toLocaleString()} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
            <section className="dashboard-card p-5">
              <h2 className="mb-5 text-sm font-bold text-slate-950">
                {rangeLabels[activeRange]} {t.reports.shiftTrends}
              </h2>
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shiftTrendData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      ticks={[0, 95, 190, 285, 380]}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(14, 165, 233, 0.08)" }}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="dashboard-card p-5">
              <h2 className="mb-5 text-sm font-bold text-slate-950">
                {t.reports.photoQualityDistribution}
              </h2>
              <div className="grid min-h-[210px] grid-cols-1 items-center gap-6 md:grid-cols-[1fr_1fr]">
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={qualityData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={0}
                        outerRadius={70}
                        stroke="#ffffff"
                        strokeWidth={3}
                      >
                        {qualityData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {qualityData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-8">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-500">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-950">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <section className="dashboard-card px-5 py-6">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
    </section>
  );
}

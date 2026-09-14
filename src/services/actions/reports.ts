import { authenticated, type ActionResult } from "./auth";

export type ReportPeriod = "week" | "month" | "quarter" | "year";
export type ReportTimeframe = ReportPeriod;

export type ShiftReportData = {
  total_shifts?: number;
  total_completed_shift?: number;
  total_in_progress_shift?: number;
  total_pending_shift?: number;
  total_worker_late?: number;
  total_photos_approved?: number;
  escalations_count?: number;
  total_issue_report?: number;
  shift_trends?: Array<{ label: string; count: number; date?: string }>;
  photo_quality_distribution?: {
    approved: number;
    pending: number;
    rejected: number;
  };
  [key: string]: any;
};

export async function getShiftReport(
  period: ReportPeriod = "month"
): Promise<ActionResult<ShiftReportData>> {
  return authenticated<ShiftReportData>(`/shift/report?period=${period}`, {
    method: "GET",
  });
}

export const getQualityControlReport = (timeframe: ReportPeriod) =>
  getShiftReport(timeframe);

export async function exportQualityControlPdf(
  timeframe: ReportPeriod
): Promise<ActionResult<string>> {
  const result = await authenticated<string>(
    `/manager/reports/quality-control/pdf?timeframe=${timeframe}`,
    { method: "GET" }
  );
  if (!result.success) return result;
  const base = (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    ""
  ).replace(/\/$/, "");
  return {
    success: true,
    data: result.data.startsWith("http")
      ? result.data
      : `${base}${result.data.startsWith("/") ? "" : "/"}${result.data}`,
  };
}

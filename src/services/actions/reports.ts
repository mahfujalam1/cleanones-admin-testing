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


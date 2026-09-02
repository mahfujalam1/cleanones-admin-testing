import { authenticated, type ActionResult } from "./auth";

export type ReportTimeframe = "week" | "month" | "quarter" | "year";
export type QualityControlReport = { timeframe: ReportTimeframe; total_shifts: number; total_photos_approved: number; escalations_count: number; shift_trends: Array<{ label: string; count: number }>; photo_quality_distribution: { approved: number; pending: number; rejected: number }; pdf_download_url: string };

export async function getQualityControlReport(timeframe: ReportTimeframe) { return authenticated<QualityControlReport>(`/manager/reports/quality-control?timeframe=${timeframe}`, { method: "GET" }); }
export async function exportQualityControlPdf(timeframe: ReportTimeframe): Promise<ActionResult<string>> { const result = await authenticated<string>(`/manager/reports/quality-control/pdf?timeframe=${timeframe}`, { method: "GET" }); if (!result.success) return result; const base = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, ""); return { success: true, data: result.data.startsWith("http") ? result.data : `${base}${result.data.startsWith("/") ? "" : "/"}${result.data}` }; }

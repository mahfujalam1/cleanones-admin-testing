import { baseApi } from "./baseApi";

export type ReportPeriod = "week" | "month" | "quarter" | "year";
export type ReportTimeframe = ReportPeriod;

export type ShiftTrendPoint = {
  label?: string | number;
  date?: string;
  total_shift?: number;
  count?: number;
};

export type IssueReportStatusBreakdown = {
  PENDING?: number;
  IN_PROGRESS?: number;
  RESOLVED?: number;
};

export type PhotoQualityDistribution = {
  approved: number;
  pending: number;
  rejected: number;
};

export type ShiftReportData = {
  period?: string;
  range?: { from: string; to: string };
  summary?: { total_shift?: number; total_issue_report?: number };
  shift_trends?: ShiftTrendPoint[];
  issue_report_status?: IssueReportStatusBreakdown;
  total_shifts?: number;
  total_photos_approved?: number;
  escalations_count?: number;
  photo_quality_distribution?: PhotoQualityDistribution;
};

export const reportsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getShiftReport: builder.query<ShiftReportData, ReportPeriod | void>({
      query: (period) => `/shift/report?period=${period || "month"}`,
      providesTags: (_res, _err, period) => [
        { type: "reports" as never, id: period || "month" },
      ],
    }),
  }),
});

export const { useGetShiftReportQuery } = reportsApi;

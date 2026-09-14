import { baseApi } from "./baseApi";
import type { ShiftReportData, ReportPeriod } from "@/services/actions/reports";

export const reportsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getShiftReport: builder.query<ShiftReportData, ReportPeriod | void>({
      query: (period) => `/shift/report?period=${period || "month"}`,
      providesTags: (_res, _err, period) => [
        { type: "reports" as never, id: period || "month" },
      ],
    }),
    getQualityControlReport: builder.query<ShiftReportData, ReportPeriod | void>({
      query: (period) => `/shift/report?period=${period || "month"}`,
      providesTags: (_res, _err, period) => [
        { type: "reports" as never, id: period || "month" },
      ],
    }),
    exportQualityControlPdf: builder.query<string, ReportPeriod>({
      query: (timeframe) =>
        `/manager/reports/quality-control/pdf?timeframe=${timeframe}`,
    }),
  }),
});

export const {
  useGetShiftReportQuery,
  useGetQualityControlReportQuery,
  useExportQualityControlPdfQuery,
} = reportsApi;

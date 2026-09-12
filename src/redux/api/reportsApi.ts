import { baseApi } from "./baseApi";
import type { QualityControlReport, ReportTimeframe } from "@/services/actions/reports";

export const reportsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getQualityControlReport: builder.query<QualityControlReport, ReportTimeframe>({
      query: (timeframe) => `/manager/reports/quality-control?timeframe=${timeframe}`,
      providesTags: (_res, _err, timeframe) => [{ type: "reports" as never, id: timeframe }],
    }),
    exportQualityControlPdf: builder.query<string, ReportTimeframe>({
      query: (timeframe) => `/manager/reports/quality-control/pdf?timeframe=${timeframe}`,
    }),
  }),
});

export const {
  useGetQualityControlReportQuery,
  useExportQualityControlPdfQuery,
} = reportsApi;

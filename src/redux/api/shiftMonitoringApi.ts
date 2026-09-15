import { baseApi } from "./baseApi";
import type { LiveWorker, AttendanceWorker, Period } from "@/services/actions/shiftMonitoring";

export const shiftMonitoringApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLiveStatus: builder.query<
      { total_shifts_count: number; ontime_count: number; late_count: number; missing_count: number; page: number; limit: number; has_more: boolean; items: LiveWorker[] },
      { page?: number; limit?: number; date?: string; status?: string; workerType?: string; search?: string } | void
    >({
      query: (input) => {
        const q = new URLSearchParams({
          page: String(input?.page ?? 1),
          limit: String(input?.limit ?? 20),
        });
        if (input?.date) q.set("date_val", input.date);
        if (input?.status) q.set("checkin_status", input.status);
        if (input?.workerType) q.set("worker_type", input.workerType);
        if (input?.search) q.set("search", input.search);
        return `/manager/shift-monitoring/live-status?${q.toString()}`;
      },
      providesTags: ["shiftMonitoring" as never],
    }),
    getLocationStatistics: builder.query<
      { total_count: number; page: number; limit: number; has_more: boolean; locations: Array<{ location_id: string; location_name: string; client_id: string; client_name: string; workers_count: number; hours_worked: string; hours_worked_numeric: number; shifts_count: number }> },
      { period?: Period; search?: string; page?: number; limit?: number } | void
    >({
      query: (input) => {
        const q = new URLSearchParams({
          period: input?.period ?? "monthly",
          page: String(input?.page ?? 1),
          limit: String(input?.limit ?? 20),
        });
        if (input?.search) q.set("search", input.search);
        return `/manager/shift-monitoring/location-statistics?${q.toString()}`;
      },
      providesTags: ["shiftMonitoring" as never],
    }),
  }),
});

export const {
  useGetLiveStatusQuery,
  useGetLocationStatisticsQuery,
} = shiftMonitoringApi;

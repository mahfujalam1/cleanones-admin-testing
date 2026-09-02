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
          limit: String(input?.limit ?? 100),
        });
        if (input?.date) q.set("date_val", input.date);
        if (input?.status) q.set("checkin_status", input.status);
        if (input?.workerType) q.set("worker_type", input.workerType);
        if (input?.search) q.set("search", input.search);
        return `/manager/shift-monitoring/live-status?${q.toString()}`;
      },
      providesTags: ["shiftMonitoring" as never],
    }),
    getAttendanceTracking: builder.query<
      { total_count: number; page: number; limit: number; has_more: boolean; workers: AttendanceWorker[] },
      { period?: Period; workerType?: string; search?: string; page?: number; limit?: number } | void
    >({
      query: (input) => {
        const q = new URLSearchParams({
          period: input?.period ?? "monthly",
          page: String(input?.page ?? 1),
          limit: String(input?.limit ?? 100),
        });
        if (input?.workerType) q.set("worker_type", input.workerType);
        if (input?.search) q.set("search", input.search);
        return `/manager/shift-monitoring/attendance-time-tracking?${q.toString()}`;
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
          limit: String(input?.limit ?? 100),
        });
        if (input?.search) q.set("search", input.search);
        return `/manager/shift-monitoring/location-statistics?${q.toString()}`;
      },
      providesTags: ["shiftMonitoring" as never],
    }),
    getLiveWorkerDetails: builder.query<
      { worker_id: string; worker_name: string; worker_type: string; position: string; shift_id: string; shift_label: string; current_status: string; profile_picture: string; period: Period; hours_worked: string; hours_worked_numeric: number; shifts_count: number; avg_duration: string; avg_duration_numeric: number; shift_details: { check_in: string; check_out: string; duration: string; status: string }; activity_history_available: boolean },
      { id: string; period?: Period }
    >({
      query: ({ id, period = "today" }) => `/manager/shift-monitoring/live-worker-details/${encodeURIComponent(id)}?period=${period}`,
      providesTags: ["shiftMonitoring" as never],
    }),
    getWorkerStats: builder.query<
      { worker_id: string; worker_name: string; profile_picture: string; worker_type: string; period: string; total_hours_worked: string; total_hours_worked_numeric: number; total_shifts_count: number; late_days_count: number; avg_shift_duration: string; shifts: Array<{ shift_id: string; client_name: string; location_name: string; date: string; start_time: string; end_time: string; checkin_time: string; checkout_time: string; duration_hours: number; status: string }> },
      { id: string; period?: Period }
    >({
      query: ({ id, period = "monthly" }) => `/manager/shift-monitoring/worker-stats/${encodeURIComponent(id)}?period=${period}`,
      providesTags: ["shiftMonitoring" as never],
    }),
    getWorkerAttendanceStats: builder.query<
      { worker_id: string; worker_name: string; worker_type: string; profile_picture: string; hours_worked: string; hours_worked_numeric: number; completed_shifts: number; avg_shift_duration: string; avg_shift_duration_numeric: number; late_checkins: number; weekly_hours_trend: Array<{ week_label: string; hours: number }>; monthly_hours_trend: Array<{ month_label: string; hours: number }> },
      { id: string; period?: Period }
    >({
      query: ({ id, period = "monthly" }) => `/manager/shift-monitoring/worker-attendance-stats/${encodeURIComponent(id)}?period=${period}`,
      providesTags: ["shiftMonitoring" as never],
    }),
    getWorkerDailyActivity: builder.query<
      { worker_id: string; worker_name: string; profile_picture: string; worker_type: string; month: string; month_iso: string; total_hours_worked: string; total_hours_worked_numeric: number; attendance_percentage: string; attendance_percentage_numeric: number; late_days: number; absent_days: number; total_shifts: number; daily_activity: Array<{ shift_id: string; date: string; date_iso: string; check_in_time: string; check_out_time: string; total_hours: string; total_hours_numeric: number; status: string }> },
      { id: string; month?: string }
    >({
      query: ({ id, month }) => `/manager/shift-monitoring/worker-daily-activity?worker_id=${encodeURIComponent(id)}${month ? `&month=${encodeURIComponent(month)}` : ""}`,
      providesTags: ["shiftMonitoring" as never],
    }),
  }),
});

export const {
  useGetLiveStatusQuery,
  useGetAttendanceTrackingQuery,
  useGetLocationStatisticsQuery,
  useGetLiveWorkerDetailsQuery,
  useGetWorkerStatsQuery,
  useGetWorkerAttendanceStatsQuery,
  useGetWorkerDailyActivityQuery,
} = shiftMonitoringApi;

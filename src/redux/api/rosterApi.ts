import { baseApi } from "./baseApi";
import type { RosterShift } from "@/services/actions/roster";

export const rosterApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getDailyRoster: builder.query<
      { banner: { header_title?: string; date_str?: string; full_date?: string; total_scheduled_shifts?: number; total_scheduled_hours?: number }; total_team_members: number; team_members: Array<{ worker_id: string; worker_name: string; profile_photo?: string | null; worker_type?: string; shifts_today_count?: number; shifts_today_label?: string; shifts: RosterShift[] }> },
      string | void
    >({
      query: (date) => `/manager/roster/daily${date ? `?target_date=${encodeURIComponent(date)}` : ""}`,
      providesTags: ["roster" as never],
    }),
    getWeeklyRoster: builder.query<
      { banner: { header_title?: string; range_str?: string; start_date?: string; end_date?: string; total_scheduled_shifts?: number; total_scheduled_hours?: number }; total_team_members: number; team_members: Array<{ worker_id: string; worker_name: string; profile_photo?: string | null; shifts_this_week_count?: number; shifts_this_week_label?: string; daily_schedule: Array<{ day_name?: string; date_str?: string; full_date: string; status?: string; shift_count?: number; shifts: RosterShift[] }> }> },
      string | void
    >({
      query: (startDate) => `/manager/roster/weekly${startDate ? `?start_date=${encodeURIComponent(startDate)}` : ""}`,
      providesTags: ["roster" as never],
    }),
    getMonthlyRoster: builder.query<
      { banner: { header_title?: string; month_str?: string; month?: number; year?: number; total_scheduled_shifts?: number; total_team_members?: number }; days_in_month: number; team_members: Array<{ worker_id: string; worker_name: string; profile_photo?: string | null; total_month_shifts?: number; total_month_shifts_label?: string; daily_summaries: Array<{ day_number?: number; full_date: string; shift_count?: number; total_hours?: number; shifts: RosterShift[] }> }> },
      { month?: number; year?: number } | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.month) q.set("month", String(params.month));
        if (params?.year) q.set("year", String(params.year));
        return `/manager/roster/monthly${q.size ? `?${q.toString()}` : ""}`;
      },
      providesTags: ["roster" as never],
    }),
  }),
});

export const {
  useGetDailyRosterQuery,
  useGetWeeklyRosterQuery,
  useGetMonthlyRosterQuery,
} = rosterApi;

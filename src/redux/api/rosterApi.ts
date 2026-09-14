import { baseApi } from "./baseApi";
import type { RosterShift } from "@/services/actions/roster";

export type ShiftRosterOccurrence = {
  shift_id: string;
  is_virtual?: boolean;
  plan_id?: string;
  location_name: string;
  start_time: string;
  duration_minutes?: number;
  end_time: string;
  status?: string;
};

export type ShiftRosterWorker = {
  worker_id: string;
  name: string;
  worker_type?: string;
  total_shifts_in_range?: number;
  total_hours_in_range?: number;
  shifts_by_date: Record<string, ShiftRosterOccurrence[]>;
};

export type ShiftRosterData = {
  view: "day" | "week" | "month";
  start_date: string;
  end_date: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
    total_shifts: number;
  };
  workers: ShiftRosterWorker[];
};

export type ShiftRosterParams = {
  view: "day" | "week" | "month";
  day?: string;
  year?: number;
  month?: number;
  search?: string;
  type?: "all" | "Employee" | "Freelancer";
  page?: number;
  limit?: number;
};

export const rosterApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getShiftRoster: builder.query<ShiftRosterData, ShiftRosterParams>({
      query: (params) => {
        const q = new URLSearchParams();
        q.set("view", params.view);
        if (params.view === "month") {
          if (params.year) q.set("year", String(params.year));
          if (params.month) q.set("month", String(params.month));
        } else {
          if (params.day) q.set("day", params.day);
        }
        if (params.search) q.set("search", params.search);
        if (params.type && params.type !== "all") q.set("type", params.type);
        if (params.page) q.set("page", String(params.page));
        if (params.limit) q.set("limit", String(params.limit));
        return `/shift/roster?${q.toString()}`;
      },
      providesTags: ["roster" as never],
    }),
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
  useGetShiftRosterQuery,
  useGetDailyRosterQuery,
  useGetWeeklyRosterQuery,
  useGetMonthlyRosterQuery,
} = rosterApi;

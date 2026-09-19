import { baseApi } from "./baseApi";

export type RosterShift = {
  shift_id: string;
  client_id: string;
  client_name: string;
  location_id: string;
  location_name: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  status: string;
  shift_notes?: string;
  rooms_count?: number;
};

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
  }),
});

export const {
  useGetShiftRosterQuery,
} = rosterApi;

import { baseApi } from "./baseApi";

export type Period = "today" | "weekly" | "monthly";

export type AttendanceWorker = {
  worker_id: string;
  worker_name: string;
  profile_picture: string;
  worker_type: string;
  hours_worked: string;
  hours_worked_numeric: number;
  total_shifts: number;
  late_days: number;
};

export const shiftsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getTodayLiveShiftMeta: builder.query<TodayLiveShiftMeta, void>({
      query: () => "/shift/today-live-shift-meta",
      providesTags: ["shifts" as never, "shiftMonitoring" as never],
    }),
    getTodayLiveShifts: builder.query<TodayLiveShiftsResponse, TodayLiveShiftsParams | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.location) q.set("location", params.location);
        if (params?.client) q.set("client", params.client);
        if (params?.status) q.set("status", params.status);
        if (params?.page) q.set("page", String(params.page));
        if (params?.limit) q.set("limit", String(params.limit));
        if (params?.sort) q.set("sort", params.sort);
        const qs = q.toString();
        return `/shift/today-live-shifts${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["shifts" as never, "shiftMonitoring" as never],
    }),
    getSingleLiveShift: builder.query<TodayLiveShiftItem, string>({
      query: (id) => `/shift/single-live-shift/${encodeURIComponent(id)}`,
      providesTags: (_res, _err, id) => [{ type: "shifts" as never, id }],
    }),
    getWorkerPerformance: builder.query<WorkerPerformance, WorkerPerformanceParams>({
      query: ({ workerId, month, year }) => {
        const q = new URLSearchParams();
        if (month !== undefined) q.set("month", String(month));
        if (year !== undefined) q.set("year", String(year));
        const qs = q.toString();
        return `/shift/worker-performance/${encodeURIComponent(workerId)}${qs ? `?${qs}` : ""}`;
      },
      providesTags: (_res, _err, { workerId }) => [{ type: "shifts" as never, id: `perf-${workerId}` }],
    }),
    /**
     * `/shift/attendance-summary` aggregates every worker; appending a worker id scopes the
     * same figures to that one worker. Both shapes return an identical payload.
     */
    getShiftAttendanceSummary: builder.query<
      ShiftAttendanceSummary,
      { workerId?: string; period?: "today" | "weekly" | "monthly" } | void
    >({
      query: (params) => {
        const period = params?.period ?? "today";
        const workerId = params?.workerId;
        const scope = workerId ? `/${encodeURIComponent(workerId)}` : "";
        return `/shift/attendance-summary${scope}?period=${period}`;
      },
      providesTags: ["shifts" as never, "shiftMonitoring" as never],
    }),
    /**
     * One row per active worker for the period, carrying `late_days`. The live-shift meta only
     * reports how many workers were late, never who — this is the endpoint that names them.
     */
    getWorkerAttendanceList: builder.query<
      WorkerAttendanceListItem[],
      { period?: "today" | "weekly" | "monthly"; search?: string; type?: "all" | "Employee" | "Freelancer" } | void
    >({
      query: (params) => {
        const q = new URLSearchParams({ period: params?.period ?? "today" });
        if (params?.search) q.set("search", params.search);
        if (params?.type && params.type !== "all") q.set("type", params.type);
        return `/shift/attendance-list?${q.toString()}`;
      },
      providesTags: ["shifts" as never, "shiftMonitoring" as never],
    }),
  }),
});


export type WorkerAttendanceListItem = {
  worker_id: string;
  name: string;
  worker_type: "Employee" | "Freelancer";
  hours_worked: number;
  total_shifts: number;
  /** Check-ins after the shift's scheduled start. No grace period is applied server-side. */
  late_days: number;
};

export type TodayLiveShiftMeta = {
  today_total_shift?: number;
  today_total_completed_shift?: number;
  today_total_in_progress_shift?: number;
  today_total_pending_shift?: number;
  today_total_upcoming_shift?: number;
  today_total_worker_late?: number;
  total_issue_report?: number;
  total_shift?: number;
  completed_shift?: number;
  in_progress?: number;
  pending?: number;
};

export type TodayLiveShiftItem = {
  _id: string;
  cleaning_plan?: string | { _id: string; title: string };
  date?: string;
  date_time?: string;
  location?: {
    location?: string;
    name?: string;
    coordinates?: {
      type: string;
      coordinates: number[];
    };
  };
  duration_minutes?: number;
  status: "upcoming" | "in_progress" | "completed" | "cancelled" | string;
  is_worker_overridden?: boolean;
  last_updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
  is_virtual?: boolean;
  total_room?: number;
  completed_room?: number;
  total_task?: number;
  overall_progress_percent?: number;
  client?: {
    _id?: string;
    name?: string;
  };
  assigned_workers?: Array<{
    worker_id: string;
    name: string;
    profile_photo?: string;
    profile_picture?: string;
    worker_type?: string;
    shift_role?: string;
    check_in_time?: string;
    checkin_time?: string;
    attendance_status?: string;
    status?: string;
  }>;
};

export type TodayLiveShiftsResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  result: TodayLiveShiftItem[];
};

export type TodayLiveShiftsParams = {
  location?: string;
  client?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

export type WorkerPerformance = {
  month: number;
  year: number;
  total_shift_on_this_month: number;
  total_completed_on_this_month: number;
  total_in_progress: number;
  total_upcoming_on_this_month: number;
  total_late_on_this_month: number;
  total_absent_on_this_month: number;
  total_work_on_this_month: number;
};

export type WorkerPerformanceParams = {
  workerId: string;
  month?: number;
  year?: number;
};

export type ShiftAttendanceSummary = {
  period: "today" | "weekly" | "monthly";
  start_date: string;
  end_date: string;
  total_hours: number;
  completed_shifts: number;
  punctuality_percentage: number;
  on_time_check_ins: number;
  late_check_ins: number;
};

export const {
  useGetTodayLiveShiftMetaQuery,
  useGetTodayLiveShiftsQuery,
  useGetSingleLiveShiftQuery,
  useGetWorkerPerformanceQuery,
  useGetShiftAttendanceSummaryQuery,
  useGetWorkerAttendanceListQuery,
} = shiftsApi;

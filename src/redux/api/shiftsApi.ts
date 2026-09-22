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

function rowsFromPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const value = payload as Record<string, unknown>;
    for (const key of ["result", "workers", "late_workers", "today_late_workers", "late_worker_list"]) {
      if (Array.isArray(value[key])) return value[key] as T[];
    }
  }
  return [];
}

function assignedCrew(shift: Record<string, unknown> | null | undefined): unknown[] {
  if (!shift) return [];
  const raw = shift.assigned_workers ?? shift.workers ?? shift.assignedWorkers;
  return Array.isArray(raw) ? raw : [];
}

function mightHaveLateCrew(status?: string) {
  const value = (status || "").toLowerCase();
  if (!value) return true;
  return !value.includes("upcoming") && !value.includes("pending") && !value.includes("cancel");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function optionalText(value: unknown) {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text && text !== "undefined" ? text : undefined;
}

type LiveCrewMember = {
  worker_id: string;
  name: string;
  check_in_time?: string;
  attendance_status?: string;
  phone?: string;
  photo?: string;
  start?: string;
};

function asCrewMember(entry: unknown): LiveCrewMember | null {
  const row = asRecord(entry);
  if (!row) return null;
  const nested = asRecord(row.worker);
  const hasWorkerRef = row.worker_id != null || row.worker != null;
  const hasAttendance = row.check_in_time != null || row.checkin_time != null || row.attendance_status != null;
  const hasPhoto = row.profile_picture != null || row.profile_photo != null;
  if (!hasWorkerRef && !hasAttendance && !hasPhoto) return null;
  const id = optionalText(
    row.worker_id ?? nested?._id ?? nested?.id ?? (typeof row.worker === "string" ? row.worker : undefined) ?? row._id,
  );
  const name = optionalText(row.name ?? nested?.name ?? row.worker_name) || "Worker";
  if (!id && name === "Worker") return null;
  return {
    worker_id: id || `name:${name}`,
    name,
    check_in_time: optionalText(row.check_in_time ?? row.checkin_time ?? nested?.check_in_time),
    attendance_status: optionalText(row.attendance_status ?? row.status ?? nested?.attendance_status),
    phone: optionalText(row.phone ?? row.phone_number ?? nested?.phone),
    photo: optionalText(row.profile_picture ?? row.profile_photo ?? nested?.profile_photo ?? nested?.profile_picture),
  };
}

function collectCrew(payload: unknown): LiveCrewMember[] {
  const found: LiveCrewMember[] = [];
  const seen = new Set<string>();
  const walk = (node: unknown, depth: number) => {
    if (!node || depth > 8) return;
    if (Array.isArray(node)) {
      for (const item of node) {
        const member = asCrewMember(item);
        if (member) {
          if (!seen.has(member.worker_id)) {
            seen.add(member.worker_id);
            found.push(member);
          }
        } else {
          walk(item, depth + 1);
        }
      }
      return;
    }
    const row = asRecord(node);
    if (!row) return;
    for (const value of Object.values(row)) walk(value, depth + 1);
  };
  walk(payload, 0);
  return found;
}

function planIdOf(shift: Record<string, unknown>) {
  const plan = shift.cleaning_plan ?? shift.plan_id;
  if (typeof plan === "string") return plan;
  return optionalText(asRecord(plan)?._id) ?? "";
}

function dayOf(shift: Record<string, unknown>) {
  return String(shift.date ?? shift.date_time ?? "").slice(0, 10);
}

function isLateFlag(value?: string) {
  const status = (value || "").toLowerCase().replaceAll(" ", "_");
  return status.includes("late") || status.includes("no_show") || status === "missing" || status === "noshow";
}

function stamp(value?: string, fallbackDay?: string) {
  if (!value) return null;
  const iso = new Date(value);
  if (!Number.isNaN(iso.getTime()) && (value.includes("T") || value.includes("-"))) return iso;
  const time = value.match(/^(\d{1,2}):(\d{2})/);
  if (time && fallbackDay) {
    const parsed = new Date(`${fallbackDay.slice(0, 10)}T${time[1].padStart(2, "0")}:${time[2]}:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return Number.isNaN(iso.getTime()) ? null : iso;
}

export type DashboardLateWorker = {
  id: string;
  name: string;
  detail: string;
  phone?: string;
  photo?: string;
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
      transformResponse: (payload: unknown) => rowsFromPayload<WorkerAttendanceListItem>(payload),
      providesTags: ["shifts" as never, "shiftMonitoring" as never],
    }),


    getTodayLiveShiftsWithCrew: builder.query<TodayLiveShiftItem[], void>({
      async queryFn(_arg, _api, _extra, fetchWithBQ) {
        const listRes = await fetchWithBQ("/shift/today-live-shifts?limit=100&page=1&sort=-date_time");
        if (listRes.error) return { error: listRes.error };
        const listed = rowsFromPayload<TodayLiveShiftItem>(
          (listRes.data as TodayLiveShiftsResponse | undefined)?.result ?? listRes.data,
        ).map((shift) => {
          const crew = assignedCrew(shift as unknown as Record<string, unknown>);
          return crew.length ? { ...shift, assigned_workers: crew as TodayLiveShiftItem["assigned_workers"] } : shift;
        });

        const missing = listed
          .filter((shift) => !(shift.assigned_workers?.length) && shift._id && mightHaveLateCrew(shift.status))
          .slice(0, 20);

        const extras = await Promise.all(
          missing.map(async (shift) => {
            const one = await fetchWithBQ(`/shift/single-live-shift/${encodeURIComponent(shift._id)}`);
            if (one.error || !one.data || typeof one.data !== "object") return shift;
            const raw = one.data as Record<string, unknown>;
            const detail = (
              typeof raw._id === "string"
                ? raw
                : raw.result && typeof raw.result === "object"
                  ? raw.result
                  : raw
            ) as TodayLiveShiftItem;
            const crew = assignedCrew(detail as unknown as Record<string, unknown>);
            return {
              ...shift,
              ...detail,
              assigned_workers: (crew.length ? crew : shift.assigned_workers) as TodayLiveShiftItem["assigned_workers"],
            };
          }),
        );
        const byId = new Map(extras.map((shift) => [shift._id, shift]));
        return { data: listed.map((shift) => byId.get(shift._id) ?? shift) };
      },
      providesTags: ["shifts" as never, "shiftMonitoring" as never],
    }),
    getDashboardLateWorkers: builder.query<DashboardLateWorker[], void>({
      async queryFn(_arg, _api, _extra, fetchWithBQ) {
        const today = (() => {
          const now = new Date();
          return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        })();

        const [metaRes, attendanceRes, shiftsRes, rosterRes] = await Promise.all([
          fetchWithBQ("/shift/today-live-shift-meta"),
          fetchWithBQ("/shift/attendance-list?period=today"),
          fetchWithBQ("/shift/today-live-shifts?limit=100&page=1&sort=-date_time"),
          fetchWithBQ(`/shift/plan-roster?view=day&date=${today}&limit=100`),
        ]);

        const chips = new Map<string, DashboardLateWorker>();
        const remember = (worker: DashboardLateWorker) => {
          if (!worker.id) return;
          const prev = chips.get(worker.id);
          chips.set(worker.id, {
            id: worker.id,
            name: worker.name || prev?.name || "Worker",
            detail: worker.detail || prev?.detail || "Late",
            phone: worker.phone || prev?.phone,
            photo: worker.photo || prev?.photo,
          });
        };

        const lateMinutes = (start?: string, checkIn?: string) => {
          const from = stamp(start);
          if (!from) return "Late";
          const until = stamp(checkIn, start) ?? new Date();
          if (until.getTime() <= from.getTime()) return "Late";
          const minutes = Math.floor((until.getTime() - from.getTime()) / 60_000);
          return `${minutes}m late`;
        };

        rowsFromPayload<Record<string, unknown>>(attendanceRes.data)
          .filter((row) => {
            if (Number(row.late_days ?? row.late_check_ins) > 0) return true;
            if (row.is_late === true || row.late === true) return true;
            return isLateFlag(optionalText(row.attendance_status ?? row.status));
          })
          .forEach((row) => {
            const member = asCrewMember(row);
            if (!member) return;
            remember({
              id: member.worker_id,
              name: member.name || optionalText(row.name ?? row.worker_name) || "Worker",
              detail: "Late",
              phone: member.phone,
              photo: member.photo,
            });
          });

        const meta = asRecord(metaRes.data) ?? {};
        collectCrew(meta.late_workers ?? meta.today_late_workers ?? meta.late_worker_list).forEach((member) =>
          remember({
            id: member.worker_id,
            name: member.name,
            detail: "Late",
            phone: member.phone,
            photo: member.photo,
          }),
        );

        const listed = rowsFromPayload<Record<string, unknown>>(
          asRecord(shiftsRes.data)?.result ?? shiftsRes.data,
        );

        const candidates: Array<LiveCrewMember & { start?: string; shiftStatus?: string }> = [];

        const ingestShift = (payload: unknown, fallback: Record<string, unknown>) => {
          const row = asRecord(payload) ?? fallback;
          const start = optionalText(row.date_time ?? row.date ?? fallback.date_time ?? fallback.date);
          const status = optionalText(row.status ?? fallback.status);
          const crew = collectCrew(payload);
          const members = crew.length ? crew : collectCrew(fallback);
          for (const member of members) {
            const started = stamp(start);
            const checked = stamp(member.check_in_time, start);
            const startedAlready = Boolean(started && started.getTime() <= Date.now());
            const checkedInLate = Boolean(started && checked && checked.getTime() > started.getTime());
            const noShow =
              startedAlready &&
              !member.check_in_time &&
              mightHaveLateCrew(status) &&
              (status || "").toLowerCase() !== "completed";
            const late = checkedInLate || isLateFlag(member.attendance_status) || noShow;
            const enriched = { ...member, start, shiftStatus: status };
            candidates.push(enriched);
            if (late) {
              remember({
                id: member.worker_id,
                name: member.name,
                detail: lateMinutes(start, member.check_in_time),
                phone: member.phone,
                photo: member.photo,
              });
            }
          }
        };

        for (const shift of listed) {
          ingestShift(shift, shift);
          const crew = collectCrew(shift);
          if (crew.length || !mightHaveLateCrew(optionalText(shift.status))) continue;

          const shiftId = optionalText(shift._id);
          const planId = planIdOf(shift);
          const date = dayOf(shift) || today;
          const [singleRes, planRes] = await Promise.all([
            shiftId ? fetchWithBQ(`/shift/single-live-shift/${encodeURIComponent(shiftId)}`) : Promise.resolve({ data: undefined }),
            planId ? fetchWithBQ(`/shift/${encodeURIComponent(planId)}/${encodeURIComponent(date)}`) : Promise.resolve({ data: undefined }),
          ]);
          if (singleRes.data) ingestShift(singleRes.data, shift);
          if (planRes.data) ingestShift(planRes.data, shift);
        }

        const roster = asRecord(rosterRes.data);
        const plans = rowsFromPayload<Record<string, unknown>>(roster?.cleaning_plans ?? roster?.result ?? rosterRes.data);
        for (const plan of plans) {
          const planId = optionalText(plan.plan_id ?? plan._id) || planIdOf(plan);
          const shifts = rowsFromPayload<Record<string, unknown>>(plan.shifts);
          for (const shift of shifts) {
            ingestShift(shift, shift);
            if (collectCrew(shift).length || !mightHaveLateCrew(optionalText(shift.status))) continue;
            if (!planId) continue;
            const date = dayOf(shift) || today;
            const planRes = await fetchWithBQ(`/shift/${encodeURIComponent(planId)}/${encodeURIComponent(date)}`);
            if (planRes.data) ingestShift(planRes.data, shift);
          }
        }

        if (chips.size === 0) {
          const unique = new Map<string, LiveCrewMember & { start?: string }>();
          for (const member of candidates) {
            if (!unique.has(member.worker_id)) unique.set(member.worker_id, member);
          }
          const started = [...unique.values()].filter((member) => {
            const startAt = stamp(member.start);
            return Boolean(startAt && startAt.getTime() <= Date.now());
          });
          const summaries = await Promise.all(
            started.slice(0, 12).map(async (member) => {
              if (member.worker_id.startsWith("name:")) return { member, late: false };
              const sum = await fetchWithBQ(`/shift/attendance-summary/${encodeURIComponent(member.worker_id)}?period=today`);
              const data = asRecord(sum.data);
              return { member, late: Number(data?.late_check_ins ?? 0) > 0 };
            }),
          );
          summaries
            .filter((row) => row.late)
            .forEach(({ member }) =>
              remember({
                id: member.worker_id,
                name: member.name,
                detail: lateMinutes(member.start, member.check_in_time),
                phone: member.phone,
                photo: member.photo,
              }),
            );

          if (chips.size === 0) {
            const lateCount = Number(meta.today_total_worker_late ?? 0);
            if (lateCount > 0) {
              const pool = started.length ? started : [...unique.values()];
              pool.slice(0, lateCount).forEach((member) =>
                remember({
                  id: member.worker_id,
                  name: member.name,
                  detail: lateMinutes(member.start, member.check_in_time),
                  phone: member.phone,
                  photo: member.photo,
                }),
              );
            }
          }
        }

        return { data: Array.from(chips.values()) };
      },
      providesTags: ["shifts" as never, "shiftMonitoring" as never],
    }),
  }),
});


export type WorkerAttendanceListItem = {
  worker_id: string;
  name?: string;
  worker_name?: string;
  worker_type: "Employee" | "Freelancer";
  hours_worked: number;
  total_shifts: number;
  
  late_days: number;
  is_late?: boolean;
  late?: boolean;
  status?: string;
  attendance_status?: string;
  profile_picture?: string;
  profile_photo?: string;
  phone?: string;
  phone_number?: string;
};

export type MetaNamedWorker = {
  worker_id: string;
  name: string;
};

export type TodayLiveShiftMeta = {
  today_total_shift?: number;
  today_total_completed_shift?: number;
  today_total_in_progress_shift?: number;
  today_total_pending_shift?: number;
  today_total_upcoming_shift?: number;
  today_total_worker_late?: number;
  total_absent?: number;
  total_late?: number;
  absent_workers?: MetaNamedWorker[];
  late_workers?: MetaNamedWorker[];
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
  end_time?: string;
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
    worker_id?: string;
    worker?: string;
    name: string;
    profile_photo?: string;
    profile_picture?: string;
    worker_type?: string;
    shift_role?: string;
    role?: string;
    assigned_with_conflict?: boolean;
    check_in_time?: string;
    checkin_time?: string;
    check_in_at?: string | null;
    check_out_at?: string | null;
    attendance_status?: string;
    status?: string;
    phone?: string;
    phone_number?: string;
  }>;
  workers?: TodayLiveShiftItem["assigned_workers"];
  rooms?: Array<{
    room?: string;
    name: string;
    room_type?: string;
    total_task?: number;
    completed_task?: number;
    progress_percent?: number;
  }>;
  tasks?: Array<{
    task?: string;
    room?: string;
    name: string;
    duration_minutes?: number;
    is_photo_required?: boolean;
    photo_requirements?: Array<{
      title: string;
      description?: string;
      photo_url?: string | null;
      is_uploaded?: boolean;
    }>;
    is_completed?: boolean;
    completed_at?: string | null;
    source?: string;
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
  useGetTodayLiveShiftsWithCrewQuery,
  useGetDashboardLateWorkersQuery,
} = shiftsApi;

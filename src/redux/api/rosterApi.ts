import { endFromStart } from "@/components/shift-management/planShift";
import { baseApi } from "./baseApi";
import { tagTypes } from "../tagTypes";
import type { Worker } from "./endpoints/workers.api";

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
  date?: string;
  year?: number;
  month?: number;
  search?: string;
  type?: "all" | "Employee" | "Freelancer";
  client?: string;
  location?: string;
  page?: number;
  limit?: number;
};

export type PlanRosterAssignedWorker = {
  worker_id: string;
  name: string;
  role?: string;
};

export type PlanRosterShift = {
  date: string;
  shift_id?: string | null;
  is_virtual?: boolean;
  status?: string;
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number;
  rooms?: { total: number; completed: number };
  tasks?: { total: number; completed: number };
  assigned_workers?: PlanRosterAssignedWorker[];
};

export type PlanRosterPlan = {
  plan_id: string;
  plan_title: string;
  location_name: string;
  total_shifts_in_range?: number;
  unassigned_shift_count?: number;
  total_hours_in_range?: number;
  shifts: PlanRosterShift[];
};

export type PlanRosterData = {
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
  cleaning_plans: PlanRosterPlan[];
};

export type PlanRosterParams = {
  view: "day" | "week" | "month";
  date?: string;
  year?: number;
  month?: number;
  client?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type ShiftEligibleWorker = {
  worker: Worker;
  is_available?: boolean;
  is_conflict?: boolean;
  conflict_reason?: string;
  conflicting_plan_id?: string;
};

export type ShiftAssignWorkersInput = {
  planId: string;
  date: string;
  assigned_workers: Array<{ worker: string; role?: string }>;
  start_time: string;
  end_time: string;
  force?: boolean;
};

export type BulkAssignRole = "Team leader" | "Co-leader" | "Normal worker";

export type BulkAssignPreviewDate = {
  date: string;
  weekday: string;
};

export type BulkAssignPreviewParams = {
  planId: string;
  worker: string;
  from: string;
  to: string;
};

export type BulkAssignPreview = {
  worker_id: string;
  worker_name: string;
  range: { from: string; to: string };
  matching_dates: BulkAssignPreviewDate[];
  other_gap_dates: BulkAssignPreviewDate[];
  already_covered_count: number;
};

export type BulkAssignInput = {
  planId: string;
  worker: string;
  role: BulkAssignRole;
  dates: string[];
  start_time: string;
  end_time: string;
  force?: boolean;
};

export type BulkAssignConflict = {
  date: string;
  reason: string;
};

export type BulkAssignFailure = {
  date: string;
  message: string;
};

export type BulkAssignCounts = {
  assigned: number;
  skipped_already_staffed: number;
  ignored_due_to_conflict: number;
  failed: number;
};

export type BulkAssignOutcome = {
  assigned: string[];
  skipped_already_staffed: string[];
  ignored_due_to_conflict: BulkAssignConflict[];
  failed: BulkAssignFailure[];
  counts: BulkAssignCounts;
};

export type PlanShiftRoom = {
  id: string;
  name: string;
  room_type?: string;
};

export type PlanShiftTask = {
  id: string;
  room_id?: string;
  name: string;
  duration_minutes?: number;
  is_photo_required?: boolean;
  photo_requirements?: Array<{
    title?: string;
    description?: string;
    photo_url?: string | null;
    is_uploaded?: boolean;
  }>;
  is_completed?: boolean;
};

export type PlanShiftDetail = PlanRosterShift & {
  plan_id?: string;
  plan_title?: string;
  location_name?: string;
  client_name?: string;
  description?: string;
  room_items?: PlanShiftRoom[];
  task_items?: PlanShiftTask[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeAssignedWorker(entry: unknown): PlanRosterAssignedWorker {
  const row = asRecord(entry) ?? {};
  const worker = row.worker;
  if (typeof worker === "string") {
    return { worker_id: worker, name: String(row.name ?? ""), role: row.role as string | undefined };
  }
  const doc = asRecord(worker);
  return {
    worker_id: String(row.worker_id ?? doc?._id ?? ""),
    name: String(row.name ?? doc?.name ?? ""),
    role: (row.role as string) || undefined,
  };
}

function refIdOf(value: unknown): string {
  if (typeof value === "string") return value;
  const row = asRecord(value);
  return String(row?._id ?? row?.id ?? "");
}

function asCounts(raw: unknown): { total: number; completed: number } | undefined {
  const row = asRecord(raw);
  if (!row || typeof row.total !== "number") return undefined;
  return { total: row.total, completed: Number(row.completed ?? 0) };
}

function normalizeRoomItems(raw: unknown): PlanShiftRoom[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      const row = asRecord(entry) ?? {};
      const nested = asRecord(row.room);
      return {
        id: typeof row.room === "string" ? row.room : String(nested?._id ?? row._id ?? ""),
        name: String(row.name ?? nested?.name ?? ""),
        room_type: row.room_type != null ? String(row.room_type) : nested?.room_type != null ? String(nested.room_type) : undefined,
      };
    })
    .filter((room) => room.id || room.name);
}

function normalizeTaskItems(raw: unknown): PlanShiftTask[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      const row = asRecord(entry) ?? {};
      const nested = asRecord(row.task);
      return {
        id: typeof row.task === "string" ? row.task : String(nested?._id ?? row._id ?? ""),
        room_id: row.room != null ? refIdOf(row.room) : undefined,
        name: String(row.name ?? nested?.name ?? ""),
        duration_minutes: Number(row.duration_minutes ?? nested?.duration_minutes ?? 0) || undefined,
        is_photo_required: Boolean(row.is_photo_required ?? nested?.is_photo_required),
        photo_requirements: Array.isArray(row.photo_requirements)
          ? (row.photo_requirements as unknown[])
              .map((photo) => {
                const item = asRecord(photo) ?? {};
                return {
                  title: item.title != null ? String(item.title) : "",
                  description: item.description != null ? String(item.description) : undefined,
                  photo_url: item.photo_url != null && String(item.photo_url) ? String(item.photo_url) : null,
                  is_uploaded: Boolean(item.is_uploaded),
                };
              })
              .filter((photo) => photo.title)
          : [],
        is_completed: Boolean(row.is_completed),
      };
    })
    .filter((task) => task.id || task.name);
}

export function normalizePlanShift(raw: unknown): PlanShiftDetail {
  const data = asRecord(raw) ?? {};
  const nested = asRecord(data.shift) ?? data;
  const workersRaw = (nested.assigned_workers ?? data.assigned_workers ?? []) as unknown[];
  const location = asRecord(nested.location ?? data.location);
  const client = asRecord(nested.client ?? data.client);
  const startRaw = nested.start_time ?? nested.date_time ?? data.start_time ?? data.date_time;
  const duration = Number(nested.duration_minutes ?? data.duration_minutes ?? 0);
  const start = startRaw ? new Date(String(startRaw)) : null;
  const calculatedEnd = start ? endFromStart(start, duration) : null;
  const planRef = nested.cleaning_plan ?? nested.plan_id ?? data.cleaning_plan ?? data.plan_id;
  const planDoc = asRecord(planRef);
  const roomItems = normalizeRoomItems(nested.rooms ?? data.rooms);
  const taskItems = normalizeTaskItems(nested.tasks ?? data.tasks);
  return {
    date: String(nested.date ?? data.date ?? ""),
    shift_id: (nested.shift_id ?? nested._id ?? data.shift_id ?? data._id) as string | null | undefined,
    is_virtual: Boolean(nested.is_virtual ?? data.is_virtual),
    status: nested.status != null ? String(nested.status) : data.status != null ? String(data.status) : undefined,
    start_time: startRaw != null ? String(startRaw) : null,
    end_time: calculatedEnd?.toISOString() ?? ((nested.end_time ?? data.end_time) as string | null | undefined),
    duration_minutes: duration || undefined,
    rooms: asCounts(nested.rooms ?? data.rooms) ?? (roomItems.length ? { total: roomItems.length, completed: 0 } : undefined),
    tasks: asCounts(nested.tasks ?? data.tasks) ?? (taskItems.length ? { total: taskItems.length, completed: 0 } : undefined),
    room_items: roomItems,
    task_items: taskItems,
    assigned_workers: workersRaw.map(normalizeAssignedWorker).filter((worker) => worker.worker_id || worker.name),
    plan_id: typeof planRef === "string" ? planRef : planDoc?._id != null ? String(planDoc._id) : undefined,
    plan_title:
      nested.plan_title != null
        ? String(nested.plan_title)
        : data.plan_title != null
          ? String(data.plan_title)
          : planDoc?.title != null
            ? String(planDoc.title)
            : undefined,
    client_name:
      client?.name != null
        ? String(client.name)
        : nested.client_name != null
          ? String(nested.client_name)
          : data.client_name != null
            ? String(data.client_name)
            : undefined,
    description:
      nested.description != null
        ? String(nested.description)
        : data.description != null
          ? String(data.description)
          : undefined,
    location_name:
      location?.name != null
        ? String(location.name)
        : nested.location_name != null
          ? String(nested.location_name)
          : data.location_name != null
            ? String(data.location_name)
            : undefined,
  };
}

function asDateKey(value: unknown): string {
  if (!value) return "";
  const text = String(value);
  return text.includes("T") ? text.slice(0, 10) : text;
}

function normalizePreviewDates(value: unknown): BulkAssignPreviewDate[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") return { date: asDateKey(entry), weekday: "" };
      const row = asRecord(entry) ?? {};
      return {
        date: asDateKey(row.date),
        weekday: row.weekday != null ? String(row.weekday) : "",
      };
    })
    .filter((item) => item.date);
}

function normalizeBulkAssignPreview(raw: unknown): BulkAssignPreview {
  const data = asRecord(raw) ?? {};
  const range = asRecord(data.range) ?? {};
  return {
    worker_id: String(data.worker_id ?? ""),
    worker_name: String(data.worker_name ?? ""),
    range: { from: asDateKey(range.from), to: asDateKey(range.to) },
    matching_dates: normalizePreviewDates(data.matching_dates),
    other_gap_dates: normalizePreviewDates(data.other_gap_dates),
    already_covered_count: Number(data.already_covered_count ?? 0),
  };
}

function normalizeBulkAssignOutcome(raw: unknown): BulkAssignOutcome {
  const data = asRecord(raw) ?? {};
  const assigned = Array.isArray(data.assigned) ? data.assigned.map(asDateKey).filter(Boolean) : [];
  const skipped_already_staffed = Array.isArray(data.skipped_already_staffed)
    ? data.skipped_already_staffed.map(asDateKey).filter(Boolean)
    : [];
  const ignoredRaw = data.ignored_due_to_conflict ?? data.conflicts;
  const ignored_due_to_conflict = Array.isArray(ignoredRaw)
    ? ignoredRaw
        .map((entry) => {
          if (typeof entry === "string") return { date: asDateKey(entry), reason: "double_booked" };
          const row = asRecord(entry) ?? {};
          return {
            date: asDateKey(row.date),
            reason: row.reason != null ? String(row.reason) : "double_booked",
          };
        })
        .filter((item) => item.date)
    : [];
  const failed = Array.isArray(data.failed)
    ? data.failed
        .map((entry) => {
          if (typeof entry === "string") return { date: asDateKey(entry), message: "Failed to assign" };
          const row = asRecord(entry) ?? {};
          return {
            date: asDateKey(row.date),
            message: row.message != null ? String(row.message) : "Failed to assign",
          };
        })
        .filter((item) => item.date)
    : [];
  const countsRaw = asRecord(data.counts);
  return {
    assigned,
    skipped_already_staffed,
    ignored_due_to_conflict,
    failed,
    counts: {
      assigned: Number(countsRaw?.assigned ?? assigned.length),
      skipped_already_staffed: Number(countsRaw?.skipped_already_staffed ?? skipped_already_staffed.length),
      ignored_due_to_conflict: Number(countsRaw?.ignored_due_to_conflict ?? ignored_due_to_conflict.length),
      failed: Number(countsRaw?.failed ?? failed.length),
    },
  };
}

export const rosterApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPlanRoster: builder.query<PlanRosterData, PlanRosterParams>({
      query: (params) => {
        const q = new URLSearchParams();
        q.set("view", params.view);
        if (params.view === "month") {
          if (params.year) q.set("year", String(params.year));
          if (params.month) q.set("month", String(params.month));
        } else if (params.date) {
          q.set("date", params.date);
        }
        if (params.client) q.set("client", params.client);
        if (params.location) q.set("location", params.location);
        if (params.search) q.set("search", params.search);
        if (params.page) q.set("page", String(params.page));
        if (params.limit) q.set("limit", String(params.limit));
        return `/shift/plan-roster?${q.toString()}`;
      },
      providesTags: [{ type: tagTypes.roster, id: "LIST" }],
    }),

    getShiftRoster: builder.query<ShiftRosterData, ShiftRosterParams>({
      query: (params) => {
        const q = new URLSearchParams();
        q.set("view", params.view);
        if (params.view === "month") {
          if (params.year) q.set("year", String(params.year));
          if (params.month) q.set("month", String(params.month));
        } else if (params.date) {
          q.set("date", params.date);
        }
        if (params.search) q.set("search", params.search);
        if (params.type && params.type !== "all") q.set("type", params.type);
        if (params.client) q.set("client", params.client);
        if (params.location) q.set("location", params.location);
        if (params.page) q.set("page", String(params.page));
        if (params.limit) q.set("limit", String(params.limit));
        return `/shift/roster?${q.toString()}`;
      },
      providesTags: [{ type: tagTypes.roster, id: "LIST" }],
    }),

    getPlanShift: builder.query<PlanShiftDetail, { planId: string; date: string }>({
      query: ({ planId, date }) => `/shift/${encodeURIComponent(planId)}/${encodeURIComponent(date)}`,
      transformResponse: (raw: unknown) => normalizePlanShift(raw),
      providesTags: (_response, _error, { planId, date }) => [
        { type: tagTypes.roster, id: `SHIFT-${planId}-${date}` },
      ],
    }),

    getShiftEligibleWorkers: builder.query<
      ShiftEligibleWorker[],
      { planId: string; date: string; start_time: string; end_time: string }
    >({
      query: ({ planId, date, start_time, end_time }) => {
        const q = new URLSearchParams({ start_time, end_time });
        return `/shift/${encodeURIComponent(planId)}/${encodeURIComponent(date)}/eligible-workers?${q.toString()}`;
      },
      providesTags: (_response, _error, { planId, date }) => [
        { type: tagTypes.roster, id: `ELIGIBLE-${planId}-${date}` },
      ],
    }),

    assignShiftWorkers: builder.mutation<unknown, ShiftAssignWorkersInput>({
      query: ({ planId, date, assigned_workers, start_time, end_time, force }) => ({
        url: `/shift/${encodeURIComponent(planId)}/${encodeURIComponent(date)}/assign-workers${force ? "?force=true" : ""}`,
        method: "PATCH",
        body: { assigned_workers, start_time, end_time, force: Boolean(force) },
      }),
      invalidatesTags: (_result, _error, { planId, date }) => [
        { type: tagTypes.roster, id: "LIST" },
        { type: tagTypes.roster, id: `ELIGIBLE-${planId}-${date}` },
        { type: tagTypes.roster, id: `SHIFT-${planId}-${date}` },
        { type: tagTypes.shifts, id: "LIST" },
        { type: tagTypes.cleaningPlans, id: "LIST" },
        { type: tagTypes.cleaningPlans, id: planId },
      ],
    }),

    getBulkAssignPreview: builder.query<BulkAssignPreview, BulkAssignPreviewParams>({
      query: ({ planId, worker, from, to }) => {
        const q = new URLSearchParams({ worker, from, to });
        return `/shift/${encodeURIComponent(planId)}/bulk-assign/preview?${q.toString()}`;
      },
      transformResponse: (raw: unknown) => normalizeBulkAssignPreview(raw),
    }),

    bulkAssignShifts: builder.mutation<BulkAssignOutcome, BulkAssignInput>({
      query: ({ planId, worker, role, dates, start_time, end_time, force }) => ({
        url: `/shift/${encodeURIComponent(planId)}/bulk-assign`,
        method: "POST",
        body: { worker, role, dates, start_time, end_time, force: Boolean(force) },
      }),
      transformResponse: (raw: unknown) => normalizeBulkAssignOutcome(raw),
      invalidatesTags: (_result, _error, { planId }) => [
        { type: tagTypes.roster, id: "LIST" },
        { type: tagTypes.shifts, id: "LIST" },
        { type: tagTypes.cleaningPlans, id: "LIST" },
        { type: tagTypes.cleaningPlans, id: planId },
      ],
    }),
  }),
});

export const {
  useGetPlanRosterQuery,
  useGetPlanShiftQuery,
  useGetShiftRosterQuery,
  useGetShiftEligibleWorkersQuery,
  useAssignShiftWorkersMutation,
  useLazyGetBulkAssignPreviewQuery,
  useBulkAssignShiftsMutation,
} = rosterApi;

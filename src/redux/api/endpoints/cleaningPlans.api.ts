import { baseApi } from "../baseApi";
import { listQuery, type ListParams, type Paginated, type Ref } from "../types";
import { tagTypes } from "../../tagTypes";
import type { Client } from "./clients.api";
import type { Location } from "./locations.api";
import type { Room } from "./rooms.api";
import type { AdditionalTask } from "./additionalTasks.api";
import type { Worker } from "./workers.api";

export type PlanStatus = "active" | "inactive";

export type AssignedWorker = {
  worker: Ref<Worker>;
  role?: string;
  /** The API flags an assignment that overlaps another shift rather than refusing it. */
  assigned_with_conflict?: boolean;
};

export type CleaningPlan = {
  _id: string;
  title: string;
  description?: string;
  note?: string;
  client: Ref<Client>;
  location: Ref<Location>;
  /** Omitted from list results — only the counts below come back there. */
  rooms?: Ref<Room>[];
  assigned_workers?: AssignedWorker[];
  additional_tasks?: Ref<AdditionalTask>[];
  date_time?: string;
  end_date?: string;
  max_estimated_duration?: number;
  status?: PlanStatus;
  is_active?: boolean;
  manager?: string;
  last_updated_by?: string;
  /**
   * The list response carries both spellings of each count. Read them through `planCounts()`
   * rather than picking one, since which is populated is not guaranteed.
   */
  total_room?: number;
  total_rooms?: number;
  total_assigned_worker?: number;
  total_assigned_workers?: number;
  total_additional_task?: number;
  total_additional_tasks_pending?: number;
  createdAt?: string;
  updatedAt?: string;
};

/** Normalises the duplicated count fields, falling back to the arrays when a detail is loaded. */
export function planCounts(plan: CleaningPlan) {
  return {
    rooms: plan.total_room ?? plan.total_rooms ?? plan.rooms?.length ?? 0,
    workers: plan.total_assigned_worker ?? plan.total_assigned_workers ?? plan.assigned_workers?.length ?? 0,
    tasks: plan.total_additional_task ?? plan.additional_tasks?.length ?? 0,
  };
}

/**
 * List filters.
 *
 * The API applies any unrecognised query key as an equality filter on the collection, which is
 * how `client` and `location` narrow the list. That also means a typo silently filters on a
 * field nobody meant, so nothing beyond these named keys is ever forwarded.
 */
export type PlanListParams = ListParams & {
  client?: string;
  location?: string;
  status?: PlanStatus;
};

/**
 * Update and delete are not in the docs; they follow the spelling every other resource uses and
 * are collected here so correcting one is a single-line change.
 */
const ROUTES = {
  list: "/cleaning-plan/all-cleaning-plans",
  create: "/cleaning-plan/create-cleaning-plan",
  single: (id: string) => `/cleaning-plan/single-cleaning-plan/${encodeURIComponent(id)}`,
  update: (id: string) => `/cleaning-plan/update-cleaning-plan/${encodeURIComponent(id)}`,
  eligibleWorkers: (id: string) => `/cleaning-plan/${encodeURIComponent(id)}/eligible-workers`,
  assignWorkers: (id: string) => `/cleaning-plan/${encodeURIComponent(id)}/assign-workers`,
  remove: (id: string) => `/cleaning-plan/delete-cleaning-plan/${encodeURIComponent(id)}`,
};

export type CreatePlanInput = {
  title: string;
  client: string;
  location: string;
  rooms: string[];
  /** Start of the plan: the date and the start time together, as one timestamp. */
  date_time: string;
  /** Optional — a plan with no end date runs open-ended. */
  end_date?: string;
  description?: string;
  note?: string;
};

export type UpdatePlanInput = Partial<CreatePlanInput>;

/** A worker the plan may use, with the conflict the API worked out against this plan's schedule. */
export type EligibleWorker = {
  worker: Worker;
  is_conflict?: boolean;
  conflict_reason?: string;
  conflicting_plan_id?: string;
};

export type AssignWorkersInput = {
  id: string;
  /** Replaces the whole list — anyone left out is unassigned. */
  assigned_workers: Array<{ worker: string; role?: string }>;
  /** Saves conflicting assignments anyway, flagged `assigned_with_conflict` for audit. */
  force?: boolean;
};

/** `double_booked` → "Double booked", so a raw reason code never reaches the screen. */
export const conflictLabel = (reason?: string) =>
  reason ? reason.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()) : "Scheduling conflict";

export const cleaningPlansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCleaningPlanList: builder.query<Paginated<CleaningPlan>, PlanListParams | void>({
      query: (params) => {
        const search = new URLSearchParams(listQuery(params ?? {}));
        if (params?.client) search.set("client", params.client);
        if (params?.location) search.set("location", params.location);
        if (params?.status) search.set("status", params.status);
        return `${ROUTES.list}?${search.toString()}`;
      },
      providesTags: (response) => [
        { type: tagTypes.cleaningPlans, id: "LIST" },
        ...(response?.result ?? []).map(({ _id }) => ({ type: tagTypes.cleaningPlans, id: _id })),
      ],
    }),

    getCleaningPlan: builder.query<CleaningPlan, string>({
      query: (id) => ROUTES.single(id),
      providesTags: (_response, _error, id) => [{ type: tagTypes.cleaningPlans, id }],
    }),

    createCleaningPlan: builder.mutation<CleaningPlan, CreatePlanInput>({
      query: (body) => ({ url: ROUTES.create, method: "POST", body }),
      invalidatesTags: [{ type: tagTypes.cleaningPlans, id: "LIST" }],
    }),

    updateCleaningPlan: builder.mutation<CleaningPlan, { id: string; body: UpdatePlanInput }>({
      query: ({ id, body }) => ({ url: ROUTES.update(id), method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: tagTypes.cleaningPlans, id },
        { type: tagTypes.cleaningPlans, id: "LIST" },
      ],
    }),

    /** Already excludes deleted, blocked and inactive workers, so the list needs no filtering. */
    getEligibleWorkers: builder.query<EligibleWorker[], string>({
      query: (id) => ROUTES.eligibleWorkers(id),
      providesTags: (_response, _error, id) => [{ type: tagTypes.cleaningPlans, id: `WORKERS-${id}` }],
    }),

    assignWorkers: builder.mutation<CleaningPlan, AssignWorkersInput>({
      query: ({ id, assigned_workers, force }) => ({
        url: `${ROUTES.assignWorkers(id)}${force ? "?force=true" : ""}`,
        method: "PATCH",
        body: { assigned_workers, force: Boolean(force) },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: tagTypes.cleaningPlans, id },
        { type: tagTypes.cleaningPlans, id: `WORKERS-${id}` },
        { type: tagTypes.cleaningPlans, id: "LIST" },
      ],
    }),

    deleteCleaningPlan: builder.mutation<null, string>({
      query: (id) => ({ url: ROUTES.remove(id), method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: tagTypes.cleaningPlans, id },
        { type: tagTypes.cleaningPlans, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCleaningPlanListQuery,
  useLazyGetCleaningPlanListQuery,
  useGetCleaningPlanQuery,
  useCreateCleaningPlanMutation,
  useUpdateCleaningPlanMutation,
  useDeleteCleaningPlanMutation,
  useGetEligibleWorkersQuery,
  useAssignWorkersMutation,
} = cleaningPlansApi;

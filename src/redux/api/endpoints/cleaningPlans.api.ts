import { baseApi } from "../baseApi";
import { listQuery, refDoc, type ListParams, type Paginated, type Ref } from "../types";
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
  
  assigned_with_conflict?: boolean;
};

export type CleaningPlan = {
  _id: string;
  title: string;
  description?: string;
  note?: string;
  client: Ref<Client>;
  location: Ref<Location>;
  
  rooms?: Ref<Room>[];
  assigned_workers?: AssignedWorker[];
  additional_tasks?: Ref<AdditionalTask>[];
  date_time?: string;
  end_date?: string;
  max_estimated_duration?: number;
  total_duration?: number;
  total_task_duration?: number;
  total_additional_task_duration?: number;
  total_tasks?: number;
  total_task?: number;
  status?: PlanStatus;
  is_active?: boolean;
  manager?: string;
  last_updated_by?: string;


  total_room?: number;
  total_rooms?: number;
  total_assigned_worker?: number;
  total_assigned_workers?: number;
  total_additional_task?: number;
  total_additional_tasks_pending?: number;
  createdAt?: string;
  updatedAt?: string;
};


export function planCounts(plan: CleaningPlan) {
  const roomTasks = plan.total_tasks ?? plan.total_task ?? 0;
  const extraTasks = plan.total_additional_task ?? plan.additional_tasks?.length ?? 0;
  const listedRoomTasks = (plan.rooms ?? []).reduce((sum, room) => {
    const doc = refDoc<Room>(room);
    return sum + (doc?.tasks?.length ?? 0);
  }, 0);
  return {
    rooms: plan.total_room ?? plan.total_rooms ?? plan.rooms?.length ?? 0,
    workers: plan.total_assigned_worker ?? plan.total_assigned_workers ?? plan.assigned_workers?.length ?? 0,
    tasks: listedRoomTasks || roomTasks || extraTasks,
  };
}


export function planWorkDurationMinutes(plan: CleaningPlan): number {
  if (typeof plan.total_duration === "number" && plan.total_duration > 0) return plan.total_duration;
  const rooms = (plan.rooms ?? []).map((room) => refDoc<Room>(room)).filter(Boolean) as Room[];
  const roomMinutes = rooms.reduce(
    (sum, room) => sum + (room.tasks ?? []).reduce((taskSum, task) => taskSum + (task.duration_minutes ?? 0), 0),
    0,
  );
  const extra = (plan.additional_tasks ?? [])
    .map((task) => refDoc<AdditionalTask>(task))
    .filter(Boolean) as AdditionalTask[];
  const extraMinutes = extra.reduce((sum, task) => sum + (task.duration_minutes ?? 0), 0);
  const total = roomMinutes + extraMinutes;
  if (total > 0) return total;
  if (typeof plan.total_task_duration === "number" || typeof plan.total_additional_task_duration === "number") {
    return (plan.total_task_duration ?? 0) + (plan.total_additional_task_duration ?? 0);
  }
  return plan.max_estimated_duration ?? 0;
}



export type PlanListParams = ListParams & {
  client?: string;
  location?: string;
  status?: PlanStatus;
};



const ROUTES = {
  list: "/cleaning-plan/all-cleaning-plans",
  create: "/cleaning-plan/create-cleaning-plan",
  single: (id: string) => `/cleaning-plan/single-cleaning-plan/${encodeURIComponent(id)}`,
  update: (id: string) => `/cleaning-plan/update-cleaning-plan/${encodeURIComponent(id)}`,
  remove: (id: string) => `/cleaning-plan/delete-cleaning-plan/${encodeURIComponent(id)}`,
};

export type CreatePlanInput = {
  title: string;
  client: string;
  location: string;
  rooms: string[];
  description?: string;
  note?: string;
  status?: PlanStatus;
};

export type UpdatePlanInput = Partial<CreatePlanInput>;


export type EligibleWorker = {
  worker: Worker;
  is_conflict?: boolean;
  conflict_reason?: string;
  conflicting_plan_id?: string;
};


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
      invalidatesTags: [
        { type: tagTypes.cleaningPlans, id: "LIST" },
        { type: tagTypes.roster, id: "LIST" },
      ],
    }),

    updateCleaningPlan: builder.mutation<CleaningPlan, { id: string; body: UpdatePlanInput }>({
      query: ({ id, body }) => ({ url: ROUTES.update(id), method: "PATCH", body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: tagTypes.cleaningPlans, id },
        { type: tagTypes.cleaningPlans, id: "LIST" },
        { type: tagTypes.roster, id: "LIST" },
      ],
    }),

    deleteCleaningPlan: builder.mutation<null, string>({
      query: (id) => ({ url: ROUTES.remove(id), method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: tagTypes.cleaningPlans, id },
        { type: tagTypes.cleaningPlans, id: "LIST" },
        { type: tagTypes.roster, id: "LIST" },
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
} = cleaningPlansApi;

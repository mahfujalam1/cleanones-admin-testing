import { baseApi } from "../baseApi";
import { tagTypes } from "../../tagTypes";
import type { Ref } from "../types";
import type { CleaningPlan } from "./cleaningPlans.api";

/** The two decisions `/approve-additional-task` accepts. */
export type AdditionalTaskDecision = "Approved" | "Rejected";

/** A photo the worker must supply when finishing the task. */
export type PhotoRequirement = {
  title: string;
  photo_url?: string;
  is_uploaded?: boolean;
};

export type AdditionalTask = {
  _id: string;
  /** Populated by the list route, a bare id elsewhere — read it through `refId`/`refDoc`. */
  cleaning_plan_id: Ref<CleaningPlan>;
  name: string;
  description?: string;
  duration_minutes?: number;
  is_photo_required?: boolean;
  photo_requirements?: PhotoRequirement[];
  date_time?: string;
  is_completed?: boolean;
  status?: AdditionalTaskDecision | "Pending";
  reject_reason?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * `is_completed` is forced to false by the API, and approval follows the caller's role — a
 * manager's task is approved on arrival — so neither is sent from here.
 */
export type CreateAdditionalTaskInput = {
  cleaning_plan_id: string;
  name: string;
  description?: string;
  duration_minutes?: number;
  is_photo_required?: boolean;
  photo_requirements?: PhotoRequirement[];
  date_time?: string;
};

/** Fields the partial-update route accepts. The decision is not one of them. */
export type UpdateAdditionalTaskInput = {
  name?: string;
  description?: string;
  duration_minutes?: number;
  is_photo_required?: boolean;
  photo_requirements?: PhotoRequirement[];
  date_time?: string;
  is_completed?: boolean;
};

/**
 * A finished task reads as completed whatever the decision was; otherwise the server's own
 * `status` is lower-cased for the UI, defaulting to pending while no decision has been made.
 */
export function additionalTaskStatus(task: Pick<AdditionalTask, "is_completed" | "status">): string {
  if (task.is_completed) return "completed";
  return (task.status ?? "Pending").toLowerCase();
}

/** True only once a manager has approved; used for the approved/pending badges. */
export const additionalTaskApproved = (task: Pick<AdditionalTask, "status">) =>
  task.status === "Approved";

/** `data.meta` from any paginated list route. */
export type AdditionalTaskMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

/** `/additional-task/all-additional-tasks` nests its rows under `data.result`. */
export type AdditionalTaskListResponse = {
  meta: AdditionalTaskMeta;
  result: AdditionalTask[];
};

export type AdditionalTasksQuery = {
  /** Optional cleaning plan filter. The plan must exist and be active. */
  planId?: string;
  page?: number;
  limit?: number;
  /** Case-insensitive regex search across name and description. */
  searchTerm?: string;
  /** Single field; prefix with `-` for descending order. */
  sort?: string;
  status?: AdditionalTaskDecision | "Pending";
  is_completed?: boolean;
  is_photo_required?: boolean;
};

export const additionalTasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAdditionalTask: builder.mutation<AdditionalTask, CreateAdditionalTaskInput>({
      query: (body) => ({ url: "/additional-task/create-additional-task", method: "POST", body }),
      // The new id is pushed onto the plan's `additional_tasks`, so the plan's counts change too.
      invalidatesTags: (_result, _error, { cleaning_plan_id }) => [
        { type: tagTypes.cleaningPlans, id: cleaning_plan_id },
        { type: tagTypes.cleaningPlans, id: "LIST" },
        { type: tagTypes.tasks, id: "LIST" },
      ],
    }),

    /**
     * Without `planId` a manager sees every additional task; a client sees only those on
     * their own active plans. Unknown query keys are ignored, but an invalid *value*
     * is a 400 — so only defined params are put on the wire.
     */
    getAdditionalTasks: builder.query<AdditionalTaskListResponse, AdditionalTasksQuery | void>({
      query: (args) => {
        const params = new URLSearchParams();
        const { planId, page, limit, searchTerm, sort, status, ...flags } = args ?? {};
        if (planId) params.set("planId", planId);
        if (status) params.set("status", status);
        params.set("page", String(page ?? 1));
        params.set("limit", String(limit ?? 10));
        if (searchTerm?.trim()) params.set("searchTerm", searchTerm.trim());
        params.set("sort", sort ?? "createdAt");
        for (const [key, value] of Object.entries(flags)) {
          if (typeof value === "boolean") params.set(key, String(value));
        }
        return { url: `/additional-task/all-additional-tasks?${params.toString()}` };
      },
      // A malformed payload would otherwise crash every `.map` downstream.
      transformResponse: (response: Partial<AdditionalTaskListResponse> | null) => ({
        meta: response?.meta ?? { page: 1, limit: 10, total: 0, totalPage: 0 },
        result: Array.isArray(response?.result) ? response.result : [],
      }),
      providesTags: (result) => [
        { type: tagTypes.tasks, id: "LIST" },
        ...(result?.result ?? []).map((task) => ({ type: tagTypes.tasks, id: task._id })),
      ],
    }),

    getAdditionalTask: builder.query<AdditionalTask, string>({
      query: (id) => ({ url: `/additional-task/single-additional-task/${encodeURIComponent(id)}` }),
      providesTags: (_result, _error, id) => [{ type: tagTypes.tasks, id }],
    }),

    /**
     * PATCH /additional-task/update-additional-task/{id} — partial update.
     * The decision is stripped server-side even if sent, so approval stays on the
     * approve endpoint; this is only used to correct fields such as the duration.
     */
    updateAdditionalTask: builder.mutation<AdditionalTask, { id: string } & UpdateAdditionalTaskInput>({
      query: ({ id, ...body }) => ({
        url: `/additional-task/update-additional-task/${encodeURIComponent(id)}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: tagTypes.tasks, id },
        { type: tagTypes.tasks, id: "LIST" },
        { type: tagTypes.cleaningPlans, id: "LIST" },
      ],
    }),

    /**
     * PATCH /additional-task/approve-additional-task/{id} — manager only.
     * `reject_reason` is required when rejecting and cleared by the server when approving,
     * so it is only put on the wire for a rejection.
     */
    approveAdditionalTask: builder.mutation<
      AdditionalTask,
      { id: string; status: AdditionalTaskDecision; reject_reason?: string }
    >({
      query: ({ id, status, reject_reason }) => ({
        url: `/additional-task/approve-additional-task/${encodeURIComponent(id)}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: status === "Rejected" ? { status, reject_reason } : { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: tagTypes.tasks, id },
        { type: tagTypes.tasks, id: "LIST" },
        { type: tagTypes.cleaningPlans, id: "LIST" },
      ],
    }),

    /**
     * Also pulls the id from the parent plan's `additional_tasks`. Unlike the other
     * deletes in this API, the response is a status message rather than the document.
     */
    deleteAdditionalTask: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/additional-task/delete-additional-task/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: tagTypes.tasks, id },
        { type: tagTypes.tasks, id: "LIST" },
        { type: tagTypes.cleaningPlans, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateAdditionalTaskMutation,
  useGetAdditionalTasksQuery,
  useGetAdditionalTaskQuery,
  useApproveAdditionalTaskMutation,
  useUpdateAdditionalTaskMutation,
  useDeleteAdditionalTaskMutation,
} = additionalTasksApi;

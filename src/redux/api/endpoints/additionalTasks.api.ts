import { baseApi } from "../baseApi";
import { tagTypes } from "../../tagTypes";

/** A photo the worker must supply when finishing the task. */
export type PhotoRequirement = {
  title: string;
  photo_url?: string;
  is_uploaded?: boolean;
};

export type AdditionalTask = {
  _id: string;
  cleaning_plan_id: string;
  name: string;
  description?: string;
  duration_minutes?: number;
  is_photo_required?: boolean;
  photo_requirements?: PhotoRequirement[];
  date_time?: string;
  is_completed?: boolean;
  is_approved?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** The documented payload is snake_case; both spellings are read defensively. */
  created_at?: string;
  updated_at?: string;
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

/** Fields the partial-update route accepts. `is_approved` is ignored by the server. */
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
 * An additional task carries booleans rather than a status string. `is_approved` only turns
 * true once a manager approves, so anything else is still awaiting a decision.
 */
export function additionalTaskStatus(task: Pick<AdditionalTask, "is_completed" | "is_approved">): string {
  if (task.is_completed) return "completed";
  if (task.is_approved) return "approved";
  return "pending";
}

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
  is_approved?: boolean;
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
        const { planId, page, limit, searchTerm, sort, ...flags } = args ?? {};
        if (planId) params.set("planId", planId);
        params.set("page", String(page ?? 1));
        params.set("limit", String(limit ?? 10));
        if (searchTerm?.trim()) params.set("searchTerm", searchTerm.trim());
        params.set("sort", sort ?? "created_at");
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
     * `is_approved` is stripped server-side even if sent, so approval stays on the
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

    /** Approve with `is_approved: true`, reject with `false`. Manager only. */
    approveAdditionalTask: builder.mutation<AdditionalTask, { id: string; is_approved: boolean }>({
      query: ({ id, is_approved }) => ({
        url: `/additional-task/approve-additional-task/${encodeURIComponent(id)}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { is_approved },
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

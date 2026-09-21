import { baseApi } from "../baseApi";
import { tagTypes } from "../../tagTypes";
import type { Ref } from "../types";
import type { CleaningPlan } from "./cleaningPlans.api";


export type AdditionalTaskDecision = "Approved" | "Rejected";


export type PhotoRequirement = {
  title: string;
  photo_url?: string | null;
  is_uploaded?: boolean;
  description?: string;
  reference_image_url?: string;
};

function withEmptyPhotoStrings<T extends {
  photo_requirements?: PhotoRequirement[];
}>(input: T): T {
  return {
    ...input,
    photo_requirements: input.photo_requirements?.map((photo) => ({
      title: photo.title,
      photo_url: photo.photo_url ?? "",
      is_uploaded: Boolean(photo.is_uploaded),
      description: photo.description ?? "",
      reference_image_url: photo.reference_image_url ?? "",
    })),
  };
}

export type AdditionalTask = {
  _id: string;
  cleaning_plan_id: Ref<CleaningPlan>;
  name: string;
  description?: string;
  duration_minutes?: number;
  is_photo_required?: boolean;
  photo_requirements?: PhotoRequirement[];
  required_photo_count?: number;
  date_time?: string;
  is_completed?: boolean;
  status?: AdditionalTaskDecision | "Pending";
  reject_reason?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAdditionalTaskInput = {
  cleaning_plan_id: string;
  name: string;
  description?: string;
  duration_minutes?: number;
  is_photo_required?: boolean;
  photo_requirements?: PhotoRequirement[];
  required_photo_count?: number;
  date_time?: string;
};

export type UpdateAdditionalTaskInput = {
  name?: string;
  description?: string;
  duration_minutes?: number;
  is_photo_required?: boolean;
  photo_requirements?: PhotoRequirement[];
  required_photo_count?: number;
  date_time?: string;
  is_completed?: boolean;
};



export function additionalTaskStatus(task: Pick<AdditionalTask, "is_completed" | "status">): string {
  if (task.is_completed) return "completed";
  return (task.status ?? "Pending").toLowerCase();
}


export const additionalTaskApproved = (task: Pick<AdditionalTask, "status">) =>
  task.status === "Approved";


export type AdditionalTaskMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};


export type AdditionalTaskListResponse = {
  meta: AdditionalTaskMeta;
  result: AdditionalTask[];
};

export type AdditionalTasksQuery = {
  
  planId?: string;
  page?: number;
  limit?: number;
  
  searchTerm?: string;
  
  sort?: string;
  status?: AdditionalTaskDecision | "Pending";
  is_completed?: boolean;
  is_photo_required?: boolean;
};

export const additionalTasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAdditionalTask: builder.mutation<AdditionalTask, CreateAdditionalTaskInput>({
      query: (body) => ({
        url: "/additional-task/create-additional-task",
        method: "POST",
        body: withEmptyPhotoStrings(body),
      }),
      
      invalidatesTags: (_result, _error, { cleaning_plan_id }) => [
        { type: tagTypes.cleaningPlans, id: cleaning_plan_id },
        { type: tagTypes.cleaningPlans, id: "LIST" },
        { type: tagTypes.tasks, id: "LIST" },
      ],
    }),



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



    updateAdditionalTask: builder.mutation<AdditionalTask, { id: string } & UpdateAdditionalTaskInput>({
      query: ({ id, ...body }) => ({
        url: `/additional-task/update-additional-task/${encodeURIComponent(id)}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: withEmptyPhotoStrings(body),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: tagTypes.tasks, id },
        { type: tagTypes.tasks, id: "LIST" },
        { type: tagTypes.cleaningPlans, id: "LIST" },
      ],
    }),



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

import { baseApi } from "./baseApi";
import type {
  WorkerApi,
  WorkerInput,
  UpdateWorkerInput,
  GetWorkerApprovalsResponse,
  ApproveWorkerInput,
} from "@/services/actions/workers";

export const workersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getWorkers: builder.query<
      { total_workers: number; employees_count: number; freelancers_count: number; page: number; limit: number; has_more: boolean; workers: WorkerApi[] },
      { page?: number; limit?: number; search?: string; workerType?: string; status?: string } | void
    >({
      query: (input) => {
        const q = new URLSearchParams({
          page: String(input?.page ?? 1),
          limit: String(input?.limit ?? 100),
        });
        if (input?.search) q.set("search", input.search);
        if (input?.workerType) q.set("worker_type", input.workerType);
        if (input?.status) q.set("status_filter", input.status);
        return `/manager/workers?${q.toString()}`;
      },
      providesTags: ["workers" as never, "users" as never],
    }),
    getDeletedWorkers: builder.query<
      { total_workers: number; employees_count: number; freelancers_count: number; workers: WorkerApi[] },
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (input) => {
        const q = new URLSearchParams({
          page: String(input?.page ?? 1),
          limit: String(input?.limit ?? 10),
        });
        if (input?.search) q.set("search", input.search);
        return `/manager/workers/deleted-list?${q.toString()}`;
      },
      providesTags: ["workers" as never],
    }),
    getWorkerApprovals: builder.query<
      GetWorkerApprovalsResponse,
      { page?: number; limit?: number; status?: string; search?: string } | void
    >({
      query: (input) => {
        const q = new URLSearchParams({
          page: String(input?.page ?? 1),
          limit: String(input?.limit ?? 10),
          status_filter: input?.status ?? "pending",
        });
        if (input?.search) q.set("search", input.search);
        return `/manager/manager/worker-approvals?${q.toString()}`;
      },
      providesTags: ["workers" as never],
    }),
    getAvailableWorkers: builder.query<{ total_count: number; workers: unknown[] }, { page?: number; limit?: number; search?: string } | void>({
      query: (input) => {
        const q = new URLSearchParams({
          page: String(input?.page ?? 1),
          limit: String(input?.limit ?? 100),
        });
        if (input?.search) q.set("search", input.search);
        return `/manager/workers-list?${q.toString()}`;
      },
      providesTags: ["workers" as never],
    }),
    createWorker: builder.mutation<WorkerApi, WorkerInput>({
      query: (body) => ({
        url: "/manager/workers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["workers" as never, "users" as never],
    }),
    updateWorkerDetails: builder.mutation<WorkerApi, { workerId: string; body: UpdateWorkerInput }>({
      query: ({ workerId, body }) => ({
        url: `/manager/workers/${encodeURIComponent(workerId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["workers" as never, "users" as never],
    }),
    updateWorkerStatus: builder.mutation<string, { workerId: string; status: string; reason: string }>({
      query: ({ workerId, status, reason }) => ({
        url: `/manager/workers/${encodeURIComponent(workerId)}/status`,
        method: "PATCH",
        body: { status, reason },
      }),
      invalidatesTags: ["workers" as never, "users" as never],
    }),
    deleteWorker: builder.mutation<string, string>({
      query: (workerId) => ({
        url: `/manager/workers/${encodeURIComponent(workerId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["workers" as never, "users" as never],
    }),
    restoreWorker: builder.mutation<string, string>({
      query: (workerId) => ({
        url: `/manager/workers/${encodeURIComponent(workerId)}/restore`,
        method: "POST",
      }),
      invalidatesTags: ["workers" as never, "users" as never],
    }),
    approveWorker: builder.mutation<unknown, { workerId: string; input?: ApproveWorkerInput }>({
      query: ({ workerId, input }) => ({
        url: `/manager/manager/workers/${encodeURIComponent(workerId)}/approve`,
        method: "POST",
        body: input ?? {},
      }),
      invalidatesTags: ["workers" as never, "users" as never],
    }),
    rejectWorker: builder.mutation<string, { workerId: string; reason: string }>({
      query: ({ workerId, reason }) => ({
        url: `/manager/manager/workers/${encodeURIComponent(workerId)}/reject`,
        method: "POST",
        body: { reject_reason: reason },
      }),
      invalidatesTags: ["workers" as never, "users" as never],
    }),
  }),
});

export const {
  useGetWorkersQuery,
  useGetDeletedWorkersQuery,
  useGetWorkerApprovalsQuery,
  useGetAvailableWorkersQuery,
  useCreateWorkerMutation,
  useUpdateWorkerDetailsMutation,
  useUpdateWorkerStatusMutation,
  useDeleteWorkerMutation,
  useRestoreWorkerMutation,
  useApproveWorkerMutation,
  useRejectWorkerMutation,
} = workersApi;


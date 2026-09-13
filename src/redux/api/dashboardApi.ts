/**
 * Endpoints still pointing at the previous backend.
 *
 * Clients, locations, rooms and tasks have moved to `./endpoints/*.api.ts` and were removed from
 * here on purpose: every slice injects into the same `baseApi`, and because this file sets
 * `overrideExisting`, a duplicate endpoint name silently replaces the other one — which is how
 * the migrated clients list kept calling the old `/manager/clients` route.
 *
 * Whatever remains below belongs to a screen that has not been migrated yet. Move each one into
 * its own `endpoints/*.api.ts` as its API lands, and delete this file once it is empty.
 */
import { baseApi } from "./baseApi";
import type { DashboardOverview, InProgressShift } from "@/services/actions/dashboard";
import type { PlanSummary } from "@/services/actions/cleaningPlans";
import type { ExtraServiceRequest } from "@/services/actions/extraServices";
import type { WorkerApi } from "@/services/actions/workers";
import type { NotificationApi } from "@/services/actions/notifications";

const paged = (params: { page?: number; limit?: number } | void, fallbackLimit = 20) =>
  new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? fallbackLimit),
  });

export const dashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardOverview, string | void>({
      query: (status) => {
        const params = new URLSearchParams();
        if (status) params.append("status_filter", status);
        const qs = params.toString();
        return `/manager/dashboard/overview${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["dashboard" as never],
    }),

    getInProgressShifts: builder.query<{ shifts: InProgressShift[] }, void>({
      query: () => "/manager/dashboard/in-progress-shifts",
      providesTags: ["dashboard" as never],
    }),

    getCleaningPlans: builder.query<
      { plans: PlanSummary[]; total_count: number },
      { search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const qp = paged(params);
        if (params?.search) qp.append("search", params.search);
        return `/manager/cleaning-plans?${qp.toString()}`;
      },
      providesTags: ["cleaningPlans" as never],
    }),

    getExtraServices: builder.query<
      { requests: ExtraServiceRequest[]; total_count: number },
      { status?: string; priority?: string; client_id?: string; search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const qp = paged(params, 50);
        if (params?.status) qp.append("status_val", params.status);
        if (params?.priority) qp.append("priority", params.priority);
        if (params?.client_id) qp.append("client_id", params.client_id);
        if (params?.search) qp.append("search", params.search);
        return `/manager/extra-services?${qp.toString()}`;
      },
      providesTags: ["extraServices" as never],
    }),

    getWorkers: builder.query<
      {
        workers: WorkerApi[];
        total_count: number;
        total_workers: number;
        employees_count: number;
        freelancers_count: number;
      },
      { search?: string; workerType?: string; statusFilter?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const qp = paged(params);
        if (params?.search) qp.append("search", params.search);
        // Backend query param names are `worker_type`/`status_filter` (manager-worker.validation.ts) —
        // this previously sent `role`/`is_active`, which the backend's zod schema silently strips,
        // so the Employees/Freelancers and status filter buttons had no effect at all.
        if (params?.workerType) qp.append("worker_type", params.workerType);
        if (params?.statusFilter) qp.append("status_filter", params.statusFilter);
        return `/manager/workers?${qp.toString()}`;
      },
      providesTags: ["users" as never],
    }),

    getNotifications: builder.query<
      { notifications: NotificationApi[]; total_count?: number; unread_count: number; has_more?: boolean },
      { page?: number; limit?: number } | void
    >({
      query: (params) => `/manager/notifications?${paged(params).toString()}`,
      providesTags: ["notifications" as never],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetInProgressShiftsQuery,
  useGetCleaningPlansQuery,
  useGetExtraServicesQuery,
  useGetWorkersQuery,
  useGetNotificationsQuery,
} = dashboardApi;

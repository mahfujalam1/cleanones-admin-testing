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




  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetInProgressShiftsQuery,
} = dashboardApi;

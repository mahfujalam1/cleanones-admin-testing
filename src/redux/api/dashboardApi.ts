import { baseApi } from "./baseApi";
import type { DashboardOverview, InProgressShift } from "@/services/actions/dashboard";
import type { ClientSummary } from "@/services/actions/clients";
import type { LocationGridItem } from "@/services/actions/locations";
import type { RoomGridItem } from "@/services/actions/rooms";
import type { RosterShift } from "@/services/actions/roster";
import type { PlanSummary } from "@/services/actions/cleaningPlans";
import type { ExtraServiceRequest } from "@/services/actions/extraServices";
import type { WorkerApi } from "@/services/actions/workers";
import type { NotificationApi } from "@/services/actions/notifications";

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
    getWorkerAttendanceSummary: builder.query<unknown, void>({
      query: () => "/manager/dashboard/worker-attendance-summary",
      providesTags: ["dashboard" as never],
    }),
    getClients: builder.query<{ clients: ClientSummary[]; total_count: number }, { search?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const qp = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(params?.limit ?? 100),
        });
        if (params?.search) qp.append("search", params.search);
        return `/manager/clients?${qp.toString()}`;
      },
      providesTags: ["clients" as never],
    }),
    getLocations: builder.query<{ locations: LocationGridItem[]; total_count: number }, { search?: string; client_id?: string; location_id?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const qp = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(params?.limit ?? 100),
        });
        if (params?.search) qp.append("search", params.search);
        if (params?.client_id) qp.append("client_id", params.client_id);
        if (params?.location_id) qp.append("location_id", params.location_id);
        return `/manager/locations?${qp.toString()}`;
      },
      providesTags: ["locations" as never],
    }),
    getRooms: builder.query<
      { rooms: RoomGridItem[]; total_count: number },
      { location_id?: string; client_id?: string; room_id?: string; search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const qp = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(params?.limit ?? 100),
        });
        if (params?.search) qp.append("search", params.search);
        if (params?.client_id) qp.append("client_id", params.client_id);
        if (params?.location_id) qp.append("location_id", params.location_id);
        if (params?.room_id) qp.append("room_id", params.room_id);
        return `/manager/rooms?${qp.toString()}`;
      },
      providesTags: ["rooms" as never],
    }),
    getShifts: builder.query<{ shifts: RosterShift[]; total_count: number }, { start_date?: string; end_date?: string; status?: string; search?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const qp = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(params?.limit ?? 100),
        });
        if (params?.start_date) qp.append("start_date", params.start_date);
        if (params?.end_date) qp.append("end_date", params.end_date);
        if (params?.status) qp.append("status", params.status);
        if (params?.search) qp.append("search", params.search);
        return `/manager/roster/shifts?${qp.toString()}`;
      },
      providesTags: ["roster" as never],
    }),
    getCleaningPlans: builder.query<{ plans: PlanSummary[]; total_count: number }, { search?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const qp = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(params?.limit ?? 100),
        });
        if (params?.search) qp.append("search", params.search);
        return `/manager/cleaning-plans?${qp.toString()}`;
      },
      providesTags: ["cleaningPlans" as never],
    }),
    getExtraServices: builder.query<{ requests: ExtraServiceRequest[]; total_count: number }, { status?: string; priority?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const qp = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(params?.limit ?? 100),
        });
        if (params?.status) qp.append("status", params.status);
        if (params?.priority) qp.append("priority", params.priority);
        return `/manager/extra-services/requests?${qp.toString()}`;
      },
      providesTags: ["extraServices" as never],
    }),
    getWorkers: builder.query<{ workers: WorkerApi[]; total_count: number; total_workers: number; employees_count: number; freelancers_count: number }, { search?: string; role?: string; is_active?: boolean; page?: number; limit?: number } | void>({
      query: (params) => {
        const qp = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(params?.limit ?? 100),
        });
        if (params?.search) qp.append("search", params.search);
        if (params?.role) qp.append("role", params.role);
        if (params?.is_active !== undefined) qp.append("is_active", String(params.is_active));
        return `/manager/workers?${qp.toString()}`;
      },
      providesTags: ["users" as never],
    }),
    getNotifications: builder.query<{ notifications: NotificationApi[]; total_count?: number; unread_count: number; has_more?: boolean }, { page?: number; limit?: number } | void>({
      query: (params) => {
        const qp = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(params?.limit ?? 100),
        });
        return `/manager/notifications?${qp.toString()}`;
      },
      providesTags: ["notifications" as never],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetInProgressShiftsQuery,
  useGetWorkerAttendanceSummaryQuery,
  useGetClientsQuery,
  useGetLocationsQuery,
  useGetRoomsQuery,
  useGetShiftsQuery,
  useGetCleaningPlansQuery,
  useGetExtraServicesQuery,
  useGetWorkersQuery,
  useGetNotificationsQuery,
} = dashboardApi;

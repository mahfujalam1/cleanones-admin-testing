import { baseApi } from "./baseApi";
import type { ShiftApi, ShiftDraftInput } from "@/services/actions/shifts";

export const shiftsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getShiftDrafts: builder.query<{ total_count: number; page: number; limit: number; has_more: boolean; drafts: ShiftApi[] }, { page?: number; limit?: number } | void>({
      query: (params) => `/manager/shifts/drafts?page=${params?.page ?? 1}&limit=${params?.limit ?? 100}`,
      providesTags: ["shifts" as never],
    }),
    getShifts: builder.query<
      { total_count: number; page: number; limit: number; has_more: boolean; shifts: ShiftApi[] },
      { page?: number; limit?: number; clientId?: string; locationId?: string; date?: string; status?: string } | void
    >({
      query: (input) => {
        const q = new URLSearchParams({
          page: String(input?.page ?? 1),
          limit: String(input?.limit ?? 100),
        });
        if (input?.clientId) q.set("client_id", input.clientId);
        if (input?.locationId) q.set("location_id", input.locationId);
        if (input?.date) q.set("date", input.date);
        if (input?.status) q.set("status_filter", input.status);
        return `/manager/shifts?${q.toString()}`;
      },
      providesTags: ["shifts" as never],
    }),
    getShift: builder.query<ShiftApi, string>({
      query: (shiftId) => `/manager/shifts/${encodeURIComponent(shiftId)}`,
      providesTags: (_res, _err, shiftId) => [{ type: "shifts" as never, id: shiftId }],
    }),
    createShiftDraft: builder.mutation<ShiftApi, ShiftDraftInput>({
      query: (body) => ({
        url: "/manager/shifts/drafts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["shifts" as never],
    }),
    assignAndPublishShift: builder.mutation<
      ShiftApi,
      { draft_id: string; team_leader_id: string; worker_ids: string[]; worker_assignments: Array<{ worker_id: string; shift_role: string }> }
    >({
      query: (body) => ({
        url: "/manager/shifts/assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["shifts" as never, "roster" as never, "dashboard" as never],
    }),
  }),
});

export const {
  useGetShiftDraftsQuery,
  useGetShiftsQuery,
  useGetShiftQuery,
  useCreateShiftDraftMutation,
  useAssignAndPublishShiftMutation,
} = shiftsApi;

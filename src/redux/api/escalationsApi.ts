import { baseApi } from "./baseApi";
import type { EscalationApi } from "@/services/actions/escalations";

export const escalationsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getEscalations: builder.query<
      { total_count: number; page: number; limit: number; has_more: boolean; open_count: number; in_progress_count: number; resolved_count: number; escalations: EscalationApi[] },
      { page?: number; limit?: number; status?: string; search?: string } | void
    >({
      query: (input) => {
        const q = new URLSearchParams({
          page: String(input?.page ?? 1),
          limit: String(input?.limit ?? 100),
        });
        if (input?.status) q.set("status_filter", input.status);
        if (input?.search) q.set("search", input.search);
        return `/manager/escalations?${q.toString()}`;
      },
      providesTags: ["escalations" as never],
    }),
    getEscalation: builder.query<EscalationApi, string>({
      query: (id) => `/manager/escalations/${encodeURIComponent(id)}`,
      providesTags: (_res, _err, id) => [{ type: "escalations" as never, id }],
    }),
    updateEscalationStatus: builder.mutation<string, { id: string; status: string; notes: string }>({
      query: ({ id, status, notes }) => ({
        url: `/manager/escalations/${encodeURIComponent(id)}/status`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { status, notes },
      }),
      invalidatesTags: ["escalations" as never],
    }),
  }),
});

export const {
  useGetEscalationsQuery,
  useGetEscalationQuery,
  useUpdateEscalationStatusMutation,
} = escalationsApi;

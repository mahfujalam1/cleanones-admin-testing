import { baseApi } from "./baseApi";
import { tagTypes } from "../tagTypes";

export type IssueReport = {
  _id: string;
  worker?: string | { _id: string; name?: string; full_name?: string; email?: string; phone?: string; profile_picture?: string };
  issueType: string;
  severity: "Low" | "Medium" | "High" | "Emergency" | string;
  location?: string | { _id: string; name?: string; address?: string };
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | string;
  createdAt: string;
  updatedAt: string;
};

export type EscalationApi = IssueReport;

export const escalationsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getEscalations: builder.query<IssueReport[], void>({
      query: () => "/issue-report/all-issue-reports",
      transformResponse: (response: { success: boolean; data: IssueReport[] } | IssueReport[]) => {
        if (Array.isArray(response)) return response;
        return response?.data ?? [];
      },
      providesTags: (result) => [
        { type: tagTypes.escalations, id: "LIST" },
        ...(result ?? []).map((item) => ({ type: tagTypes.escalations, id: item._id })),
      ],
    }),

    updateIssueReport: builder.mutation<
      IssueReport,
      {
        id: string;
        status?: "PENDING" | "IN_PROGRESS" | "RESOLVED" | string;
        issueType?: string;
        severity?: string;
        location?: string;
        description?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/issue-report/update-issue-report/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: tagTypes.escalations, id: "LIST" }],
    }),

    deleteIssueReport: builder.mutation<IssueReport, string>({
      query: (id) => ({
        url: `/issue-report/delete-issue-report/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: tagTypes.escalations, id: "LIST" }],
    }),
  }),
});

export const {
  useGetEscalationsQuery,
  useUpdateIssueReportMutation,
  useDeleteIssueReportMutation,
} = escalationsApi;

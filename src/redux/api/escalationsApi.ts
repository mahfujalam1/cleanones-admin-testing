import { baseApi } from "./baseApi";
import { tagTypes } from "../tagTypes";
import { listQuery, type ListParams, type Paginated } from "./types";

export type IssueReport = {
  _id: string;
  worker?: string | { _id: string; name?: string; full_name?: string; email?: string; phone?: string; profile_picture?: string };
  issueType: string;
  severity: "Low" | "Medium" | "High" | "Emergency" | string;
  location?: string | { _id: string; name?: string; address?: string };
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | string;
  resolution_note?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EscalationApi = IssueReport;

function asIssueReports(response: unknown): IssueReport[] {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];
  const rec = response as { result?: unknown; data?: unknown };
  if (Array.isArray(rec.result)) return rec.result as IssueReport[];
  if (Array.isArray(rec.data)) return rec.data as IssueReport[];
  return [];
}

export function isPendingIssue(status?: string) {
  const value = (status || "").toUpperCase();
  return value === "PENDING" || value === "OPEN";
}

export const escalationsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getEscalations: builder.query<IssueReport[], ListParams | void>({
      query: (params) => `/issue-report/all-issue-reports?${listQuery({ limit: 200, ...params })}`,
      transformResponse: (response: IssueReport[] | Paginated<IssueReport> | { data?: IssueReport[] } | null) =>
        asIssueReports(response),
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
        resolution_note?: string;
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

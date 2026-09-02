import { baseApi } from "./baseApi";
import type {
  ManagerProfile,
  CompanyProfile,
  LegalDocument,
  SupportMessage,
  Faq,
} from "@/services/actions/manager";

export const managerApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getManagerProfile: builder.query<ManagerProfile, void>({
      query: () => "/manager/me",
      providesTags: ["manager" as never, "profile" as never],
    }),
    updateManagerProfile: builder.mutation<ManagerProfile, Pick<ManagerProfile, "full_name" | "phone" | "address" | "website" | "is_active">>({
      query: (body) => ({
        url: "/manager/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["manager" as never, "profile" as never],
    }),
    getCompanyProfile: builder.query<CompanyProfile, void>({
      query: () => "/manager/company-profile",
      providesTags: ["manager" as never],
    }),
    updateCompanyProfile: builder.mutation<CompanyProfile, Omit<CompanyProfile, "updated_at">>({
      query: (body) => ({
        url: "/manager/company-profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["manager" as never],
    }),
    getLegalDocument: builder.query<LegalDocument, string>({
      query: (type) => `/manager/legal-documents/${encodeURIComponent(type)}`,
      providesTags: (_res, _err, type) => [{ type: "manager" as never, id: `legal-${type}` }],
    }),
    updateLegalDocument: builder.mutation<LegalDocument, { type: string; title: string; content: string }>({
      query: ({ type, ...body }) => ({
        url: `/manager/legal-documents/${encodeURIComponent(type)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { type }) => [{ type: "manager" as never, id: `legal-${type}` }],
    }),
    getSupportMessages: builder.query<
      { total_count: number; unread_count: number; messages: SupportMessage[] },
      { page?: number; limit?: number; statusFilter?: string } | void
    >({
      query: (params) => {
        const q = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(params?.limit ?? 10),
        });
        if (params?.statusFilter) q.set("status_filter", params.statusFilter);
        return `/manager/support-messages?${q.toString()}`;
      },
      providesTags: ["manager" as never],
    }),
    replySupportMessage: builder.mutation<SupportMessage, { messageId: string; admin_reply: string; status: string; is_resolved: boolean }>({
      query: ({ messageId, ...body }) => ({
        url: `/manager/support-messages/${encodeURIComponent(messageId)}/reply`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["manager" as never],
    }),
    getFaqs: builder.query<Faq[], void>({
      query: () => "/manager/faqs",
      providesTags: ["manager" as never],
    }),
    createFaq: builder.mutation<Faq, { question: string; answer: string; serial_no: number }>({
      query: (body) => ({
        url: "/manager/faqs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["manager" as never],
    }),
    updateFaq: builder.mutation<Faq, { faqId: string; question: string; answer: string; serial_no: number }>({
      query: ({ faqId, ...body }) => ({
        url: `/manager/faqs/${encodeURIComponent(faqId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["manager" as never],
    }),
    deleteFaq: builder.mutation<string, string>({
      query: (faqId) => ({
        url: `/manager/faqs/${encodeURIComponent(faqId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["manager" as never],
    }),
  }),
});

export const {
  useGetManagerProfileQuery,
  useUpdateManagerProfileMutation,
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
  useGetLegalDocumentQuery,
  useUpdateLegalDocumentMutation,
  useGetSupportMessagesQuery,
  useReplySupportMessageMutation,
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = managerApi;

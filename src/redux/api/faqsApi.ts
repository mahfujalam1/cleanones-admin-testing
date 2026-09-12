import { baseApi } from "./baseApi";
import type { FaqItem, CreateFaqDto, UpdateFaqDto } from "@/services/actions/faqs";

export const faqsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getFaqs: builder.query<FaqItem[], void>({
      query: () => "/manager/faqs",
      providesTags: ["faqs" as never],
    }),

    createFaq: builder.mutation<FaqItem, CreateFaqDto>({
      query: (body) => ({
        url: "/manager/faqs",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: ["faqs" as never],
    }),

    updateFaq: builder.mutation<FaqItem, { id: string; body: UpdateFaqDto }>({
      query: ({ id, body }) => ({
        url: `/manager/faqs/${encodeURIComponent(id)}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: ["faqs" as never],
    }),

    deleteFaq: builder.mutation<string, string>({
      query: (id) => ({
        url: `/manager/faqs/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["faqs" as never],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqsApi;

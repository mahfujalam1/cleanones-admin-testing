import { baseApi } from "./baseApi";
import type { ManageFaq, CreateManageFaqDto, UpdateManageFaqDto } from "@/services/actions/faqs";

export const manageFaqApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getManageFaqs: builder.query<ManageFaq[], void>({
      query: () => ({ url: "/manage/get-faq", cache: "no-store" as RequestCache }),

      transformResponse: (response: unknown) => (Array.isArray(response) ? (response as ManageFaq[]) : []),
      providesTags: ["faqs" as never],
    }),

    addManageFaq: builder.mutation<ManageFaq, CreateManageFaqDto>({
      query: (body) => ({
        url: "/manage/add-faq",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { question: body.question, answer: body.answer },
      }),
      invalidatesTags: ["faqs" as never],
    }),

    editManageFaq: builder.mutation<ManageFaq, { id: string; body: UpdateManageFaqDto }>({
      query: ({ id, body }) => ({
        url: `/manage/edit-faq/${encodeURIComponent(id)}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: ["faqs" as never],
    }),

    deleteManageFaq: builder.mutation<ManageFaq, string>({
      query: (id) => ({
        url: `/manage/delete-faq/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["faqs" as never],
    }),
  }),
});

export const {
  useGetManageFaqsQuery,
  useAddManageFaqMutation,
  useEditManageFaqMutation,
  useDeleteManageFaqMutation,
} = manageFaqApi;

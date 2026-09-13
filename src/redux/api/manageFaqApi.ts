import { baseApi } from "./baseApi";
import type { ManageFaq, CreateManageFaqDto, UpdateManageFaqDto } from "@/services/actions/faqs";

/**
 * The `/manage/*-faq` routes. Reading is public; every write requires the
 * `superAdmin` role, so a mutation can legitimately come back 403.
 *
 * `baseApi` already unwraps the `{ success, message, data }` envelope, so these
 * endpoints see `data` directly — an array for the list, a single FAQ otherwise.
 */
export const manageFaqApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getManageFaqs: builder.query<ManageFaq[], void>({
      query: () => ({ url: "/manage/get-faq", cache: "no-store" as RequestCache }),
      // A malformed payload would otherwise crash every `.map` downstream.
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

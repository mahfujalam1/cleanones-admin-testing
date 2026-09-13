import { baseApi } from "./baseApi";
import type {
  SuggestedQuestion,
  SuggestedQuestionsResponse,
  CreateSuggestedQuestionDto,
  UpdateSuggestedQuestionDto,
  GetSuggestedQuestionsQuery,
} from "@/services/actions/suggestedQuestions";

/** Responses come wrapped as { success, message, data }; older routes return the payload directly. */
function unwrap<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export const suggestedQuestionsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSuggestedQuestions: builder.query<SuggestedQuestionsResponse, GetSuggestedQuestionsQuery | void>({
      query: (params) => {
        const queryParams = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(Math.min(params?.limit ?? 50, 200)),
        });
        return { url: `/suggested-questions?${queryParams.toString()}`, cache: "no-store" as RequestCache };
      },
      transformResponse: (response: unknown) => unwrap<SuggestedQuestionsResponse>(response),
      providesTags: ["suggestedQuestions" as never],
    }),

    createSuggestedQuestion: builder.mutation<SuggestedQuestion, CreateSuggestedQuestionDto>({
      query: (body) => ({
        url: "/suggested-questions",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      transformResponse: (response: unknown) => unwrap<SuggestedQuestion>(response),
      invalidatesTags: ["suggestedQuestions" as never],
    }),

    updateSuggestedQuestion: builder.mutation<
      SuggestedQuestion,
      { id: string; body: UpdateSuggestedQuestionDto }
    >({
      query: ({ id, body }) => ({
        url: `/suggested-questions/${encodeURIComponent(id)}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      transformResponse: (response: unknown) => unwrap<SuggestedQuestion>(response),
      invalidatesTags: ["suggestedQuestions" as never],
    }),

    deleteSuggestedQuestion: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/suggested-questions/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => unwrap<{ message: string }>(response),
      invalidatesTags: ["suggestedQuestions" as never],
    }),
  }),
});

export const {
  useGetSuggestedQuestionsQuery,
  useCreateSuggestedQuestionMutation,
  useUpdateSuggestedQuestionMutation,
  useDeleteSuggestedQuestionMutation,
} = suggestedQuestionsApi;

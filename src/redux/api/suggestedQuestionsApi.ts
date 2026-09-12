import { baseApi } from "./baseApi";
import type {
  SuggestedQuestion,
  SuggestedQuestionsResponse,
  CreateSuggestedQuestionDto,
  UpdateSuggestedQuestionDto,
  GetSuggestedQuestionsQuery,
} from "@/services/actions/suggestedQuestions";

export const suggestedQuestionsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSuggestedQuestions: builder.query<SuggestedQuestionsResponse, GetSuggestedQuestionsQuery | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.target_role && params.target_role !== "all_filter") {
          queryParams.set("target_role", params.target_role);
        }
        queryParams.set("page", String(params?.page ?? 1));
        queryParams.set("limit", String(params?.limit ?? 50));
        const qs = queryParams.toString();
        return `/manager/suggested-questions${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["suggestedQuestions" as never],
    }),

    createSuggestedQuestion: builder.mutation<SuggestedQuestion, CreateSuggestedQuestionDto>({
      query: (body) => ({
        url: "/manager/suggested-questions",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: ["suggestedQuestions" as never],
    }),

    updateSuggestedQuestion: builder.mutation<
      SuggestedQuestion,
      { id: string; body: UpdateSuggestedQuestionDto }
    >({
      query: ({ id, body }) => ({
        url: `/manager/suggested-questions/${encodeURIComponent(id)}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: ["suggestedQuestions" as never],
    }),

    deleteSuggestedQuestion: builder.mutation<string, string>({
      query: (id) => ({
        url: `/manager/suggested-questions/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
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

import { baseApi } from "./baseApi";
import { tagTypes } from "../tagTypes";
import type {
  QuestionSuggestion,
  CreateQuestionSuggestionDto,
  UpdateQuestionSuggestionDto,
} from "@/services/actions/suggestedQuestions";

export const suggestedQuestionsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getQuestionSuggestions: builder.query<QuestionSuggestion[], void>({
      query: () => ({
        url: "/question-suggestion/all-question-suggestions",
        cache: "no-store" as RequestCache,
      }),
      transformResponse: (response: unknown) =>
        Array.isArray(response) ? (response as QuestionSuggestion[]) : [],
      providesTags: [tagTypes.suggestedQuestions],
    }),

    createQuestionSuggestion: builder.mutation<QuestionSuggestion, CreateQuestionSuggestionDto>({
      query: (body) => ({
        url: "/question-suggestion/create-question-suggestion",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          question: body.question,
          answer: body.answer,
        },
      }),
      invalidatesTags: [tagTypes.suggestedQuestions],
    }),

    updateQuestionSuggestion: builder.mutation<
      QuestionSuggestion,
      { id: string; body: UpdateQuestionSuggestionDto }
    >({
      query: ({ id, body }) => ({
        url: `/question-suggestion/update-question-suggestion/${encodeURIComponent(id)}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: [tagTypes.suggestedQuestions],
    }),

    deleteQuestionSuggestion: builder.mutation<QuestionSuggestion, string>({
      query: (id) => ({
        url: `/question-suggestion/delete-question-suggestion/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.suggestedQuestions],
    }),
  }),
});

export const {
  useGetQuestionSuggestionsQuery,
  useCreateQuestionSuggestionMutation,
  useUpdateQuestionSuggestionMutation,
  useDeleteQuestionSuggestionMutation,

  useGetQuestionSuggestionsQuery: useGetSuggestedQuestionsQuery,
  useCreateQuestionSuggestionMutation: useCreateSuggestedQuestionMutation,
  useUpdateQuestionSuggestionMutation: useUpdateSuggestedQuestionMutation,
  useDeleteQuestionSuggestionMutation: useDeleteSuggestedQuestionMutation,
} = suggestedQuestionsApi;

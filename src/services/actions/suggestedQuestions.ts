export interface QuestionSuggestion {
  _id: string;
  question: string;
  answer: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuestionSuggestionDto {
  question: string;
  answer: string;
}

export interface UpdateQuestionSuggestionDto {
  question?: string;
  answer?: string;
}

export interface SuggestedQuestion {
  id: string;
  question: string;
  answer: string;
  created_by_manager_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SuggestedQuestionsResponse {
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;
  questions: SuggestedQuestion[];
}

export type CreateSuggestedQuestionDto = CreateQuestionSuggestionDto;
export type UpdateSuggestedQuestionDto = UpdateQuestionSuggestionDto;

export interface GetSuggestedQuestionsQuery {
  page?: number;
  limit?: number;
}

export interface SuggestedQuestion {
  id: string;
  question: string;
  answer: string;
  created_by_manager_id: string;
  created_at: string;
  updated_at: string;
}

export interface SuggestedQuestionsResponse {
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;
  questions: SuggestedQuestion[];
}

export interface CreateSuggestedQuestionDto {
  question: string;
  answer: string;
}

/** Both fields optional — send only what changed. */
export interface UpdateSuggestedQuestionDto {
  question?: string;
  answer?: string;
}

export interface GetSuggestedQuestionsQuery {
  page?: number;
  /** Server default 50, max 200. */
  limit?: number;
}

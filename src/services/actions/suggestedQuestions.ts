export type TargetRole = "all" | "client" | "worker";

export interface SuggestedQuestion {
  id: string;
  question: string;
  answer: string;
  target_role: TargetRole | string;
  is_active: boolean;
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
  target_role: TargetRole | string;
  is_active?: boolean;
}

export interface UpdateSuggestedQuestionDto {
  question?: string;
  answer?: string;
  target_role?: TargetRole | string;
  is_active?: boolean;
}

export interface GetSuggestedQuestionsQuery {
  target_role?: string | null;
  page?: number;
  limit?: number;
}

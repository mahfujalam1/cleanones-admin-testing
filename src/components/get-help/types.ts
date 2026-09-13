import type { SuggestedQuestion } from "@/services/actions/suggestedQuestions";

export interface GetHelpFilterState {
  search: string;
}

export interface QuestionModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  question?: SuggestedQuestion;
}

export interface DeleteModalState {
  isOpen: boolean;
  question?: SuggestedQuestion;
}

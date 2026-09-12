import type { SuggestedQuestion, TargetRole } from "@/services/actions/suggestedQuestions";

export interface GetHelpFilterState {
  search: string;
  role: string;
  status: "all" | "active" | "inactive";
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

export interface GetHelpStats {
  total: number;
  allRoles: number;
  clients: number;
  workers: number;
  active: number;
}

import type { FaqItem } from "@/services/actions/faqs";

export interface FaqModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  faq?: FaqItem;
}

export interface FaqDeleteModalState {
  isOpen: boolean;
  faq?: FaqItem;
}

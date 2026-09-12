export interface FaqItem {
  _id: string;
  serial_no: number;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFaqDto {
  question: string;
  answer: string;
  serial_no: number;
}

export interface UpdateFaqDto {
  question?: string;
  answer?: string;
  serial_no?: number;
}

export interface FaqItem {
  _id: string;
  serial_no: number;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
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




export interface ManageFaq {
  _id: string;
  question: string;
  answer: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateManageFaqDto {
  question: string;
  answer: string;
}


export interface UpdateManageFaqDto {
  question?: string;
  answer?: string;
}

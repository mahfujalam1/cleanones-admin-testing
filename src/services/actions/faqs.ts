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

/* ---------------------------------------------------------------------------
 * `/manage/*-faq` — the public FAQ content routes. These carry no `serial_no`;
 * the list arrives in insertion order. Kept separate from `FaqItem` above,
 * which still models the older `/manager/faqs` shape.
 * ------------------------------------------------------------------------ */

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

/** Both fields optional — send only what changed. */
export interface UpdateManageFaqDto {
  question?: string;
  answer?: string;
}

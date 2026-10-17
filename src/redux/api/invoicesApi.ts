import { baseApi } from "./baseApi";
import { tagTypes } from "../tagTypes";
import { isCurrentCompanyAdmin } from "@/lib/auth/isCompanyAdmin";

export type InvoiceItem = {
  _id: string;
  manager: string | { _id: string; name: string; email: string; phone?: string };
  worker: string | { _id: string; name: string; email?: string; phone?: string; worker_type?: string; hourly_rate?: number };
  amount: number;
  payment_method: string;
  transaction_id: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AllInvoicesResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  result: InvoiceItem[];
};

export type AllInvoicesParams = {
  worker?: string;
  page?: number;
  limit?: number;
  searchTerm?: string;
  sort?: string;
  fields?: string;
  manager?: string;
  isCompanyAdmin?: boolean;
};

export type CreateInvoiceInput = {
  worker: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  notes?: string;
};

export const invoicesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllInvoices: builder.query<AllInvoicesResponse, AllInvoicesParams | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.worker) q.set("worker", params.worker);
        if (params?.page) q.set("page", String(params.page));
        if (params?.limit) q.set("limit", String(params.limit));
        if (params?.searchTerm) q.set("searchTerm", params.searchTerm);
        if (params?.sort) q.set("sort", params.sort);
        if (params?.fields) q.set("fields", params.fields);
        if (params?.manager) q.set("manager", params.manager);
        const qs = q.toString();
        const isCompanyAdmin = isCurrentCompanyAdmin(params?.isCompanyAdmin);
        if (isCompanyAdmin) {
          return `/invoice/company-admin/get-all-invoices${qs ? `?${qs}` : ""}`;
        }
        return `/invoice/all-invoices${qs ? `?${qs}` : ""}`;
      },
      providesTags: (response) => [
        { type: tagTypes.invoices, id: "LIST" },
        ...(response?.result ?? []).map((inv) => ({ type: tagTypes.invoices, id: inv._id })),
      ],
    }),

    createInvoice: builder.mutation<InvoiceItem, CreateInvoiceInput>({
      query: (body) => ({
        url: "/invoice/create-invoice",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: tagTypes.invoices, id: "LIST" },
        { type: tagTypes.workers },
      ],
    }),
  }),
});

export const {
  useGetAllInvoicesQuery,
  useCreateInvoiceMutation,
} = invoicesApi;

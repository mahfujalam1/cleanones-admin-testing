import { baseApi } from "../baseApi";
import { listQuery, refId, type ListParams, type Paginated, type Ref } from "../types";
import { tagTypes } from "../../tagTypes";
import { isCurrentCompanyAdmin } from "@/lib/auth/isCompanyAdmin";

export const CONTRACT_STATUSES = ["Active", "Inactive", "Pending"] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export type Client = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  licence_expiration_date?: string;
  contract_status?: ContractStatus;
  
  user?: string;
  manager?: string | { _id: string; name: string; email: string; phone: string };
  last_updated_by?: string;
  
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function clientLabel(client: Pick<Client, "name" | "company_name" | "email">): string {
  return client.name?.trim() || client.company_name?.trim() || client.email || "Unnamed client";
}

export function clientCompanyLabel(client: Pick<Client, "name" | "company_name" | "email">): string {
  return client.company_name?.trim() || client.name?.trim() || client.email || "Unnamed client";
}

export type CreateClientInput = {
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  licence_expiration_date?: string;
  contract_status?: ContractStatus;
  password: string;
  confirmPassword: string;
};

export type UpdateClientInput = Partial<Omit<CreateClientInput, "password" | "confirmPassword">>;

export type ClientContact = {
  _id: string;
  client: Ref<Client>;
  name: string;
  role: string;
  email: string;
  phone: string;
  manager?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateContactInput = {
  name: string;
  role: string;
  email: string;
  phone: string;
};

export type BulkUploadItemCreated = {
  row: number;
  email: string;
  id?: string;
};

export type BulkUploadItemFailed = {
  row: number;
  email: string;
  error: string;
};

export type BulkUploadResult = {
  total: number;
  created_count: number;
  failed_count: number;
  created: BulkUploadItemCreated[];
  failed: BulkUploadItemFailed[];
};

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<
      Paginated<Client>,
      (ListParams & { contract_status?: ContractStatus; manager?: string; isCompanyAdmin?: boolean }) | void
    >({
      query: (params) => {
        const query = listQuery(params ?? {});
        const status = params?.contract_status ? `&contract_status=${encodeURIComponent(params.contract_status)}` : "";
        const managerParam = params?.manager ? `&manager=${encodeURIComponent(params.manager)}` : "";
        const isCompanyAdmin = isCurrentCompanyAdmin(params?.isCompanyAdmin);
        return isCompanyAdmin
          ? `/client/company-admin/get-all-clients?${query}${status}${managerParam}`
          : `/client/all-clients?${query}${status}`;
      },
      providesTags: (response) => [
        { type: tagTypes.clients, id: "LIST" },
        ...(response?.result ?? []).map(({ _id }) => ({ type: tagTypes.clients, id: _id })),
      ],
    }),

    getClient: builder.query<Client, { id: string; isCompanyAdmin?: boolean } | string>({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const isCompanyAdmin = isCurrentCompanyAdmin(typeof arg === "object" ? arg.isCompanyAdmin : undefined);
        return isCompanyAdmin
          ? `/client/company-admin/get-single-client/${encodeURIComponent(id)}`
          : `/client/get-single-client/${encodeURIComponent(id)}`;
      },
      transformResponse: (response: unknown) => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: Client }).data;
        }
        if (response && typeof response === "object" && "result" in response) {
          return (response as { result: Client }).result;
        }
        return response as Client;
      },
      providesTags: (_res, _err, arg) => [{ type: tagTypes.clients, id: typeof arg === "string" ? arg : arg.id }],
    }),

    createClient: builder.mutation<Client, CreateClientInput>({
      query: (body) => ({ url: "/client/create-client", method: "POST", body }),
      invalidatesTags: [{ type: tagTypes.clients, id: "LIST" }],
    }),

    bulkUploadClients: builder.mutation<BulkUploadResult, FormData>({
      query: (body) => ({ url: "/client/bulk-upload", method: "POST", body }),
      invalidatesTags: [{ type: tagTypes.clients, id: "LIST" }],
    }),

    updateClient: builder.mutation<Client, { id: string; body: UpdateClientInput }>({
      query: ({ id, body }) => ({
        url: `/client/update-client/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: tagTypes.clients, id },
        { type: tagTypes.clients, id: "LIST" },
      ],
    }),

    deleteClient: builder.mutation<null, string>({
      query: (id) => ({ url: `/client/delete-client/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: tagTypes.clients, id },
        { type: tagTypes.clients, id: "LIST" },
        { type: tagTypes.locations, id: "LIST" },
      ],
    }),

    getClientContacts: builder.query<ClientContact[], { clientId: string; isCompanyAdmin?: boolean }>({
      query: (arg) => {
        const isCompanyAdmin = isCurrentCompanyAdmin(arg?.isCompanyAdmin);
        return isCompanyAdmin
          ? `/client-contact/company-admin/get-all-client-contacts?client=${encodeURIComponent(arg.clientId)}`
          : "/client-contact/all-client-contacts";
      },
      transformResponse: (response: unknown, _meta, { clientId }) => {
        const raw =
          response && typeof response === "object" && "result" in response
            ? (response as { result: ClientContact[] }).result
            : Array.isArray(response)
            ? response
            : [];
        return (raw as ClientContact[]).filter((contact) => refId(contact.client) === clientId);
      },
      providesTags: (response, _error, { clientId }) => [
        { type: tagTypes.clients, id: `CONTACTS-${clientId}` },
        ...(response ?? []).map(({ _id }) => ({ type: tagTypes.clients, id: `CONTACT-${_id}` })),
      ],
    }),

    getClientContact: builder.query<ClientContact, { id: string; isCompanyAdmin?: boolean } | string>({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const isCompanyAdmin = isCurrentCompanyAdmin(typeof arg === "object" ? arg.isCompanyAdmin : undefined);
        return isCompanyAdmin
          ? `/client-contact/company-admin/get-single-client-contact/${encodeURIComponent(id)}`
          : `/client-contact/single-client-contact/${encodeURIComponent(id)}`;
      },
      transformResponse: (response: unknown) => {
        if (response && typeof response === "object" && "data" in response) {
          return (response as { data: ClientContact }).data;
        }
        if (response && typeof response === "object" && "result" in response) {
          return (response as { result: ClientContact }).result;
        }
        return response as ClientContact;
      },
      providesTags: (_res, _err, arg) => [{ type: tagTypes.clients, id: `CONTACT-${typeof arg === "string" ? arg : arg.id}` }],
    }),

    createClientContact: builder.mutation<ClientContact, { clientId: string; body: CreateContactInput }>({
      query: ({ clientId, body }) => ({
        url: `/client-contact/create-client-contact`,
        method: "POST",
        body: { ...body, client: clientId },
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: tagTypes.clients, id: `CONTACTS-${clientId}` },
      ],
    }),

    updateClientContact: builder.mutation<ClientContact, { clientId: string; contactId: string; body: Partial<CreateContactInput> }>({
      query: ({ contactId, body }) => ({
        url: `/client-contact/update-client-contact/${encodeURIComponent(contactId)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { clientId, contactId }) => [
        { type: tagTypes.clients, id: `CONTACT-${contactId}` },
        { type: tagTypes.clients, id: `CONTACTS-${clientId}` },
      ],
    }),

    deleteClientContact: builder.mutation<ClientContact, { clientId: string; contactId: string }>({
      query: ({ contactId }) => ({
        url: `/client-contact/delete-client-contact/${encodeURIComponent(contactId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { clientId }) => [
        { type: tagTypes.clients, id: `CONTACTS-${clientId}` },
      ],
    }),
  }),
});

export const CLIENT_LOOKUP_ARGS = { limit: 100 } as const;

export function useClientById(id: string, isCompanyAdmin?: boolean) {
  const isCompany = isCurrentCompanyAdmin(isCompanyAdmin);

  const singleQuery = clientsApi.useGetClientQuery(
    id ? { id, isCompanyAdmin: isCompany } : { id: "" },
    { skip: !id }
  );

  const fallbackQuery = clientsApi.useGetClientsQuery(
    isCompany ? { limit: 100, isCompanyAdmin: true } : CLIENT_LOOKUP_ARGS,
    {
      skip: Boolean(singleQuery.data) || !id,
      selectFromResult: ({ data, isLoading, error }) => ({
        fallbackClient: data?.result.find((candidate) => candidate._id === id),
        fallbackLoading: isLoading,
        fallbackError: error,
      }),
    }
  );

  const client = singleQuery.data ?? fallbackQuery.fallbackClient;
  const isLoading = singleQuery.isLoading || (fallbackQuery.fallbackLoading && !client);
  const error = singleQuery.error && !client ? singleQuery.error : undefined;

  return {
    client,
    isLoading,
    error,
    refetch: singleQuery.refetch,
  };
}

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useLazyGetClientQuery,
  useCreateClientMutation,
  useBulkUploadClientsMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetClientContactsQuery,
  useGetClientContactQuery,
  useCreateClientContactMutation,
  useUpdateClientContactMutation,
  useDeleteClientContactMutation,
} = clientsApi;

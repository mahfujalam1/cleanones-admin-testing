import { baseApi } from "../baseApi";
import { listQuery, refId, type ListParams, type Paginated, type Ref } from "../types";
import { tagTypes } from "../../tagTypes";

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
  /** Ids of the linked records, not the client profile itself. */
  user?: string;
  manager?: string;
  last_updated_by?: string;
  /** Snake_case elsewhere, but the API really does spell this one in camelCase. */
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * What to call a client in a list or dropdown. `name` is the account name and `company_name` the
 * legal entity, so the account name leads and the company stands in when it is missing.
 */
export function clientLabel(client: Pick<Client, "name" | "company_name" | "email">): string {
  return client.name?.trim() || client.company_name?.trim() || client.email || "Unnamed client";
}

/** Creating a client also creates its user account and emails the credentials. */
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
  /** The API returns the owning client as an id string. */
  client: Ref<Client>;
  name: string;
  role: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateContactInput = {
  name: string;
  role: string;
  email: string;
  phone: string;
};

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<Paginated<Client>, ListParams | void>({
      query: (params) => `/client/all-clients?${listQuery(params ?? {})}`,
      // Tagging each row means editing one client refreshes that row's caches, not every list.
      providesTags: (response) => [
        { type: tagTypes.clients, id: "LIST" },
        ...(response?.result ?? []).map(({ _id }) => ({ type: tagTypes.clients, id: _id })),
      ],
    }),

    createClient: builder.mutation<Client, CreateClientInput>({
      query: (body) => ({ url: "/client/create-client", method: "POST", body }),
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

    /** Soft delete: the client is deactivated and its user account blocked. */
    deleteClient: builder.mutation<null, string>({
      query: (id) => ({ url: `/client/delete-client/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: tagTypes.clients, id },
        { type: tagTypes.clients, id: "LIST" },
        // A removed client takes its locations out of any list that showed them.
        { type: tagTypes.locations, id: "LIST" },
      ],
    }),

    /**
     * `baseApi` already unwraps the `{ success, message, data }` envelope, so what arrives here is
     * the contact array itself — reading `.data` off it is what left the list empty.
     *
     * There is no per-client contact route, so the full list is fetched once and narrowed here.
     * Swap this for a scoped endpoint if the backend gains one; it will not scale as contacts grow.
     */
    getClientContacts: builder.query<ClientContact[], { clientId: string }>({
      query: () => "/client-contact/all-client-contacts",
      transformResponse: (contacts: ClientContact[], _meta, { clientId }) =>
        (contacts ?? []).filter((contact) => refId(contact.client) === clientId),
      providesTags: (response, _error, { clientId }) => [
        { type: tagTypes.clients, id: `CONTACTS-${clientId}` },
        ...(response ?? []).map(({ _id }) => ({ type: tagTypes.clients, id: `CONTACT-${_id}` })),
      ],
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

/**
 * Args the client dropdowns use. Sharing them means every caller hits one cache entry instead of
 * each fetching its own page of the same data.
 */
export const CLIENT_LOOKUP_ARGS = { limit: 100, sort: "name" } as const;

/**
 * Finds one client by id.
 *
 * The API has no single-client route, so this reads the cached lookup page rather than fetching.
 * That caps it at the first hundred clients — replace the whole hook with a real
 * `GET /client/single-client/:id` query as soon as the backend exposes one.
 */
export function useClientById(id: string) {
  return clientsApi.useGetClientsQuery(CLIENT_LOOKUP_ARGS, {
    selectFromResult: ({ data, isLoading, error }) => ({
      client: data?.result.find((candidate) => candidate._id === id),
      isLoading,
      error,
    }),
  });
}

export const {
  useGetClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetClientContactsQuery,
  useCreateClientContactMutation,
  useUpdateClientContactMutation,
  useDeleteClientContactMutation,
} = clientsApi;

import { baseApi } from "../baseApi";
import { listQuery, type GeoPoint, type ListParams, type Paginated, type Ref } from "../types";
import { tagTypes } from "../../tagTypes";
import type { Client } from "./clients.api";
import { isCurrentCompanyAdmin } from "@/lib/auth/isCompanyAdmin";

export const LOCATION_TYPES = ["Hotel", "School", "Hospital", "Office", "Other"] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export type Location = {
  _id: string;
  client: Ref<Client>;
  name: string;
  address: string;


  type?: string;
  
  other_type?: string;
  description?: string;
  is_active: boolean;
  location?: GeoPoint;
  
  total_room?: number;
  manager?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateLocationInput = {
  client: string;
  name: string;
  address: string;
  type?: string;
  description?: string;
  is_active?: boolean;
  location?: GeoPoint;
};

export type UpdateLocationInput = Partial<Omit<CreateLocationInput, "client">>;

export type LocationListParams = ListParams & {
  client?: string;
  manager?: string;
  isCompanyAdmin?: boolean;
};

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query<Paginated<Location>, LocationListParams | void>({
      query: (params) => {
        const isCompanyAdmin = isCurrentCompanyAdmin(params?.isCompanyAdmin);
        const query = listQuery(params ?? {});
        const clientParam = params?.client ? `&client=${encodeURIComponent(params.client)}` : "";
        const managerParam = params?.manager ? `&manager=${encodeURIComponent(params.manager)}` : "";
        return isCompanyAdmin
          ? `/location/company-admin/get-all-locations?${query}${clientParam}${managerParam}`
          : `/location/all-locations?${query}${clientParam}`;
      },
      providesTags: (response) => [
        { type: tagTypes.locations, id: "LIST" },
        ...(response?.result ?? []).map(({ _id }) => ({ type: tagTypes.locations, id: _id })),
      ],
    }),

    
    getClientLocations: builder.query<Paginated<Location>, { clientId: string; isCompanyAdmin?: boolean } & ListParams>({
      query: ({ clientId, isCompanyAdmin: override, ...params }) => {
        const isCompanyAdmin = isCurrentCompanyAdmin(override);
        return isCompanyAdmin
          ? `/location/company-admin/get-all-locations?client=${encodeURIComponent(clientId)}&${listQuery(params)}`
          : `/location/client-locations/${encodeURIComponent(clientId)}?${listQuery(params)}`;
      },
      providesTags: (response, _error, { clientId }) => [
        { type: tagTypes.locations, id: `CLIENT-${clientId}` },
        ...(response?.result ?? []).map(({ _id }) => ({ type: tagTypes.locations, id: _id })),
      ],
    }),

    getLocation: builder.query<Location, { id: string; isCompanyAdmin?: boolean } | string>({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const isCompanyAdmin = isCurrentCompanyAdmin(typeof arg === "object" ? arg.isCompanyAdmin : undefined);
        return isCompanyAdmin
          ? `/location/company-admin/get-single-location/${encodeURIComponent(id)}`
          : `/location/single-location/${encodeURIComponent(id)}`;
      },
      providesTags: (_response, _error, arg) => [
        { type: tagTypes.locations, id: typeof arg === "string" ? arg : arg.id },
      ],
    }),

    createLocation: builder.mutation<Location, CreateLocationInput>({
      query: (body) => ({ url: "/location/create-location", method: "POST", body }),
      invalidatesTags: (_result, _error, { client }) => [
        { type: tagTypes.locations, id: "LIST" },
        { type: tagTypes.locations, id: `CLIENT-${client}` },
      ],
    }),

    updateLocation: builder.mutation<Location, { id: string; body: UpdateLocationInput }>({
      query: ({ id, body }) => ({
        url: `/location/update-location/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: tagTypes.locations, id },
        { type: tagTypes.locations, id: "LIST" },
      ],
    }),

    
    deleteLocation: builder.mutation<Location, string>({
      query: (id) => ({ url: `/location/delete-location/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: tagTypes.locations, id },
        { type: tagTypes.locations, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useGetClientLocationsQuery,
  useGetLocationQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} = locationsApi;

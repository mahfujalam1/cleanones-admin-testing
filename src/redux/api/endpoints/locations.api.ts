import { baseApi } from "../baseApi";
import { listQuery, type GeoPoint, type ListParams, type Paginated, type Ref } from "../types";
import { tagTypes } from "../../tagTypes";
import type { Client } from "./clients.api";

export const LOCATION_TYPES = ["Hotel", "School", "Hospital", "Office", "Other"] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export type Location = {
  _id: string;
  client: Ref<Client>;
  name: string;
  address: string;
  /**
   * `type` IS validated by the API. Its enum is currently `'Hotel' | 'School' | 'Hospital' |
   * 'Other'` — "Office" is offered here by product decision but the API rejects it with an
   * invalid-enum error until it is added to the backend enum too. `description` is still not in
   * the documented create/update schemas, so a Zod schema that strips unknown keys drops it and
   * it reads back as undefined; persisting it needs the field added to the location model and
   * its validation.
   *
   * The country is not collected separately — the address picked from Google Places already
   * carries it.
   */
  type?: LocationType;
  /** Free-text type when `type` is `Other`. */
  other_type?: string;
  description?: string;
  is_active: boolean;
  location?: GeoPoint;
  /** Only the `client-locations` listing carries this. */
  total_room?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateLocationInput = {
  client: string;
  name: string;
  address: string;
  /** See the note on `Location` — not persisted until the API accepts these. */
  type?: LocationType;
  other_type?: string;
  description?: string;
  is_active?: boolean;
  location?: GeoPoint;
};

export type UpdateLocationInput = Partial<Omit<CreateLocationInput, "client">>;

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query<Paginated<Location>, ListParams | void>({
      query: (params) => `/location/all-locations?${listQuery(params ?? {})}`,
      providesTags: (response) => [
        { type: tagTypes.locations, id: "LIST" },
        ...(response?.result ?? []).map(({ _id }) => ({ type: tagTypes.locations, id: _id })),
      ],
    }),

    /** A single client's locations, each carrying its room count. */
    getClientLocations: builder.query<Paginated<Location>, { clientId: string } & ListParams>({
      query: ({ clientId, ...params }) =>
        `/location/client-locations/${encodeURIComponent(clientId)}?${listQuery(params)}`,
      providesTags: (response, _error, { clientId }) => [
        { type: tagTypes.locations, id: `CLIENT-${clientId}` },
        ...(response?.result ?? []).map(({ _id }) => ({ type: tagTypes.locations, id: _id })),
      ],
    }),

    getLocation: builder.query<Location, string>({
      query: (id) => `/location/single-location/${encodeURIComponent(id)}`,
      providesTags: (_response, _error, id) => [{ type: tagTypes.locations, id }],
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

    /** Deactivates the location. Child rooms and tasks are left as they are. */
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

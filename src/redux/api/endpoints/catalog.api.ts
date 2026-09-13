import { baseApi } from "../baseApi";
import { type Paginated, refId } from "../types";
import { tagTypes } from "../../tagTypes";
import type { Location } from "./locations.api";
import type { Room } from "./rooms.api";

// The backend exposes rooms per location. Walk every page so global filters never
// silently omit records beyond the first API page.
export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocationCatalog: builder.query<Location[], void>({
      async queryFn(_arg, _api, _options, fetch) {
        const locations: Location[] = [];
        for (let page = 1; ; page++) {
          const response = await fetch(`/location/all-locations?page=${page}&limit=100&sort=name`);
          if (response.error) return { error: response.error };
          const data = response.data as Paginated<Location>;
          locations.push(...data.result);
          if (!data.result.length || locations.length >= data.meta.total) break;
        }
        return { data: locations };
      },
      // Walking every page is expensive; hold the result well past the app-wide default.
      keepUnusedDataFor: 900,
      providesTags: (locations) => [
        { type: tagTypes.locations, id: 'LIST' },
        ...(locations ?? []).map(({ _id }) => ({ type: tagTypes.locations, id: _id })),
      ],
    }),
    getRoomCatalog: builder.query<Room[], { clientId?: string; locationId?: string }>({
      async queryFn({ clientId, locationId }, _api, _options, fetch) {
        let locations: Location[] = [];
        if (locationId) {
          const response = await fetch(`/location/single-location/${encodeURIComponent(locationId)}`);
          if (response.error) return { error: response.error };
          locations = [response.data as Location];
        } else {
          for (let page = 1; ; page++) {
            const path = clientId ? `/location/client-locations/${encodeURIComponent(clientId)}` : "/location/all-locations";
            const response = await fetch(`${path}?page=${page}&limit=100&sort=name`);
            if (response.error) return { error: response.error };
            const data = response.data as Paginated<Location>;
            locations.push(...data.result);
            if (!data.result.length || locations.length >= data.meta.total) break;
          }
        }
        const rooms: Room[] = [];
        for (const location of locations) {
          if (clientId && refId(location.client) !== clientId) continue;
          let loaded = 0;
          for (let page = 1; ; page++) {
            const response = await fetch(`/room/all-rooms/${encodeURIComponent(location._id)}?page=${page}&limit=100&sort=name`);
            if (response.error) return { error: response.error };
            const data = response.data as Paginated<Room>;
            rooms.push(...data.result.map((room) => ({ ...room, location })));
            loaded += data.result.length;
            if (!data.result.length || loaded >= data.meta.total) break;
          }
        }
        return { data: rooms };
      },
      keepUnusedDataFor: 900,
      providesTags: (rooms, _error, { locationId }) => [
        { type: tagTypes.locations, id: 'LIST' },
        { type: tagTypes.rooms, id: 'CATALOG' },
        ...(locationId ? [{ type: tagTypes.locations, id: locationId }, { type: tagTypes.rooms, id: `LOCATION-${locationId}` }] : []),
        ...(rooms ?? []).flatMap((room) => [
          { type: tagTypes.rooms, id: room._id },
          { type: tagTypes.tasks, id: `ROOM-${room._id}` },
          { type: tagTypes.locations, id: refId(room.location) },
          { type: tagTypes.rooms, id: `LOCATION-${refId(room.location)}` },
        ]),
      ],
    }),
  }),
});

export const { useGetLocationCatalogQuery, useGetRoomCatalogQuery } = catalogApi;

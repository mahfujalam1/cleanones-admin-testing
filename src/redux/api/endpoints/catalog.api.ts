import { baseApi } from "../baseApi";
import { type Paginated, refId } from "../types";
import { tagTypes } from "../../tagTypes";
import type { Location } from "./locations.api";
import type { Room } from "./rooms.api";



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
      
      keepUnusedDataFor: 900,
      providesTags: (locations) => [
        { type: tagTypes.locations, id: 'LIST' },
        ...(locations ?? []).map(({ _id }) => ({ type: tagTypes.locations, id: _id })),
      ],
    }),
    getRoomCatalog: builder.query<Room[], { clientId?: string; locationId?: string }>({
      async queryFn({ clientId, locationId }, _api, _options, fetch) {
        if (locationId) {
          let location: Location | undefined;
          const locRes = await fetch(`/location/single-location/${encodeURIComponent(locationId)}`);
          if (!locRes.error && locRes.data) {
            location = locRes.data as Location;
          }
          const rooms: Room[] = [];
          let loaded = 0;
          for (let page = 1; ; page++) {
            const response = await fetch(`/room/all-rooms/${encodeURIComponent(locationId)}?page=${page}&limit=100&sort=name`);
            if (response.error) return { error: response.error };
            const data = response.data as Paginated<Room>;
            rooms.push(...data.result.map((room) => ({ ...room, location: location ?? room.location })));
            loaded += data.result.length;
            if (!data.result.length || loaded >= data.meta.total) break;
          }
          return { data: rooms };
        }

        
        const locCatalogRes = await fetch(`/location/all-locations?page=1&limit=100&sort=name`);
        if (locCatalogRes.error) return { error: locCatalogRes.error };
        const locData = locCatalogRes.data as Paginated<Location>;
        let targetLocations = locData.result || [];

        if (clientId) {
          targetLocations = targetLocations.filter((l) => refId(l.client) === clientId);
        }

        const roomResponses = await Promise.all(
          targetLocations.map(async (loc) => {
            const res = await fetch(`/room/all-rooms/${encodeURIComponent(loc._id)}?page=1&limit=100&sort=name`);
            if (res.error || !res.data) return [];
            const d = res.data as Paginated<Room>;
            return (d.result || []).map((r) => ({ ...r, location: loc }));
          })
        );

        return { data: roomResponses.flat() };
      },
      keepUnusedDataFor: 1800,
      providesTags: (_rooms, _error, { locationId }) => [
        ...(locationId ? [{ type: tagTypes.rooms, id: `LOCATION-${locationId}` }] : [{ type: tagTypes.rooms, id: "LIST" }]),
      ],
    }),
  }),
});

export const { useGetLocationCatalogQuery, useGetRoomCatalogQuery } = catalogApi;

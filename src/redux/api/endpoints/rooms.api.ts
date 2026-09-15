import { baseApi } from "../baseApi";
import { catalogApi } from "./catalog.api";
import { listQuery, type ListParams, type Paginated, type Ref } from "../types";
import { tagTypes } from "../../tagTypes";
import type { Location } from "./locations.api";

/**
 * Room types offered in the form. `room_type` is a free-text field on the API, so this list only
 * steers the UI — adding an entry here needs no backend change.
 */
export const ROOM_TYPES = [
  "Workshop",
  "Storage",
  "Restaurant",
  "Pantry",
  "Waiting room",
  "Hall",
  "Open-plan office",
  "Classroom",
  "Toilet",
  "Meeting room",
  "Entrance",
  "Treatment room",
  "Hotel room",
  "Reception desk",
  "Toilet block",
  "Swimming pool",
  "Gym",
  "Sauna",
  "Lab",
] as const;

export const CLEANING_TYPES = ["Standard", "Deep Clean", "Regular", "Disinfection", "Custom"] as const;
export type CleaningType = (typeof CLEANING_TYPES)[number];
export const PLAN_TYPES = CLEANING_TYPES;
export type PlanType = CleaningType;
export const CLEANING_PLAN = CLEANING_TYPES;

export type RoomTask = {
  _id: string;
  room?: string;
  name: string;
  frequency_type?: string;
  is_photo_required?: boolean;
  photo_requirements?: Array<{ title?: string; photo_url?: string; is_uploaded?: boolean }>;
  duration_minutes?: number;
  days_of_week?: string[];
  days_of_month?: number[];
  is_active?: boolean;
};

export type Room = {
  _id: string;
  location: Ref<Location>;
  name: string;
  room_type: string;
  cleaning_type?: CleaningType;
  /** Accepted by the API but not collected by the form. */
  floor?: number;
  is_active: boolean;
  tasks?: RoomTask[];
  /**
   * Task count the listing aggregation attaches. The API is inconsistent about the plural
   * elsewhere, so read it through `roomTaskCount()` rather than either field directly.
   */
  total_task?: number;
  total_tasks?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateRoomInput = {
  location: string;
  name: string;
  room_type: string;
  cleaning_type?: CleaningType;
  floor?: number;
  is_active?: boolean;
};

export type UpdateRoomInput = Partial<Omit<CreateRoomInput, "location">>;

/** Tasks in a room, whichever spelling the endpoint used. Null when the count was not sent. */
export function roomTaskCount(room: Pick<Room, "total_task" | "total_tasks">): number | null {
  return room.total_task ?? room.total_tasks ?? null;
}

export const roomsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Rooms are only listed per location — the API has no global room feed, so a location must be
     * chosen before this can run. Callers pass `skip` until they have one.
     */
    getRooms: builder.query<Paginated<Room>, { locationId: string } & ListParams>({
      query: ({ locationId, ...params }) =>
        `/room/all-rooms/${encodeURIComponent(locationId)}?${listQuery(params)}`,
      providesTags: (response, _error, { locationId }) => [
        { type: tagTypes.rooms, id: `LOCATION-${locationId}` },
        ...(response?.result ?? []).map(({ _id }) => ({ type: tagTypes.rooms, id: _id })),
      ],
    }),

    getRoom: builder.query<Room, string>({
      query: (id) => `/room/single-room/${encodeURIComponent(id)}`,
      providesTags: (_response, _error, id) => [{ type: tagTypes.rooms, id }],
    }),

    createRoom: builder.mutation<Room, CreateRoomInput>({
      query: (body) => ({ url: "/room/create-room", method: "POST", body }),
      async onQueryStarted({ location }, { dispatch, queryFulfilled }) {
        try {
          const { data: newRoom } = await queryFulfilled;
          dispatch(
            catalogApi.util.updateQueryData(
              "getRoomCatalog",
              { clientId: undefined, locationId: undefined },
              (draft) => {
                if (Array.isArray(draft)) {
                  draft.unshift(newRoom);
                }
              }
            )
          );
          if (location) {
            dispatch(
              catalogApi.util.updateQueryData(
                "getRoomCatalog",
                { clientId: undefined, locationId: location },
                (draft) => {
                  if (Array.isArray(draft)) {
                    draft.unshift(newRoom);
                  }
                }
              )
            );
          }
        } catch {}
      },
      // The optimistic patch above only reaches the room catalog. Without these tags the
      // location's own room list (and its count) stayed stale until a full page reload.
      invalidatesTags: (_result, _error, { location }) => [
        { type: tagTypes.rooms, id: `LOCATION-${location}` },
        // The catalog falls back to this tag whenever it is not scoped to one location,
        // which is what the client-scoped "all locations" room list uses.
        { type: tagTypes.rooms, id: "LIST" },
        { type: tagTypes.locations, id: location },
      ],
    }),

    updateRoom: builder.mutation<Room, { id: string; locationId: string; body: UpdateRoomInput }>({
      query: ({ id, body }) => ({
        url: `/room/update-room/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id, locationId }) => [
        { type: tagTypes.rooms, id },
        { type: tagTypes.rooms, id: `LOCATION-${locationId}` },
      ],
    }),

    /** Deactivates the room. Child tasks are left as they are. */
    deleteRoom: builder.mutation<Room, { id: string; locationId: string }>({
      query: ({ id }) => ({ url: `/room/delete-room/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { id, locationId }) => [
        { type: tagTypes.rooms, id },
        { type: tagTypes.rooms, id: `LOCATION-${locationId}` },
        { type: tagTypes.locations, id: locationId },
      ],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomsApi;

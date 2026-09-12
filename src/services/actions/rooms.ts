import { authenticated } from "./auth";

export type RoomTaskInput = {
  id?: string;
  name: string;
  frequency_type: string;
  is_photo_req?: boolean;
  // `duration` is the per-task minutes value used locally in the Add Room form (summed into the
  // room's total duration); the backend's field name for it is `duration_minutes`.
  duration?: number;
  duration_minutes?: number;
  photo?: Array<{ id?: string; name: string }>;
  // Backend field names (manager-room.validation.ts's cleaningTaskUnsetSchema) — must be exactly
  // these, not `weekly_days`/`monthly_dates`/`dates_of_month`, which the backend's zod schema
  // silently strips as unrecognized keys.
  days_of_week?: string[];
  days_of_month?: number[];
};

export type RoomInput = {
  room_name: string;
  room_type: string;
  clean_type: string;
  floor?: number;
  duration: number;
  monthly_cleaning_frequency: number;
  tasks: RoomTaskInput[];
};

export type RoomDetails = {
  clean_type: string;
  client_id: string;
  company_name: string;
  created_at: string;
  duration: number;
  floor: number;
  id: string;
  location_id: string;
  location_name: string;
  monthly_cleaning_frequency: number;
  photo_number: number;
  required_photos: Array<{ frequency_type: string; id: string; name: string }>;
  room_name: string;
  room_type: string;
  task_number: number;
  tasks: Array<RoomTaskInput & { id: string; total_photos_required?: number }>;
  total_photos_required: number;
  updated_at: string;
};

export type RoomGridItem = {
  room_id: string;
  room_name: string;
  room_type: string;
  client_id: string;
  company_name: string;
  location_id: string;
  location_name: string;
  duration: number;
  monthly_cleaning_frequency: number;
  photo_number: number;
  total_photos_required: number;
  task_number: number;
  clean_type: string;
  updated_at: string;
};

const json = (value: unknown) => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(value),
});

export async function getRoomLocations(clientId?: string) {
  return authenticated<{ locations: Array<{ id: string; name: string; total_rooms: number }> }>(
    `/manager/dropdowns/locations${clientId ? `?client_id=${encodeURIComponent(clientId)}` : ""}`,
    { method: "GET" }
  );
}

export async function createRoom(locationId: string, input: RoomInput) {
  return authenticated<RoomDetails>(`/manager/locations/${encodeURIComponent(locationId)}/rooms`, {
    method: "POST",
    ...json(input),
  });
}

export async function getRoom(roomId: string) {
  return authenticated<RoomDetails>(`/manager/rooms/${encodeURIComponent(roomId)}`, {
    method: "GET",
  });
}

export async function updateRoom(roomId: string, input: Partial<RoomInput>) {
  return authenticated<RoomDetails>(`/manager/rooms/${encodeURIComponent(roomId)}`, {
    method: "PATCH",
    ...json(input),
  });
}

export async function deleteRoom(roomId: string) {
  return authenticated<string>(`/manager/rooms/${encodeURIComponent(roomId)}`, {
    method: "DELETE",
  });
}

export async function getRooms(
  input: {
    page?: number;
    limit?: number;
    search?: string;
    roomId?: string;
    locationId?: string;
    clientId?: string;
  } = {}
) {
  const query = new URLSearchParams({
    page: String(input.page ?? 1),
    limit: String(input.limit ?? 100),
  });
  if (input.search) query.set("search", input.search);
  if (input.roomId) query.set("room_id", input.roomId);
  if (input.locationId) query.set("location_id", input.locationId);
  if (input.clientId) query.set("client_id", input.clientId);
  return authenticated<{
    total_count: number;
    page: number;
    limit: number;
    has_more: boolean;
    rooms: RoomGridItem[];
  }>(`/manager/rooms?${query}`, { method: "GET" });
}


"use client";

import { SelectField } from "@/components/shared/Field";
import { clientCompanyLabel, clientLabel, CLIENT_LOOKUP_ARGS, useGetClientsQuery } from "@/redux/api/endpoints/clients.api";
import { useGetClientLocationsQuery, useGetLocationsQuery } from "@/redux/api/endpoints/locations.api";
import { useGetRoomsQuery } from "@/redux/api/endpoints/rooms.api";

/**
 * Dropdowns for the parent a record hangs off.
 *
 * The API exposes rooms only under a location and tasks only under a room, so those screens
 * cannot show anything until a parent is chosen — these are how it gets chosen. Each fetches a
 * single generous page rather than paging inside a `<select>`; the shared cache means the list
 * is usually already warm by the time a picker mounts.
 */
const PICKER_LIMIT = 100;

export function ClientPicker({
  value,
  onChange,
  required,
  showCompanyName = false,
}: {
  value: string;
  onChange: (clientId: string) => void;
  required?: boolean;
  showCompanyName?: boolean;
}) {
  const { data, isFetching } = useGetClientsQuery(CLIENT_LOOKUP_ARGS);
  const clients = data?.result ?? [];
  const labelOf = showCompanyName ? clientCompanyLabel : clientLabel;

  return (
    <SelectField
      label="Client"
      value={value}
      required={required}
      disabled={isFetching && clients.length === 0}
      placeholder={isFetching && clients.length === 0 ? "Loading clients…" : "Select a client"}
      options={clients.map((client) => ({ value: client._id, label: labelOf(client) }))}
      onChange={onChange}
    />
  );
}

export function LocationPicker({
  value,
  onChange,
  label = "Location",
}: {
  value: string;
  onChange: (locationId: string) => void;
  label?: string;
}) {
  const { data, isFetching } = useGetLocationsQuery({ limit: PICKER_LIMIT, sort: "name" });
  const locations = data?.result ?? [];

  return (
    <SelectField
      label={label}
      value={value}
      disabled={isFetching && locations.length === 0}
      placeholder={isFetching && locations.length === 0 ? "Loading locations…" : "Select a location"}
      options={locations.map((location) => ({ value: location._id, label: location.name }))}
      onChange={onChange}
    />
  );
}

/** Locations belonging to one client — the second step when creating a room from scratch. */
export function ClientLocationPicker({
  clientId,
  value,
  onChange,
  label = "Location",
  required,
}: {
  clientId: string;
  value: string;
  onChange: (locationId: string) => void;
  label?: string;
  required?: boolean;
}) {
  const { data, isFetching } = useGetClientLocationsQuery(
    { clientId, limit: PICKER_LIMIT, sort: "name" },
    { skip: !clientId },
  );
  const locations = data?.result ?? [];

  const placeholder = !clientId
    ? "Select a client first"
    : isFetching && locations.length === 0
      ? "Loading locations…"
      : locations.length === 0
        ? "This client has no locations"
        : "Select a location";

  return (
    <SelectField
      label={label}
      value={value}
      required={required}
      disabled={!clientId || locations.length === 0}
      placeholder={placeholder}
      options={locations.map((location) => ({ value: location._id, label: location.name }))}
      onChange={onChange}
    />
  );
}

export function RoomPicker({
  locationId,
  value,
  onChange,
  label = "Room",
}: {
  locationId: string;
  value: string;
  onChange: (roomId: string) => void;
  label?: string;
}) {
  const { data, isFetching } = useGetRoomsQuery(
    { locationId, limit: PICKER_LIMIT, sort: "name" },
    { skip: !locationId },
  );
  const rooms = data?.result ?? [];

  const placeholder = !locationId
    ? "Select a location first"
    : isFetching && rooms.length === 0
      ? "Loading rooms…"
      : "Select a room";

  return (
    <SelectField
      label={label}
      value={value}
      disabled={!locationId || (isFetching && rooms.length === 0)}
      placeholder={placeholder}
      options={rooms.map((room) => ({ value: room._id, label: room.name }))}
      onChange={onChange}
    />
  );
}

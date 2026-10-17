"use client";

import { SelectField } from "@/components/shared/Field";
import { clientCompanyLabel, clientLabel, CLIENT_LOOKUP_ARGS, useGetClientsQuery } from "@/redux/api/endpoints/clients.api";
import { useGetClientLocationsQuery, useGetLocationsQuery } from "@/redux/api/endpoints/locations.api";
import { useGetRoomsQuery } from "@/redux/api/endpoints/rooms.api";
import { ClientSearchSelect } from "@/components/shared/ClientSearchSelect";

const PICKER_LIMIT = 100;

export function ClientPicker({
  value,
  onChange,
  required,
  showCompanyName = false,
  label = "Client",
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (clientId: string) => void;
  required?: boolean;
  showCompanyName?: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <ClientSearchSelect
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      showCompanyName={showCompanyName}
      placeholder={placeholder}
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


export function ClientLocationPicker({
  clientId,
  value,
  onChange,
  label = "Location",
  required,
  selectPlaceholder,
  noClientPlaceholder,
  noLocationsPlaceholder,
}: {
  clientId: string;
  value: string;
  onChange: (locationId: string) => void;
  label?: string;
  required?: boolean;
  selectPlaceholder?: string;
  noClientPlaceholder?: string;
  noLocationsPlaceholder?: string;
}) {
  const { data, isFetching } = useGetClientLocationsQuery(
    { clientId, limit: PICKER_LIMIT, sort: "name" },
    { skip: !clientId },
  );
  const locations = data?.result ?? [];

  const placeholder = !clientId
    ? (noClientPlaceholder ?? "Select a client first")
    : isFetching && locations.length === 0
      ? "Loading locations…"
      : locations.length === 0
        ? (noLocationsPlaceholder ?? "This client has no locations")
        : (selectPlaceholder ?? "Select a location");

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

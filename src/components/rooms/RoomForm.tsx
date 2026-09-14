"use client";

import { useMemo, useState, useEffect } from "react";
import { FormModal } from "@/components/shared/FormModal";
import { SelectField, TextField } from "@/components/shared/Field";
import { apiError } from "@/redux/api/apiError";
import {
  clientLabel,
  CLIENT_LOOKUP_ARGS,
  useGetClientsQuery,
} from "@/redux/api/endpoints/clients.api";
import { useGetLocationCatalogQuery } from "@/redux/api/endpoints/catalog.api";
import {
  CLEANING_TYPES,
  ROOM_TYPES,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  type PlanType,
  type Room,
} from "@/redux/api/endpoints/rooms.api";
import { refId, refDoc } from "@/redux/api/types";

export function RoomForm({
  locationId,
  room,
  onClose,
}: {
  locationId?: string;
  room?: Room;
  onClose: () => void;
}) {
  const isEdit = room !== undefined;

  const { data: clientsData } = useGetClientsQuery(CLIENT_LOOKUP_ARGS);
  const { data: allLocations = [] } = useGetLocationCatalogQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const [name, setName] = useState(room?.name ?? "");
  const [roomType, setRoomType] = useState(room?.room_type ?? "");
  const [cleaningType, setCleaningType] = useState<PlanType | "">(room?.cleaning_type ?? "");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState(
    locationId || (room ? refId(room.location) : "")
  );
  const [error, setError] = useState("");

  // Initialize Client and Location when locations load or when editing
  useEffect(() => {
    if (allLocations.length === 0) return;
    const targetLocId = selectedLocationId || locationId || (room ? refId(room.location) : "");
    if (targetLocId) {
      const loc = allLocations.find((l) => l._id === targetLocId);
      if (loc) {
        setSelectedLocationId(loc._id);
        const cId = refId(loc.client);
        if (cId && !selectedClientId) {
          setSelectedClientId(cId);
        }
      }
    }
  }, [allLocations, locationId, room]);

  const handleClientChange = (cId: string) => {
    setSelectedClientId(cId);
    setSelectedLocationId("");
  };

  const clientLocations = useMemo(() => {
    if (!selectedClientId) return [];
    return allLocations.filter((loc) => refId(loc.client) === selectedClientId);
  }, [allLocations, selectedClientId]);

  const clientOptions = useMemo(() => {
    return (clientsData?.result ?? []).map((client) => ({
      value: client._id,
      label: clientLabel(client),
    }));
  }, [clientsData]);

  const locationOptions = useMemo(() => {
    return clientLocations.map((loc) => ({
      value: loc._id,
      label: loc.name,
    }));
  }, [clientLocations]);

  const [createRoom, { isLoading: creating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: updating }] = useUpdateRoomMutation();

  const submit = async () => {
    if (!selectedClientId) {
      setError("Please select a client.");
      return;
    }
    if (!selectedLocationId) {
      setError("Please select a location.");
      return;
    }
    if (!name.trim()) {
      setError("Room Name is required.");
      return;
    }
    if (!roomType) {
      setError("Pick a room type.");
      return;
    }
    if (!cleaningType) {
      setError("Pick a cleaning type.");
      return;
    }

    const body = {
      name: name.trim(),
      room_type: roomType,
      cleaning_type: cleaningType,
      is_active: true,
    };

    try {
      if (isEdit) {
        await updateRoom({ id: room._id, locationId: selectedLocationId, body }).unwrap();
      } else {
        await createRoom({ ...body, location: selectedLocationId }).unwrap();
      }
      onClose();
    } catch (cause) {
      setError(apiError(cause));
    }
  };

  return (
    <FormModal
      title={isEdit ? "Edit Room" : "Add Room"}
      subtitle={locationOptions.find((l) => l.value === selectedLocationId)?.label}
      submitLabel={isEdit ? "Save Changes" : "Add Room"}
      saving={creating || updating}
      error={error}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Client"
          value={selectedClientId}
          options={clientOptions}
          onChange={handleClientChange}
          required
          placeholder="Select Client"
        />

        <SelectField
          label="Location"
          value={selectedLocationId}
          options={locationOptions}
          onChange={setSelectedLocationId}
          required
          placeholder={selectedClientId ? "Select Location" : "Select Client first"}
        />
      </div>

      <TextField
        label="Room Name"
        placeholder="Enter Room Name"
        value={name}
        onChange={setName}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Room Type"
          value={roomType}
          options={ROOM_TYPES}
          onChange={setRoomType}
          required
          placeholder="Select Room Type"
        />
        <SelectField
          label="Cleaning Type"
          value={cleaningType}
          options={CLEANING_TYPES}
          onChange={setCleaningType}
          required
          placeholder="Select Cleaning Type"
        />
      </div>
    </FormModal>
  );
}

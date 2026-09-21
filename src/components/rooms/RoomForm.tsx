"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FormModal } from "@/components/shared/FormModal";
import { SelectField, TextField } from "@/components/shared/Field";
import { apiError } from "@/redux/api/apiError";
import {
  clientCompanyLabel,
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
import { getLocale } from "@/lib/locale";
import { getScreenCopy } from "@/lib/screen-copy";

export function RoomForm({
  clientId,
  locationId,
  lockScope = false,
  room,
  onClose,
}: {
  
  clientId?: string;
  locationId?: string;


  lockScope?: boolean;
  room?: Room;
  onClose: () => void;
}) {
  const copy = getScreenCopy(getLocale(usePathname()));
  const isEdit = room !== undefined;

  const { data: clientsData } = useGetClientsQuery(CLIENT_LOOKUP_ARGS);
  const { data: allLocations = [] } = useGetLocationCatalogQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const [name, setName] = useState(room?.name ?? "");
  const knownRoomType = ROOM_TYPES.includes((room?.room_type ?? "") as (typeof ROOM_TYPES)[number]);
  const [roomType, setRoomType] = useState(
    knownRoomType ? room?.room_type ?? "" : room?.room_type ? "Custom" : "",
  );
  const [customRoomType, setCustomRoomType] = useState(
    knownRoomType || !room?.room_type ? "" : room.room_type,
  );
  const [cleaningType, setCleaningType] = useState<PlanType | "">(
    CLEANING_TYPES.includes((room?.cleaning_type ?? "") as PlanType)
      ? (room?.cleaning_type as PlanType)
      : room?.cleaning_type
        ? "Custom"
        : "",
  );
  const [customCleaningType, setCustomCleaningType] = useState(
    CLEANING_TYPES.includes((room?.cleaning_type ?? "") as PlanType) || !room?.cleaning_type
      ? ""
      : room.cleaning_type,
  );
  const [selectedClientId, setSelectedClientId] = useState(clientId ?? "");
  const [selectedLocationId, setSelectedLocationId] = useState(
    locationId || (room ? refId(room.location) : "")
  );
  const [error, setError] = useState("");

  
  
  useEffect(() => {
    if (clientId || allLocations.length === 0) return;
    const targetLocId = locationId || (room ? refId(room.location) : "");
    if (!targetLocId) return;
    const loc = allLocations.find((candidate) => candidate._id === targetLocId);
    const cId = loc ? refId(loc.client) : "";
    if (cId) setSelectedClientId((current) => current || cId);
  }, [allLocations, clientId, locationId, room]);

  const handleClientChange = (cId: string) => {
    if (lockScope) return;
    setSelectedClientId(cId);
    setSelectedLocationId("");
  };

  const clientLocations = useMemo(() => {
    if (!selectedClientId) return [];
    return allLocations.filter((loc) => refId(loc.client) === selectedClientId);
  }, [allLocations, selectedClientId]);

  
  const selectedLocation = useMemo(
    () => allLocations.find((loc) => loc._id === selectedLocationId),
    [allLocations, selectedLocationId],
  );

  const clientOptions = useMemo(() => {
    const options = (clientsData?.result ?? []).map((client) => ({
      value: client._id,
      label: clientCompanyLabel(client),
    }));
    
    
    if (selectedClientId && !options.some((option) => option.value === selectedClientId)) {
      const populated = selectedLocation ? refDoc(selectedLocation.client) : null;
      options.push({
        value: selectedClientId,
        label: populated ? clientCompanyLabel(populated) : "Current company",
      });
    }
    return options;
  }, [clientsData, selectedClientId, selectedLocation]);

  const locationOptions = useMemo(() => {
    const options = clientLocations.map((loc) => ({
      value: loc._id,
      label: loc.name,
    }));
    
    
    if (selectedLocationId && !options.some((option) => option.value === selectedLocationId)) {
      options.push({
        value: selectedLocationId,
        label: selectedLocation?.name ?? "Current location",
      });
    }
    return options;
  }, [clientLocations, selectedLocationId, selectedLocation]);

  const [createRoom, { isLoading: creating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: updating }] = useUpdateRoomMutation();

  const submit = async () => {
    if (!selectedClientId) {
      setError("Please select a company.");
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
    if (roomType === "Custom" && !customRoomType.trim()) {
      setError("Specify the room type.");
      return;
    }
    if (!cleaningType) {
      setError("Pick a cleaning type.");
      return;
    }
    if (cleaningType === "Custom" && !customCleaningType.trim()) {
      setError("Specify the cleaning type.");
      return;
    }

    const body = {
      name: name.trim(),
      room_type: roomType === "Custom" ? customRoomType.trim() : roomType,
      cleaning_type: cleaningType === "Custom" ? customCleaningType.trim() : cleaningType,
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
      title={isEdit ? copy.editRoom : copy.addRoom}
      subtitle={locationOptions.find((l) => l.value === selectedLocationId)?.label}
      submitLabel={isEdit ? copy.saveChanges : copy.addRoom}
      saving={creating || updating}
      error={error}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={copy.companyName}
          value={selectedClientId}
          options={clientOptions}
          onChange={handleClientChange}
          required
          disabled={lockScope}
          placeholder={copy.selectCompany}
        />

        <SelectField
          label={copy.location}
          value={selectedLocationId}
          options={locationOptions}
          onChange={setSelectedLocationId}
          required
          disabled={lockScope}
          placeholder={selectedClientId ? copy.selectLocation : copy.selectCompanyFirst}
        />
      </div>

      <TextField
        label={copy.roomName}
        placeholder={copy.enterRoomName}
        value={name}
        onChange={setName}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={copy.roomType}
          value={roomType}
          options={ROOM_TYPES}
          onChange={(value) => {
            setRoomType(value);
            if (value !== "Custom") setCustomRoomType("");
            setError("");
          }}
          required
          placeholder={copy.selectRoomType}
        />
        <SelectField
          label={copy.cleaningType}
          value={cleaningType}
          options={CLEANING_TYPES}
          onChange={(value) => {
            setCleaningType(value);
            if (value !== "Custom") setCustomCleaningType("");
            setError("");
          }}
          required
          placeholder={copy.selectCleaningType}
        />
      </div>

      {roomType === "Custom" && (
        <TextField
          label="Specify room type"
          value={customRoomType}
          onChange={(value) => {
            setCustomRoomType(value);
            setError("");
          }}
          placeholder="e.g. Changing room, Kitchen"
          required
        />
      )}

      {cleaningType === "Custom" && (
        <TextField
          label="Specify cleaning type"
          value={customCleaningType}
          onChange={(value) => {
            setCustomCleaningType(value);
            setError("");
          }}
          placeholder="e.g. Post-construction, Biohazard"
          required
        />
      )}
    </FormModal>
  );
}

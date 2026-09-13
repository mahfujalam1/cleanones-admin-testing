"use client";

import { useState } from "react";
import { FormModal } from "@/components/shared/FormModal";
import { CheckboxField, SelectField, TextField } from "@/components/shared/Field";
import { ClientLocationPicker, ClientPicker } from "@/components/shared/Pickers";
import { apiError } from "@/redux/api/apiError";
import { useGetLocationQuery } from "@/redux/api/endpoints/locations.api";
import {
  CLEANING_TYPES,
  ROOM_TYPES,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  type CleaningType,
  type Room,
} from "@/redux/api/endpoints/rooms.api";

export function RoomForm({
  locationId,
  room,
  onClose,
}: {
  /**
   * Fixes the owning location, for when the form opens from inside one. Left out — adding from
   * the rooms page — the client and location are chosen in the form itself.
   */
  locationId?: string;
  room?: Room;
  onClose: () => void;
}) {
  const isEdit = room !== undefined;
  const picksLocation = !isEdit && !locationId;
  const [chosenClient, setChosenClient] = useState("");
  const [chosenLocation, setChosenLocation] = useState("");
  const targetLocation = locationId || chosenLocation;

  const [name, setName] = useState(room?.name ?? "");
  const [roomType, setRoomType] = useState(room?.room_type ?? "");
  const [planType, setPlanType] = useState<CleaningType | "">(room?.cleaning_type ?? "");
  const [isActive, setIsActive] = useState(room?.is_active ?? true);
  const [error, setError] = useState("");

  // Only for the header, so the user can see which location they are adding to.
  const { data: location } = useGetLocationQuery(targetLocation, { skip: !targetLocation });

  const [createRoom, { isLoading: creating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: updating }] = useUpdateRoomMutation();

  const submit = async () => {
    if (!targetLocation) {
      setError("Pick a client and location first.");
      return;
    }
    if (!roomType) {
      setError("Pick a room type.");
      return;
    }

    const body = {
      name: name.trim(),
      room_type: roomType,
      cleaning_type: planType || undefined,
      is_active: isActive,
    };

    try {
      if (isEdit) {
        await updateRoom({ id: room._id, locationId: targetLocation, body }).unwrap();
      } else {
        await createRoom({ ...body, location: targetLocation }).unwrap();
      }
      onClose();
    } catch (cause) {
      setError(apiError(cause));
    }
  };

  return (
    <FormModal
      title={isEdit ? "Edit room" : "Add room"}
      subtitle={location?.name}
      submitLabel={isEdit ? "Save changes" : "Add room"}
      saving={creating || updating}
      error={error}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      {picksLocation && (
        <div className="grid gap-4 sm:grid-cols-2">
          <ClientPicker
            value={chosenClient}
            onChange={(value) => {
              setChosenClient(value);
              // The previous location belongs to the previous client, so it cannot carry over.
              setChosenLocation("");
              setError("");
            }}
            required
          />
          <ClientLocationPicker
            clientId={chosenClient}
            value={chosenLocation}
            onChange={(value) => {
              setChosenLocation(value);
              setError("");
            }}
            required
          />
        </div>
      )}

      <TextField label="Room name" value={name} onChange={setName} required />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Room type"
          value={roomType}
          options={ROOM_TYPES}
          onChange={setRoomType}
          required
          placeholder="Select room type"
        />
        <SelectField
          label="Cleaning type"
          value={planType}
          options={CLEANING_TYPES}
          onChange={setPlanType}
          placeholder="Select cleaning type"
        />
      </div>

      <CheckboxField label="Active" checked={isActive} onChange={setIsActive} />
    </FormModal>
  );
}

"use client";

import { useId, useState } from "react";
import { MdMyLocation } from "react-icons/md";
import { FormModal } from "@/components/shared/FormModal";
import {
  CheckboxField,
  CONTROL_CLASS,
  FieldLabel,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/shared/Field";
import { AddressAutocompleteInput } from "./AddressAutocompleteInput";
import { ClientPicker } from "@/components/shared/Pickers";
import { apiError } from "@/redux/api/apiError";
import {
  LOCATION_TYPES,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  type Location,
  type LocationType,
} from "@/redux/api/endpoints/locations.api";
import type { GeoPoint } from "@/redux/api/types";

/** What the form holds while the user is picking: plain latitude/longitude, map order. */
type Pin = { latitude: number; longitude: number };

/** GeoJSON stores `[longitude, latitude]`, the reverse of how a map is usually read. */
const toGeoPoint = (pin: Pin | null): GeoPoint | undefined =>
  pin ? { type: "Point", coordinates: [pin.longitude, pin.latitude] } : undefined;

const fromGeoPoint = (point?: GeoPoint): Pin | null => {
  const [longitude, latitude] = point?.coordinates ?? [];
  return typeof latitude === "number" && typeof longitude === "number" ? { latitude, longitude } : null;
};

export function LocationForm({
  clientId,
  location,
  onClose,
}: {
  /**
   * Fixes the owning client, for when the form opens from inside one. Left out — adding from the
   * locations page — the client is chosen in the form itself, since a location cannot be moved to
   * another client afterwards.
   */
  clientId?: string;
  location?: Location;
  onClose: () => void;
}) {
  const isEdit = location !== undefined;
  const addressId = useId();
  const picksClient = !isEdit && !clientId;
  const [chosenClient, setChosenClient] = useState("");

  const [name, setName] = useState(location?.name ?? "");
  const [address, setAddress] = useState(location?.address ?? "");
  const [locationType, setLocationType] = useState<LocationType | "">(location?.type ?? "");
  const [description, setDescription] = useState(location?.description ?? "");
  const [pin, setPin] = useState<Pin | null>(() => fromGeoPoint(location?.location));
  const [isActive, setIsActive] = useState(location?.is_active ?? true);
  const [error, setError] = useState("");

  const [createLocation, { isLoading: creating }] = useCreateLocationMutation();
  const [updateLocation, { isLoading: updating }] = useUpdateLocationMutation();

  const submit = async () => {
    const body = {
      name: name.trim(),
      address: address.trim(),
      type: locationType || undefined,
      description: description.trim() || undefined,
      is_active: isActive,
      location: toGeoPoint(pin),
    };

    try {
      if (isEdit) {
        await updateLocation({ id: location._id, body }).unwrap();
      } else {
        const client = clientId || chosenClient;
        if (!client) {
          setError("Pick a client before adding a location.");
          return;
        }
        await createLocation({ ...body, client }).unwrap();
      }
      onClose();
    } catch (cause) {
      setError(apiError(cause));
    }
  };

  return (
    <FormModal
      title={isEdit ? "Edit location" : "Add location"}
      subtitle={isEdit ? location.name : undefined}
      submitLabel={isEdit ? "Save changes" : "Add location"}
      saving={creating || updating}
      error={error}
      onClose={onClose}
      onSubmit={() => void submit()}
    >
      {picksClient && (
        <ClientPicker
          value={chosenClient}
          onChange={(value) => {
            setChosenClient(value);
            setError("");
          }}
          required
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Location name" value={name} onChange={setName} required />
        <SelectField
          label="Type"
          value={locationType}
          options={LOCATION_TYPES}
          onChange={setLocationType}
          placeholder="Select type"
        />
      </div>

      <div>
        <FieldLabel htmlFor={addressId} label="Address" required />
        <AddressAutocompleteInput
          value={address}
          onChange={setAddress}
          // Picking a suggestion supplies the address and its GPS pin together, so there is
          // nothing for the user to copy across by hand.
          onPlaceSelect={({ address: picked, latitude, longitude }) => {
            setAddress(picked);
            setPin({ latitude, longitude });
            setError("");
          }}
          // Typing over a chosen address makes the stored pin wrong, so it is dropped.
          onCoordinatesCleared={() => setPin(null)}
          required
          placeholder="Search an address"
          className={CONTROL_CLASS}
        />

        {pin ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
            <MdMyLocation className="text-xs" />
            Pinned at {pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}
          </p>
        ) : (
          <p className="mt-1.5 text-[11px] text-slate-400">
            Pick a suggestion to save the GPS pin with this location.
          </p>
        )}
      </div>

      <TextareaField
        label="Description"
        value={description}
        onChange={setDescription}
        placeholder="Anything the cleaning team should know about this location"
        rows={3}
      />

      <CheckboxField label="Active" checked={isActive} onChange={setIsActive} />
    </FormModal>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadGoogleMapsPlaces } from "@/lib/googleMapsLoader";

export type PlaceSelection = { address: string; latitude: number; longitude: number };

interface Props {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelect: (result: PlaceSelection) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * A plain text input wired to Google Places Autocomplete. Typing shows address suggestions;
 * picking one reports the formatted address plus its lat/lng in a single callback, so the caller
 * never needs its own latitude/longitude form fields.
 */
export function AddressAutocompleteInput({ value, onChange, onPlaceSelect, required, placeholder, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    loadGoogleMapsPlaces()
      .then(() => {
        if (cancelled || !inputRef.current || autocompleteRef.current || !window.google) return;
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          if (typeof lat === "number" && typeof lng === "number") {
            const address = place.formatted_address ?? inputRef.current?.value ?? "";
            onChange(address);
            onPlaceSelect({ address, latitude: lat, longitude: lng });
          }
        });
        autocompleteRef.current = autocomplete;
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load address search"));

    return () => {
      cancelled = true;
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [onChange, onPlaceSelect]);

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Start typing an address..."}
        autoComplete="off"
        className={className}
      />
      {loadError && <p className="mt-1 text-[11px] text-red-500">Address search unavailable: {loadError}</p>}
    </div>
  );
}

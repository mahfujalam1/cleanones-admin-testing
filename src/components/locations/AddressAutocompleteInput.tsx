"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadGoogleMapsPlaces } from "@/lib/googleMapsLoader";

export type PlaceSelection = { address: string; latitude: number; longitude: number; name?: string };

interface Props {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelect: (result: PlaceSelection) => void;

  onCoordinatesCleared?: () => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

function suggestionsVisible() {
  return Array.from(document.querySelectorAll(".pac-container")).some(
    (element) => (element as HTMLElement).offsetParent !== null && element.querySelector(".pac-item")
  );
}

export function AddressAutocompleteInput({
  value,
  onChange,
  onPlaceSelect,
  onCoordinatesCleared,
  required,
  placeholder,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const pickedAddressRef = useRef<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [ready, setReady] = useState(false);

  const handlers = useRef({ onChange, onPlaceSelect, onCoordinatesCleared });
  useEffect(() => {
    handlers.current = { onChange, onPlaceSelect, onCoordinatesCleared };
  });

  useEffect(() => {
    let cancelled = false;

    loadGoogleMapsPlaces()
      .then(() => {
        if (cancelled || !inputRef.current || autocompleteRef.current || !window.google) return;
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry", "name"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          if (typeof lat === "number" && typeof lng === "number") {
            const rawAddress = place.formatted_address ?? inputRef.current?.value ?? "";
            const placeName = place.name?.trim();

            let address = rawAddress;
            if (placeName && rawAddress) {
              const lowerAddress = rawAddress.toLowerCase();
              const lowerName = placeName.toLowerCase();
              if (!lowerAddress.includes(lowerName)) {
                address = `${placeName}, ${rawAddress}`;
              }
            } else if (placeName && !rawAddress) {
              address = placeName;
            }

            pickedAddressRef.current = address;
            if (inputRef.current) {
              inputRef.current.value = address;
            }
            handlers.current.onChange(address);
            handlers.current.onPlaceSelect({ address, latitude: lat, longitude: lng, name: placeName });

            window.setTimeout(() => {
              if (inputRef.current && pickedAddressRef.current === address) {
                inputRef.current.value = address;
              }
            }, 0);
          }
        });
        autocompleteRef.current = autocomplete;
        setReady(true);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load address search"));

    return () => {
      cancelled = true;
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !suggestionsVisible()) return;

    event.preventDefault();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (pickedAddressRef.current !== null && next !== pickedAddressRef.current) {

      pickedAddressRef.current = null;
      handlers.current.onCoordinatesCleared?.();
    }
    handlers.current.onChange(next);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        required={required}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Start typing an address..."}
        autoComplete="off"
        className={className}
      />
      {loadError ? (
        <p className="mt-1 text-[11px] text-red-500">Address search unavailable: {loadError}</p>
      ) : (
        !ready && <p className="mt-1 text-[11px] text-slate-400">Loading address search…</p>
      )}
    </div>
  );
}

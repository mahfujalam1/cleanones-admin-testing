"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadGoogleMapsPlaces } from "@/lib/googleMapsLoader";

export type PlaceSelection = { address: string; latitude: number; longitude: number };

interface Props {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelect: (result: PlaceSelection) => void;
  /**
   * Called when the address is edited by hand after a suggestion was picked, so the caller can
   * drop coordinates that no longer match what is typed.
   */
  onCoordinatesCleared?: () => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

/** True while Google's suggestion dropdown is on screen with at least one row. */
function suggestionsVisible() {
  return Array.from(document.querySelectorAll(".pac-container")).some(
    (element) => (element as HTMLElement).offsetParent !== null && element.querySelector(".pac-item")
  );
}

/**
 * A plain text input wired to Google Places Autocomplete. Typing shows address suggestions;
 * picking one — by mouse, or with ArrowDown + Enter — reports the formatted address plus its
 * lat/lng in a single callback, so the caller never needs its own latitude/longitude fields.
 */
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

  // Callers pass inline arrow functions, so keep the live ones in a ref: the widget below must be
  // built exactly once. Rebuilding it on every keystroke tears the suggestion list down as it opens.
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
          fields: ["formatted_address", "geometry"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          if (typeof lat === "number" && typeof lng === "number") {
            const address = place.formatted_address ?? inputRef.current?.value ?? "";
            pickedAddressRef.current = address;
            handlers.current.onChange(address);
            handlers.current.onPlaceSelect({ address, latitude: lat, longitude: lng });
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
    // Google handles Enter itself to confirm the highlighted suggestion. Without this the browser
    // submits the form first and the address is saved with no coordinates.
    event.preventDefault();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (pickedAddressRef.current !== null && next !== pickedAddressRef.current) {
      // Typing over a picked address makes the stored coordinates wrong — let the caller drop them.
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

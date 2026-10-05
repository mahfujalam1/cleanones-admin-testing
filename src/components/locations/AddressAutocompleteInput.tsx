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

export function AddressAutocompleteInput({
  value,
  onChange,
  onPlaceSelect,
  onCoordinatesCleared,
  required,
  placeholder,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const innerInputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSelectingRef = useRef(false);
  const [localValue, setLocalValue] = useState(value || "");
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  const handlers = useRef({ onChange, onPlaceSelect, onCoordinatesCleared });
  useEffect(() => {
    handlers.current = { onChange, onPlaceSelect, onCoordinatesCleared };
  });

  // Debounced notification to parent
  const triggerDebouncedChange = (val: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      handlers.current.onChange(val);
      if (!val.trim()) {
        handlers.current.onCoordinatesCleared?.();
      }
    }, 300);
  };

  // Keep internal input in sync with external value prop
  useEffect(() => {
    if (!isSelectingRef.current) {
      setLocalValue(value || "");
      if (innerInputRef.current && innerInputRef.current.value !== (value || "")) {
        innerInputRef.current.value = value || "";
      }
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;

    loadGoogleMapsPlaces()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const PlaceAutocompleteElementClass =
          window.google?.maps?.places?.PlaceAutocompleteElement;

        if (!PlaceAutocompleteElementClass) {
          throw new Error("PlaceAutocompleteElement not available");
        }

        // Clean container
        containerRef.current.innerHTML = "";
        const placeholderText = placeholder || "Search for an address…";

        // Instantiate modern PlaceAutocompleteElement with forced light theme
        const autocomplete = new PlaceAutocompleteElementClass();
        autocomplete.style.width = "100%";
        autocomplete.style.display = "block";
        autocomplete.style.position = "relative";
        autocomplete.style.zIndex = "99999";
        autocomplete.style.colorScheme = "light";
        autocomplete.setAttribute("color-scheme", "light");
        autocomplete.placeholder = placeholderText;
        autocomplete.setAttribute("placeholder", placeholderText);

        // Listen for modern gmp-select event
        autocomplete.addEventListener("gmp-select", async (event: any) => {
          isSelectingRef.current = true;
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
          }
          try {
            const prediction = event.placePrediction;
            if (!prediction) return;
            const place = prediction.toPlace();
            await place.fetchFields({
              fields: ["displayName", "formattedAddress", "location"],
            });

            const lat =
              typeof place.location?.lat === "function"
                ? place.location.lat()
                : place.location?.lat;
            const lng =
              typeof place.location?.lng === "function"
                ? place.location.lng()
                : place.location?.lng;

            if (typeof lat === "number" && typeof lng === "number") {
              const rawAddress = place.formattedAddress ?? "";
              const placeName =
                typeof place.displayName === "string"
                  ? place.displayName.trim()
                  : place.displayName?.text?.trim() ?? "";

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

              setLocalValue(address);
              if (innerInputRef.current) {
                innerInputRef.current.value = address;
              }

              handlers.current.onChange(address);
              handlers.current.onPlaceSelect({
                address,
                latitude: lat,
                longitude: lng,
                name: placeName || undefined,
              });
            }
          } catch (err) {
            console.error("Place details fetch error:", err);
          } finally {
            setTimeout(() => {
              isSelectingRef.current = false;
            }, 300);
          }
        });

        // Style shadowRoot internals to force pure white light theme matching CONTROL_CLASS
        const shadow = autocomplete.shadowRoot;
        if (shadow) {
          const hideAttributionElements = () => {
            try {
              const targets = shadow.querySelectorAll(
                'footer, [part*="attribution"], [class*="attribution"], [class*="footer"], [class*="logo"], [class*="powered"], [class*="branding"], a[href*="google"], img[alt*="Google"], img[src*="google"]'
              );
              targets.forEach((el) => {
                const htmlEl = el as HTMLElement;
                htmlEl.style.setProperty("display", "none", "important");
                htmlEl.style.setProperty("height", "0", "important");
                htmlEl.style.setProperty("visibility", "hidden", "important");
                htmlEl.style.setProperty("margin", "0", "important");
                htmlEl.style.setProperty("padding", "0", "important");
                htmlEl.style.setProperty("border", "none", "important");
                htmlEl.style.setProperty("overflow", "hidden", "important");
              });

              const all = shadow.querySelectorAll("div, span, p, a, footer, li");
              all.forEach((el) => {
                const text = el.textContent?.trim().toLowerCase();
                if (text === "google" || text === "google maps" || text === "google maps (i)" || (text && text.startsWith("google maps"))) {
                  (el as HTMLElement).style.setProperty("display", "none", "important");
                  if (el.parentElement && el.parentElement.tagName?.toLowerCase() !== "body") {
                    el.parentElement.style.setProperty("display", "none", "important");
                  }
                }
              });
            } catch {}
          };

          hideAttributionElements();

          observer = new MutationObserver(() => {
            hideAttributionElements();
          });
          observer.observe(shadow, { childList: true, subtree: true });

          const style = document.createElement("style");
          style.textContent = `
            :host, * {
              color-scheme: light !important;
              font-family: inherit !important;
              box-sizing: border-box !important;
            }
            :host {
              position: relative !important;
              z-index: 99999 !important;
            }
            /* Hide Google Material internal focus ring */
            [part="focus-ring"], .focus-ring {
              display: none !important;
            }
            /* Completely remove bottom Google Maps attribution / footer */
            footer,
            [part*="attribution"],
            [class*="attribution"],
            [class*="footer"],
            [class*="logo"],
            [class*="powered"],
            [class*="branding"],
            .attribution,
            .footer,
            .powered-by-google,
            .google-logo,
            a[href*="google"],
            img[src*="google"],
            img[alt*="Google"],
            svg[aria-label*="Google"],
            [aria-label*="Google"] {
              display: none !important;
              visibility: hidden !important;
              height: 0 !important;
              max-height: 0 !important;
              min-height: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
              opacity: 0 !important;
              pointer-events: none !important;
              overflow: hidden !important;
              border: none !important;
            }
            .widget-container, .input-container {
              border: none !important;
              outline: none !important;
              border-radius: 0.5rem !important;
              height: 100% !important;
              min-height: 38px !important;
              box-shadow: none !important;
              background-color: transparent !important;
              color: #0f172a !important;
              display: flex !important;
              align-items: center !important;
              padding: 0 4px !important;
            }
            /* Reduce gap between search icon and text */
            [part="search-icon"], .search-icon, svg:first-child {
              margin-left: 4px !important;
              margin-right: 2px !important;
              flex-shrink: 0 !important;
            }
            input {
              font-family: inherit !important;
              font-size: 0.875rem !important;
              line-height: 1.25rem !important;
              color: #0f172a !important;
              background-color: transparent !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
              height: 38px !important;
              padding: 0 6px 0 2px !important;
              margin-left: 0 !important;
              width: 100% !important;
            }
            input:focus, input:focus-visible {
              outline: none !important;
              box-shadow: none !important;
              border: none !important;
            }
            input::placeholder {
              color: #94a3b8 !important;
            }
            /* Dropdown suggestion menu styling - Dedicated scrollbar, compact height & high z-index */
            .dropdown, [role="listbox"], .predictions-list, ul, [class*="listbox"], [class*="dropdown"], [class*="predictions"] {
              background-color: #ffffff !important;
              color: #0f172a !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 0.5rem !important;
              box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
              max-height: 175px !important;
              overflow-y: auto !important;
              overscroll-behavior: contain !important;
              padding: 2px 0 !important;
              margin-top: 4px !important;
              z-index: 999999 !important;
            }
            /* Clean scrollbar for dropdown */
            .dropdown::-webkit-scrollbar, [role="listbox"]::-webkit-scrollbar, ul::-webkit-scrollbar {
              width: 5px !important;
            }
            .dropdown::-webkit-scrollbar-thumb, [role="listbox"]::-webkit-scrollbar-thumb, ul::-webkit-scrollbar-thumb {
              background: #cbd5e1 !important;
              border-radius: 999px !important;
            }
            .dropdown::-webkit-scrollbar-track, [role="listbox"]::-webkit-scrollbar-track, ul::-webkit-scrollbar-track {
              background: transparent !important;
            }
            /* Slim compact list items (cikon & cuto) */
            li, [role="option"], .prediction-item, [class*="prediction-item"], [class*="suggestion-item"], [class*="item"] {
              background-color: #ffffff !important;
              color: #0f172a !important;
              border-bottom: 1px solid #f1f5f9 !important;
              padding: 3px 6px !important;
              min-height: 28px !important;
              cursor: pointer !important;
            }
            li:last-child, [role="option"]:last-child, .prediction-item:last-child {
              border-bottom: none !important;
            }
            li:hover, [role="option"]:hover, [aria-selected="true"], .prediction-item:hover {
              background-color: #f0f9ff !important;
              color: #0369a1 !important;
            }
            /* Pin icon and circle container - smaller & slimmer */
            .icon-container, [class*="icon"], [class*="avatar"], [part*="icon"] {
              width: 20px !important;
              height: 20px !important;
              min-width: 20px !important;
              min-height: 20px !important;
              margin-right: 4px !important;
              flex-shrink: 0 !important;
            }
            li svg, [role="option"] svg, .prediction-item svg, svg {
              width: 12px !important;
              height: 12px !important;
              flex-shrink: 0 !important;
            }
            .primary-text, .title, b, strong, [class*="primary-text"], [class*="title"], [part*="title"] {
              color: #0f172a !important;
              font-size: 11.5px !important;
              font-weight: 600 !important;
              line-height: 1.2 !important;
            }
            .secondary-text, .description, span, [class*="secondary-text"], [class*="subtitle"], [part*="subtitle"] {
              color: #64748b !important;
              font-size: 10px !important;
              line-height: 1.15 !important;
              margin-top: 1px !important;
            }
            svg, .icon {
              fill: #64748b !important;
              color: #64748b !important;
            }
          `;
          shadow.appendChild(style);

          const input = shadow.querySelector("input");
          if (input) {
            innerInputRef.current = input;
            input.placeholder = placeholderText;
            input.setAttribute("placeholder", placeholderText);
            if (value) {
              input.value = value;
            }

            input.addEventListener("input", (e) => {
              const next = (e.target as HTMLInputElement).value;
              setLocalValue(next);
              triggerDebouncedChange(next);
            });
          }
        }

        containerRef.current.appendChild(autocomplete);
        setIsReady(true);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Failed to load address search");
      });

    return () => {
      cancelled = true;
      if (observer) {
        observer.disconnect();
      }
    };
  }, [placeholder]);

  const handleFallbackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setLocalValue(next);
    triggerDebouncedChange(next);
  };

  return (
    <div className="relative z-50 w-full">
      {/* Container for PlaceAutocompleteElement */}
      <div ref={containerRef} className={isReady ? "w-full" : "hidden"} />

      {/* Fallback input shown while loading or if loading fails */}
      {!isReady && (
        <input
          ref={fallbackInputRef}
          type="text"
          required={required}
          value={localValue}
          onChange={handleFallbackChange}
          placeholder={placeholder ?? "Start typing an address…"}
          autoComplete="off"
          className={className}
        />
      )}

      {/* Hidden input to ensure native form validation works with required prop */}
      {required && isReady && (
        <input
          type="text"
          tabIndex={-1}
          value={localValue}
          readOnly
          required
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-0 w-0 opacity-0"
        />
      )}

      {loadError && (
        <p className="mt-1 text-[11px] text-red-500">Address search error: {loadError}</p>
      )}
    </div>
  );
}


/**
 * Helper to dynamically load Google Maps JavaScript API with the Places library.
 * Uses Google's recommended async loading parameter (&loading=async) and importLibrary.
 */

declare global {
  interface Window {
    google?: typeof google;
    __gmpShadowPatched?: boolean;
  }
}

// Ensure shadowRoot is accessible so the web component input can match existing form state and styles
if (typeof window !== "undefined" && !window.__gmpShadowPatched) {
  window.__gmpShadowPatched = true;
  const origAttachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (init) {
    if (this.localName === "gmp-place-autocomplete") {
      return origAttachShadow.call(this, { ...init, mode: "open" });
    }
    return origAttachShadow.call(this, init);
  };
}

let loadPromise: Promise<void> | null = null;

export function loadGoogleMapsPlaces(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps can only load in the browser"));
  if (window.google?.maps?.places?.PlaceAutocompleteElement) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured"));

  loadPromise = new Promise<void>((resolve, reject) => {
    const checkReady = () => {
      if (window.google?.maps?.importLibrary) {
        window.google.maps
          .importLibrary("places")
          .then(() => resolve())
          .catch((err) => {
            loadPromise = null;
            reject(err);
          });
        return;
      }
      const start = Date.now();
      const interval = setInterval(() => {
        if (window.google?.maps?.places?.PlaceAutocompleteElement) {
          clearInterval(interval);
          resolve();
        } else if (window.google?.maps?.importLibrary) {
          clearInterval(interval);
          window.google.maps
            .importLibrary("places")
            .then(() => resolve())
            .catch((err) => {
              loadPromise = null;
              reject(err);
            });
        } else if (Date.now() - start > 8000) {
          clearInterval(interval);
          if (window.google?.maps?.places) {
            resolve();
          } else {
            loadPromise = null;
            reject(new Error("Google Maps Places library timed out"));
          }
        }
      }, 50);
    };

    const existing = document.querySelector<HTMLScriptElement>("script[data-google-maps-loader]");
    if (existing) {
      if (window.google?.maps?.places?.PlaceAutocompleteElement) return resolve();
      existing.addEventListener("load", checkReady);
      existing.addEventListener("error", () => {
        loadPromise = null;
        reject(new Error("Failed to load Google Maps script"));
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async&v=weekly&callback=Function.prototype`;
    script.async = true;
    script.dataset.googleMapsLoader = "true";
    script.onload = checkReady;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}


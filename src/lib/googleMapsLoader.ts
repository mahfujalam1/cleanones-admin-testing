// Loads the Google Maps JavaScript API (classic script tag with `libraries=places`) exactly
// once, no matter how many components ask for it — every caller awaits the same
// in-flight/cached promise.
//
// Deliberately NOT using `loading=async` + `google.maps.importLibrary(...)`: that pattern only
// works when Google's special inline bootstrap-loader snippet defines `importLibrary` itself —
// just appending `&loading=async` to a plain <script src="...maps/api/js?..."> tag does NOT
// define it, and calling it throws "window.google.maps.importLibrary is not a function". The
// classic `libraries=places` query param, with no `loading=async`, guarantees
// `google.maps.places.*` is fully populated by the time the script's `onload` fires — which is
// all this app's single Autocomplete widget needs.

declare global {
  interface Window {
    google?: typeof google;
  }
}

let loadPromise: Promise<void> | null = null;

export function loadGoogleMapsPlaces(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps can only load in the browser"));
  if (window.google?.maps?.places) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured"));

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-google-maps-loader]");
    if (existing) {
      if (window.google?.maps?.places) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps script")));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.dataset.googleMapsLoader = "true";
    script.onload = () => resolve();
    script.onerror = () => { loadPromise = null; reject(new Error("Failed to load Google Maps script")); };
    document.head.appendChild(script);
  });

  return loadPromise;
}

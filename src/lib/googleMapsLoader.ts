











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

export const supportedLocales = ["en", "nl", "fr", "es", "pl", "uk", "pt", "ar"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export function getLocale(pathname?: string | null): SupportedLocale {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("cleanones_dashboard_locale");
      if (saved && supportedLocales.includes(saved as SupportedLocale)) {
        return saved as SupportedLocale;
      }
    } catch {}
  }
  if (pathname) {
    const seg = pathname.split("/").filter(Boolean)[0];
    if (supportedLocales.includes(seg as SupportedLocale)) {
      return seg as SupportedLocale;
    }
  }
  return "en";
}

export function setLocale(newLocale: string) {
  if (typeof window === "undefined") return;
  const validLocale = supportedLocales.includes(newLocale as SupportedLocale) ? newLocale : "en";
  try {
    localStorage.setItem("cleanones_dashboard_locale", validLocale);
    document.cookie = `cleanones_locale=${validLocale}; path=/; max-age=31536000; SameSite=Lax;`;
  } catch {}
  window.dispatchEvent(new CustomEvent("cleanones_locale_changed", { detail: validLocale }));
}

export function localizePath(pathname: string, locale: string) {
  const stripped = stripLocale(pathname);
  return `/${locale}${stripped === '/' ? '' : stripped}`;
}

export function stripLocale(pathname: string | null) {
  if (!pathname) return "/";
  const segments = pathname.split("/").filter(Boolean);
  if (supportedLocales.includes(segments[0] as SupportedLocale)) segments.shift();
  return `/${segments.join("/")}`;
}

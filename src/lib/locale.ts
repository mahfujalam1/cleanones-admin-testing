/**
 * Every language the dashboard ships, in the order the switcher lists them, each written in its
 * own tongue. This is the single source for the locale switcher, the route prefixes accepted by
 * `proxy.ts`, and the languages a worker can be tagged with.
 */
export const LOCALE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
] as const;

export type SupportedLocale = (typeof LOCALE_OPTIONS)[number]["code"];

export const supportedLocales = LOCALE_OPTIONS.map((option) => option.code) as readonly SupportedLocale[];

/** Language names offered wherever a person's spoken languages are picked. */
export const LANGUAGE_NAMES = LOCALE_OPTIONS.map((option) => option.label) as readonly string[];

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

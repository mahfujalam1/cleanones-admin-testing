export const supportedLocales = ["en", "fr", "es"] as const;

export function getLocale(pathname: string | null) {
  const locale = pathname?.split("/").filter(Boolean)[0];
  return supportedLocales.includes(locale as (typeof supportedLocales)[number]) ? locale! : "en";
}

export function localizePath(pathname: string, locale: string) {
  const normalized = pathname === "/" ? "" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${locale}${normalized}`;
}

export function stripLocale(pathname: string | null) {
  if (!pathname) return "/";
  const segments = pathname.split("/").filter(Boolean);
  if (supportedLocales.includes(segments[0] as (typeof supportedLocales)[number])) segments.shift();
  return `/${segments.join("/")}`;
}

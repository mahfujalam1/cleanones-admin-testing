import { countries as fallbackCountries } from "./countries";

const GEONAMES_URL = "https://secure.geonames.org/countryInfoJSON";

type CountryInfo = { countryName?: string };

let inFlight: Promise<string[]> | null = null;

export function loadCountries(): Promise<string[]> {
  inFlight ??= (async () => {
    const username = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;
    if (!username) return fallbackCountries;

    try {
      const response = await fetch(`${GEONAMES_URL}?username=${encodeURIComponent(username)}`);
      if (!response.ok) return fallbackCountries;

      const body = (await response.json()) as { geonames?: CountryInfo[]; status?: { message: string } };
      const names = (body.geonames ?? [])
        .map((country) => country.countryName?.trim())
        .filter((name): name is string => Boolean(name))
        .sort((a, b) => a.localeCompare(b));

      return names.length > 0 ? names : fallbackCountries;
    } catch {
      return fallbackCountries;
    }
  })();

  return inFlight;
}

export type Place = {
  id: number;
  label: string;
  name: string;
  country?: string;
};

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const term = query.trim();
  const username = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;
  if (term.length < 2 || !username) return [];

  const params = new URLSearchParams({
    q: term,
    maxRows: "10",
    featureClass: "P",
    orderby: "relevance",
    username,
  });

  try {
    const response = await fetch(`https://secure.geonames.org/searchJSON?${params}`, { signal });
    if (!response.ok) return [];

    const body = (await response.json()) as {
      geonames?: Array<{ geonameId: number; name: string; adminName1?: string; countryName?: string }>;
    };

    return (body.geonames ?? []).map((place) => ({
      id: place.geonameId,
      name: place.name,
      country: place.countryName,
      label: [place.name, place.adminName1, place.countryName].filter(Boolean).join(", "),
    }));
  } catch {
    return [];
  }
}

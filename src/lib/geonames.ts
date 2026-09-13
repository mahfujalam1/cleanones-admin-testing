import { countries as fallbackCountries } from "./countries";

/**
 * Country names from GeoNames, fetched once per page load and shared by every picker.
 *
 * Two details matter here:
 *   - the request goes to `secure.geonames.org`, not the plain `api.` host, because the dashboard
 *     is served over HTTPS and a browser blocks mixed content outright;
 *   - GeoNames needs a registered username and rate-limits free accounts, so a failure is
 *     expected rather than exceptional. The bundled ISO list then stands in, and the picker keeps
 *     working instead of showing an empty dropdown.
 */

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
      // GeoNames reports quota and auth problems with HTTP 200 and a `status` object.
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
  /** "Eindhoven, North Brabant, The Netherlands" — what gets stored on the record. */
  label: string;
  name: string;
  country?: string;
};

/**
 * Free-text place search. `featureClass=P` limits results to populated places, so a search for a
 * city does not come back full of rivers and mountains. Returns an empty list rather than
 * throwing, since a picker mid-typing has nothing useful to do with an error.
 */
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

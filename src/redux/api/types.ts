/** Shapes shared by every list endpoint. */

/** Pagination block the API nests under `data.meta`. */
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage?: number;
};

/** List endpoints answer `{ meta, result }` inside the usual envelope. */
export type Paginated<T> = {
  meta: PaginationMeta;
  result: T[];
};

/** Query string every list endpoint accepts. */
export type ListParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  /** Single field; prefix with `-` for descending. */
  sort?: string;
  /** Comma-separated projection, e.g. `name,email`. Ignored by aggregation endpoints. */
  fields?: string;
};

/** A MongoDB reference that the API may return either as an id or as a populated document. */
export type Ref<T> = string | T;

/**
 * Reads the id off a reference whether or not the API populated it.
 *
 * Returns an empty string when there is nothing to read, so callers that send ids onward must
 * drop the blanks — the server rejects `""` as a failed ObjectId cast.
 */
export const refId = <T extends { _id: string }>(ref: Ref<T> | null | undefined): string => {
  if (typeof ref === "string") return ref;
  if (ref && typeof ref === "object") return ref._id ?? "";
  return "";
};

/**
 * The least a populated reference is guaranteed to carry. Endpoints differ on whether the
 * display text lives under `name` or `title`, so both are optional here and `refLabel` picks.
 */
export type NamedRef = { _id: string; name?: string; title?: string };

/**
 * Reads the display text off a reference. An unpopulated reference is just its id, which is
 * returned as-is so callers can still show something rather than an empty cell.
 */
export const refLabel = (ref: Ref<NamedRef> | null | undefined): string => {
  if (typeof ref === "string") return ref;
  if (ref && typeof ref === "object") return ref.name ?? ref.title ?? "";
  return "";
};

/** Reads a populated document, or null when the API returned only an id. */
export const refDoc = <T extends { _id: string }>(ref: Ref<T> | null | undefined): T | null =>
  ref && typeof ref !== "string" ? ref : null;

/** GeoJSON point, used for location pins. */
export type GeoPoint = {
  type?: "Point";
  /** `[longitude, latitude]` — GeoJSON order, the reverse of how maps usually read. */
  coordinates: [number, number];
};

/** Builds a list query string, omitting anything the caller left undefined or blank. */
export function listQuery(params: ListParams = {}): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 1));
  search.set("limit", String(params.limit ?? 20));
  if (params.searchTerm?.trim()) search.set("searchTerm", params.searchTerm.trim());
  if (params.sort) search.set("sort", params.sort);
  if (params.fields) search.set("fields", params.fields);
  return search.toString();
}

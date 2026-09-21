export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage?: number;
};

export type Paginated<T> = {
  meta: PaginationMeta;
  result: T[];
};

export type ListParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sort?: string;
  fields?: string;
};

export type Ref<T> = string | T;

export const refId = <T extends { _id: string }>(ref: Ref<T> | null | undefined): string => {
  if (typeof ref === "string") return ref;
  if (ref && typeof ref === "object") return ref._id ?? "";
  return "";
};

export type NamedRef = { _id: string; name?: string; title?: string };

export const refLabel = (ref: Ref<NamedRef> | null | undefined): string => {
  if (typeof ref === "string") return ref;
  if (ref && typeof ref === "object") return ref.name ?? ref.title ?? "";
  return "";
};

export const refDoc = <T extends { _id: string }>(ref: Ref<T> | null | undefined): T | null =>
  ref && typeof ref !== "string" ? ref : null;

export type GeoPoint = {
  type?: "Point";
  coordinates: [number, number];
};

export function listQuery(params: ListParams = {}): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 1));
  search.set("limit", String(params.limit ?? 20));
  if (params.searchTerm?.trim()) search.set("searchTerm", params.searchTerm.trim());
  if (params.sort) search.set("sort", params.sort);
  if (params.fields) search.set("fields", params.fields);
  return search.toString();
}

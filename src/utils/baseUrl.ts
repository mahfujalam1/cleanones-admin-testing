export const API_PREFIX = "/api/v1";

export const apiHost = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  ""
).replace(/\/$/, "");

export const targetApi = apiHost ? `${apiHost}${API_PREFIX}` : "";

export const apiBase = () => (typeof window === "undefined" ? targetApi : "/api/proxy");

export const imgUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${apiBase()}${url.startsWith("/") ? "" : "/"}${url}`;
};

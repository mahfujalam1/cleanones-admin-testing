/** Every backend route sits under this prefix. Declared once, used by the browser and the proxy rewrite. */
export const API_PREFIX = "/api/v1";

/** Backend host, without a trailing slash and without the route prefix. */
export const apiHost = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  ""
).replace(/\/$/, "");

/** Absolute backend base, used on the server where there is no proxy to go through. */
export const targetApi = apiHost ? `${apiHost}${API_PREFIX}` : "";

/**
 * Base URL for API calls, so an endpoint only ever writes its own path (`/auth/login`).
 *
 * In the browser this is always the same-origin `/api/proxy` rewrite (see `next.config.ts`),
 * never the backend host. That is not a style choice: the backend's refresh token is an
 * HttpOnly `SameSite=Strict` cookie, and a strict cookie is withheld from cross-site requests.
 * Proxying through our own origin keeps it first-party, so the browser attaches it to
 * `/auth/refresh-token` and sessions survive a reload. It also avoids mixed-content blocking
 * when the site is served over HTTPS and the backend is not.
 */
export const apiBase = () => (typeof window === "undefined" ? targetApi : "/api/proxy");

export const imgUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${apiBase()}${url.startsWith("/") ? "" : "/"}${url}`;
};

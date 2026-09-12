export const targetApi = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  ""
).replace(/\/$/, "");

/**
 * Base URL for API calls.
 * When running in the browser over HTTPS (e.g. Vercel deployment) while targetApi is HTTP,
 * route requests through Next.js rewrite proxy (/api/proxy) to prevent Mixed Content blocking.
 */
export const apiBase = () => {
  if (typeof window !== "undefined" && window.location.protocol === "https:" && targetApi.startsWith("http:")) {
    return "/api/proxy";
  }
  return targetApi || "/api/proxy";
};

export const imgUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${apiBase()}${url.startsWith("/") ? "" : "/"}${url}`;
};

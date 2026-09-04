import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { tagTypeList } from "../tagTypes";
import { refreshSession } from "@/services/actions/auth";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const raw = parts.pop()?.split(";").shift();
    if (raw) return decodeURIComponent(raw);
  }
  return null;
}

function getApiBaseUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://18.198.109.196:8080").replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return "/api/proxy";
  }
  return configured;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers) => {
    const token = getCookieValue("cleanones_manager_access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    const refreshed = await refreshSession();
    if (refreshed.success) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        document.cookie = "cleanones_manager_access_token=; path=/; max-age=0;";
        document.cookie = "cleanones_manager_refresh_token=; path=/; max-age=0;";
        localStorage.removeItem("cleanones-dashboard-user");
        window.location.href = "/login";
      }
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: tagTypeList,
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: 30,
  endpoints: () => ({}),
});

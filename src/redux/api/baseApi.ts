import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import { apiBase } from "@/utils/baseUrl";
import { tokenStore } from "@/lib/auth/tokenStore";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { clearSessionMarker, hasSessionMarker } from "@/lib/auth/session";
import { getLocale, localizePath } from "@/lib/locale";
import { tagTypeList } from "../tagTypes";


type Envelope<T> = { success: boolean; message: string; data: T };


export type ApiMeta = FetchBaseQueryMeta & { message?: string };

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBase(),
  
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = tokenStore.get();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});


function endSession() {
  if (typeof window === "undefined") return;
  tokenStore.clear();
  clearSessionMarker();
  const loginPath = localizePath("/login", getLocale(window.location.pathname));
  if (window.location.pathname !== loginPath) window.location.replace(loginPath);
}

const transientError = (outcome: "unauthenticated" | "unavailable"): FetchBaseQueryError =>
  outcome === "unauthenticated"
    ? { status: 401, data: { message: "Your session has expired. Please sign in again." } }
    : { status: 503, data: { message: "Could not reach the server. Please try again in a moment." } };

const isUnauthorized = (error?: FetchBaseQueryError) => error?.status === 401 || error?.status === 403;


const isPublicAuthPath = (args: string | FetchArgs) => {
  const url = typeof args === "string" ? args : args.url;
  return url.startsWith("/auth/") && url !== "/auth/change-password";
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  Record<string, unknown>,
  ApiMeta
> = async (args, api, extraOptions) => {
  const needsSession = !isPublicAuthPath(args);

  
  
  if (needsSession && tokenStore.needsRefresh() && hasSessionMarker()) {
    const outcome = await refreshAccessToken();
    if (outcome !== "refreshed") {
      
      
      if (outcome === "unauthenticated") endSession();
      return { error: transientError(outcome) };
    }
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  
  if (needsSession && isUnauthorized(result.error)) {
    const outcome = await refreshAccessToken();
    if (outcome === "refreshed") {
      result = await rawBaseQuery(args, api, extraOptions);
    } else if (outcome === "unauthenticated") {
      endSession();
    }
  }

  if (result.error) return result;

  
  const envelope = result.data as Envelope<unknown> | null;
  const isEnveloped = envelope !== null && typeof envelope === "object" && "data" in envelope;

  return {
    data: isEnveloped ? envelope.data : result.data,
    meta: {
      ...(result.meta as FetchBaseQueryMeta),
      message: isEnveloped ? envelope.message : undefined,
    },
  };
};

export const baseApi = createApi({
  reducerPath: "api/v1",
  baseQuery: baseQueryWithReauth,
  tagTypes: tagTypeList,
  
  
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: 30,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

import { apiBase } from "@/utils/baseUrl";
const ACCESS = "cleanones_manager_access_token";
const REFRESH = "cleanones_manager_refresh_token";
const REMEMBER = "cleanones_manager_remember";
const PERSIST_MAX_AGE = 86400 * 30;
const ACCESS_MAX_AGE = 86400;
function getBaseUrl(): string {
  return apiBase();
}

export type AuthResponse = { message: string; access_token: string; refresh_token: string; token_type: string; name: string; role: string; is_approved: boolean; approval_status: string; is_temporary_password?: boolean };
export type ActionResult<T = string> = { success: true; data: T } | { success: false; error: string; status?: number };

function setClientCookie(name: string, value: string, maxAgeSeconds?: number) {
  if (typeof document === "undefined") return;
  let cookieStr = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax;`;
  if (maxAgeSeconds !== undefined) cookieStr += ` max-age=${maxAgeSeconds};`;
  if (typeof window !== "undefined" && window.location.protocol === "https:") cookieStr += " Secure;";
  document.cookie = cookieStr;
}

function deleteClientCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0;`;
}

function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function message(value: unknown, fallback: string) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const body = value as { message?: string; detail?: string | Array<{ msg?: string } | string> | Record<string, unknown> };
    if (body.message && typeof body.message === "string") return body.message;
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => (typeof item === "string" ? item : item.msg || JSON.stringify(item))).filter(Boolean).join(", ") || fallback;
    }
    if (body.detail && typeof body.detail === "object") {
      return (body.detail as { message?: string }).message || JSON.stringify(body.detail);
    }
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit): Promise<ActionResult<T>> {
  const base = getBaseUrl();
  if (!base) return { success: false, error: "API_BASE_URL is not configured", status: 500 };
  const method = (init.method ?? "GET").toUpperCase();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = base.endsWith("/") ? `${base.slice(0, -1)}${cleanPath}` : `${base}${cleanPath}`;
  const startedAt = Date.now();
  try {
    const response = await fetch(url, { ...init, headers: { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...init.headers }, cache: init.cache ?? "no-store" });
    const text = await response.text().catch(() => "");
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    if (process.env.NODE_ENV !== "production") {
      console.info(`[API] ${method} ${url} -> ${response.status} (${Date.now() - startedAt}ms)`);
    }
    if (!response.ok) return { success: false, error: message(body, "Request failed"), status: response.status };
    return { success: true, data: (body ?? text) as T };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[API] ${method} ${url} -> NETWORK ERROR (${Date.now() - startedAt}ms)`, error);
    }
    return { success: false, error: "Unable to connect to the server", status: 500 };
  }
}

async function save(auth: AuthResponse, remember = false) {
  // Remembered: persistent cookies that survive a full browser restart.
  // Not remembered: true session cookies (no max-age) that only clear when the browser itself closes, not on a tab close.
  const accessMaxAge = remember ? ACCESS_MAX_AGE : undefined;
  const refreshMaxAge = remember ? PERSIST_MAX_AGE : undefined;
  if (typeof window !== "undefined") {
    setClientCookie(ACCESS, auth.access_token, accessMaxAge);
    setClientCookie(REFRESH, auth.refresh_token, refreshMaxAge);
    setClientCookie(REMEMBER, remember ? "1" : "0", refreshMaxAge);
  } else {
    try {
      const { cookies } = await import("next/headers");
      const store = await cookies();
      const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
      store.set(ACCESS, auth.access_token, accessMaxAge !== undefined ? { ...options, maxAge: accessMaxAge } : options);
      store.set(REFRESH, auth.refresh_token, refreshMaxAge !== undefined ? { ...options, maxAge: refreshMaxAge } : options);
    } catch {}
  }
}

function getRememberPreference(): boolean {
  if (typeof document === "undefined") return false;
  return getClientCookie(REMEMBER) === "1";
}

const isManagerRole = (role?: string) => ["admin", "manager", "super_admin", "superadmin"].includes((role || "").toLowerCase().replaceAll("-", "_"));

export async function loginUser(input: { email: string; password: string; remember_me: boolean; onesignal_player_id?: string }) {
  const result = await request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(input) });
  if (result.success && !isManagerRole(result.data.role)) return { success: false, error: "This account does not have access to the Manager Portal" } as ActionResult<AuthResponse>;
  if (result.success) await save(result.data, input.remember_me);
  return result;
}
export async function forgotPassword(email: string) { return request<string>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }); }
export async function resendOtp(email: string) { return request<string>("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }); }
export async function resetPassword(input: { email: string; otp_code: string; new_password: string }) { return request<string>("/auth/reset-password", { method: "POST", body: JSON.stringify(input) }); }
export async function verifyEmail(input: { email: string; otp_code: string; onesignal_player_id?: string }) {
  const result = await request<AuthResponse>("/auth/verify-email", { method: "POST", body: JSON.stringify(input) });
  if (result.success && !isManagerRole(result.data.role)) return { success: false, error: "This account does not have access to the Manager Portal" } as ActionResult<AuthResponse>;
  if (result.success) await save(result.data);
  return result;
}
let refreshInFlight: Promise<ActionResult<AuthResponse>> | null = null;

export async function refreshSession() {
  // De-duplicate concurrent callers (e.g. several queries firing 401s at once on reopen) into a single
  // network request — otherwise a rotating refresh token gets used twice and every extra caller fails.
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      token = getClientCookie(REFRESH);
    } else {
      try {
        const { cookies } = await import("next/headers");
        token = (await cookies()).get(REFRESH)?.value ?? null;
      } catch {}
    }
    if (!token) return { success: false, error: "Session expired" } as ActionResult<AuthResponse>;
    const result = await request<AuthResponse>("/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token: token }) });
    if (result.success) await save(result.data, getRememberPreference());
    return result;
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}
export async function authenticated<T>(path: string, init: RequestInit): Promise<ActionResult<T>> {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = getClientCookie(ACCESS);
  } else {
    try {
      const { cookies } = await import("next/headers");
      token = (await cookies()).get(ACCESS)?.value ?? null;
    } catch {}
  }
  if (!token) { const refresh = await refreshSession(); if (!refresh.success) return refresh as ActionResult<T>; token = refresh.data.access_token; }
  let result = await request<T>(path, { ...init, headers: { ...init.headers, Authorization: `Bearer ${token}` } } as RequestInit);
  if (!result.success && (result.status === 401 || result.status === 403 || result.error.includes("401") || result.error.toLowerCase().includes("credential") || result.error.toLowerCase().includes("unauthorized"))) {
    const refresh = await refreshSession();
    if (refresh.success) result = await request<T>(path, { ...init, headers: { ...init.headers, Authorization: `Bearer ${refresh.data.access_token}` } } as RequestInit);
  }
  return result;
}
export type CurrentUser = {
  id?: string;
  _id?: string;
  user_id?: string;
  full_name?: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  profile_photo?: string;
};
export async function changePassword(input: { old_password: string; new_password: string }) { return authenticated<string>("/auth/change-password", { method: "POST", body: JSON.stringify(input) }); }
export async function getCurrentUser() { return authenticated<CurrentUser>("/auth/me", { method: "GET" }); }
export async function logoutUser() {
  try {
    await authenticated<string>("/auth/logout", { method: "POST" });
  } catch {
    // Ignore API error on logout
  } finally {
    if (typeof window !== "undefined") {
      deleteClientCookie(ACCESS);
      deleteClientCookie(REFRESH);
      deleteClientCookie(REMEMBER);
    }
    try {
      const { cookies } = await import("next/headers");
      const store = await cookies();
      store.delete(ACCESS);
      store.delete(REFRESH);
      store.delete(REMEMBER);
    } catch {}
  }
  return { success: true, data: "Logged out" } as ActionResult<string>;
}

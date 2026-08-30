"use server";

import { cookies } from "next/headers";
import { updateTag } from "next/cache";

const ACCESS = "cleanones_manager_access_token";
const REFRESH = "cleanones_manager_refresh_token";
const BASE = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
export type AuthResponse = { message: string; access_token: string; refresh_token: string; token_type: string; name: string; role: string; is_approved: boolean; approval_status: string };
export type ActionResult<T = string> = { success: true; data: T } | { success: false; error: string };

function message(value: unknown, fallback: string) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const body = value as { message?: string; detail?: string | Array<{ msg?: string }> };
    if (body.message) return body.message;
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) return body.detail.map((item) => item.msg).filter(Boolean).join(", ") || fallback;
  }
  return fallback;
}
async function request<T>(path: string, init: RequestInit): Promise<ActionResult<T>> {
  if (!BASE) return { success: false, error: "API_BASE_URL is not configured" };
  const method = (init.method ?? "GET").toUpperCase();
  const url = `${BASE}${path}`;
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
    if (!response.ok) return { success: false, error: message(body, "Request failed") };
    return { success: true, data: (body ?? text) as T };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[API] ${method} ${url} -> NETWORK ERROR (${Date.now() - startedAt}ms)`, error);
    }
    return { success: false, error: "Unable to connect to the server" };
  }
}
async function save(auth: AuthResponse, remember = false) {
  const store = await cookies();
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
  store.set(ACCESS, auth.access_token, { ...options, maxAge: remember ? 86400 : undefined });
  store.set(REFRESH, auth.refresh_token, { ...options, maxAge: remember ? 2592000 : 604800 });
}
const isManagerRole = (role?: string) => ["admin", "manager", "super_admin", "superadmin"].includes((role || "").toLowerCase().replaceAll("-", "_"));
export async function loginUser(input: { email: string; password: string; remember_me: boolean; onesignal_player_id?: string }) { const result = await request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(input) }); if (result.success && !isManagerRole(result.data.role)) return { success: false, error: "This account does not have access to the Manager Portal" } as ActionResult<AuthResponse>; if (result.success) await save(result.data, input.remember_me); return result; }
export async function forgotPassword(email: string) { return request<string>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }); }
export async function resendOtp(email: string) { return request<string>("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }); }
export async function resetPassword(input: { email: string; otp_code: string; new_password: string }) { return request<string>("/auth/reset-password", { method: "POST", body: JSON.stringify(input) }); }
export async function verifyEmail(input: { email: string; otp_code: string; onesignal_player_id?: string }) { const result = await request<AuthResponse>("/auth/verify-email", { method: "POST", body: JSON.stringify(input) }); if (result.success && !isManagerRole(result.data.role)) return { success: false, error: "This account does not have access to the Manager Portal" } as ActionResult<AuthResponse>; if (result.success) await save(result.data); return result; }
export async function refreshSession() { const token = (await cookies()).get(REFRESH)?.value; if (!token) return { success: false, error: "Session expired" } as ActionResult<AuthResponse>; const result = await request<AuthResponse>("/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token: token }) }); if (result.success) await save(result.data, true); return result; }
export async function authenticated<T>(path: string, init: RequestInit): Promise<ActionResult<T>> {
  let token = (await cookies()).get(ACCESS)?.value;
  if (!token) { const refresh = await refreshSession(); if (!refresh.success) return refresh as ActionResult<T>; token = refresh.data.access_token; }
  const method = (init.method ?? "GET").toUpperCase();
  const resource = path.split("?")[0].split("/").filter(Boolean).slice(0, 3).join(":");
  const cacheOptions = method === "GET" ? { cache: "force-cache" as RequestCache, next: { revalidate: 30, tags: ["api:manager", `api:${resource}`] } } : {};
  let result = await request<T>(path, { ...init, ...cacheOptions, headers: { ...init.headers, Authorization: `Bearer ${token}` } } as RequestInit);
  if (!result.success && result.error.includes("401")) { const refresh = await refreshSession(); if (refresh.success) result = await request<T>(path, { ...init, ...cacheOptions, headers: { ...init.headers, Authorization: `Bearer ${refresh.data.access_token}` } } as RequestInit); }
  if (result.success && method !== "GET") updateTag("api:manager");
  return result;
}
export async function changePassword(input: { old_password: string; new_password: string }) { return authenticated<string>("/auth/change-password", { method: "POST", body: JSON.stringify(input) }); }
export async function getCurrentUser() { return authenticated<unknown>("/auth/me", { method: "GET" }); }
export async function logoutUser() { await authenticated<string>("/auth/logout", { method: "POST" }); const store = await cookies(); store.delete(ACCESS); store.delete(REFRESH); return { success: true, data: "Logged out" } as ActionResult<string>; }

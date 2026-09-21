import { apiBase } from "@/utils/baseUrl";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { tokenStore } from "@/lib/auth/tokenStore";




export type ActionResult<T = string> = { success: true; data: T } | { success: false; error: string; status?: number };


function message(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) return value;
  if (!value || typeof value !== "object") return fallback;

  const { message: text, detail } = value as {
    message?: string;
    detail?: string | Array<string | { msg?: string }> | { message?: string };
  };
  if (text?.trim()) return text;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const joined = detail
      .map((item) => (typeof item === "string" ? item : item.msg))
      .filter(Boolean)
      .join(", ");
    if (joined) return joined;
  }
  if (detail && typeof detail === "object" && !Array.isArray(detail) && detail.message) return detail.message;
  return fallback;
}

async function request<T>(path: string, init: RequestInit): Promise<ActionResult<T>> {
  const base = apiBase();
  if (!base) return { success: false, error: "API base URL is not configured", status: 500 };

  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const isFormData = init.body instanceof FormData;

  try {
    const response = await fetch(url, {
      ...init,
      credentials: "include",
      headers: { ...(isFormData ? {} : { "Content-Type": "application/json" }), ...init.headers },
      cache: init.cache ?? "no-store",
    });

    const text = await response.text().catch(() => "");
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      
    }

    if (!response.ok) return { success: false, error: message(body, "Request failed"), status: response.status };
    return { success: true, data: (body ?? text) as T };
  } catch {
    return { success: false, error: "Unable to connect to the server", status: 500 };
  }
}


export async function authenticated<T>(path: string, init: RequestInit): Promise<ActionResult<T>> {
  if (tokenStore.needsRefresh() && (await refreshAccessToken()) !== "refreshed") {
    return { success: false, error: "Session expired", status: 401 };
  }

  const withToken = (token: string | null): RequestInit => ({
    ...init,
    headers: { ...init.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });

  const result = await request<T>(path, withToken(tokenStore.get()));
  if (result.success || (result.status !== 401 && result.status !== 403)) return result;

  if ((await refreshAccessToken()) !== "refreshed") return result;
  return request<T>(path, withToken(tokenStore.get()));
}

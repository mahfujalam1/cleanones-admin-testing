import { apiBase } from "@/utils/baseUrl";
import { tokenStore } from "./tokenStore";

export type RefreshOutcome =
  | "refreshed"
  | "unauthenticated"
  | "unavailable";

const FAILURE_COOLDOWN_MS = 60_000;

let inFlight: Promise<RefreshOutcome> | null = null;
let blockedUntil = 0;

export function refreshAccessToken(): Promise<RefreshOutcome> {
  if (Date.now() < blockedUntil) return Promise.resolve("unavailable");

  inFlight ??= (async () => {
    try {

      const response = await fetch(`${apiBase()}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) return "unauthenticated";

      if (!response.ok) {
        blockedUntil = Date.now() + FAILURE_COOLDOWN_MS;
        return "unavailable";
      }

      const accessToken = ((await response.json()) as { data?: { accessToken?: string } })?.data?.accessToken;
      if (!accessToken) return "unauthenticated";

      tokenStore.set(accessToken);
      blockedUntil = 0;
      return "refreshed";
    } catch {
      blockedUntil = Date.now() + FAILURE_COOLDOWN_MS;
      return "unavailable";
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export function clearRefreshCooldown() {
  blockedUntil = 0;
}

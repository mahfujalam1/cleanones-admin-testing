import { decodeJwt } from "./jwt";


export const REFRESH_COOKIE = "refreshToken";
export const SESSION_COOKIE = "cleanones_session";

/** The only two roles this portal serves. Every other API role is refused at sign-in. */
export type ServiceRole = "admin" | "manager";

/** Roles this dashboard renders for. */
export type DashboardRole = "ADMIN" | "MANAGER";

/** The signed-in identity the dashboard renders. */
export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: DashboardRole;
  profilePhoto?: string;
};

const DASHBOARD_ROLE_BY_SERVICE_ROLE: Record<ServiceRole, DashboardRole> = {
  admin: "ADMIN",
  manager: "MANAGER",
};

/** Maps an API role onto a dashboard role, or null when the account may not sign in here. */
export function toDashboardRole(role: string | undefined | null): DashboardRole | null {
  if (!role) return null;
  const normalized = role.trim().toLowerCase();
  const match = (Object.keys(DASHBOARD_ROLE_BY_SERVICE_ROLE) as ServiceRole[]).find(
    (key) => key === normalized,
  );
  return match ? DASHBOARD_ROLE_BY_SERVICE_ROLE[match] : null;
}

/**
 * Builds the signed-in identity from the access token's claims, falling back to values the
 * login response supplied. Returns null when the account's role may not use this portal.
 */
export function userFromAccessToken(
  token: string,
  fallbacks: { email?: string; role?: string | null } = {},
): DashboardUser | null {
  const claims = decodeJwt(token) ?? {};
  const role = toDashboardRole(claims.role ?? fallbacks.role);
  const email = claims.email ?? fallbacks.email;
  if (!role || !email) return null;

  return {
    id: claims.id ?? claims._id ?? claims.userId ?? email,
    // The API exposes no profile endpoint yet, so the display name falls back to the local part
    // of the address. Replace this with the real profile call once that route exists.
    name: claims.name ?? email.split("@")[0],
    email,
    role,
  };
}

export function readCookie(name: string, cookieHeader?: string): string | null {
  const source = cookieHeader ?? (typeof document === "undefined" ? "" : document.cookie);
  for (const part of source.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() !== name) continue;
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return null;
}

export function hasSessionMarker(): boolean {
  return readCookie(SESSION_COOKIE) !== null;
}

export function writeSessionMarker(role: DashboardRole) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? " Secure;" : "";
  // Matches the backend's seven-day refresh token lifetime.
  document.cookie = `${SESSION_COOKIE}=${role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;${secure}`;
}

export function clearSessionMarker() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax;`;
}

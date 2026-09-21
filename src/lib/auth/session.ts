import { decodeJwt } from "./jwt";


export const REFRESH_COOKIE = "refreshToken";
export const SESSION_COOKIE = "cleanones_session";


export type ServiceRole = "admin" | "manager";


export type DashboardRole = "ADMIN" | "MANAGER";


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


export function toDashboardRole(role: string | undefined | null): DashboardRole | null {
  if (!role) return null;
  const normalized = role.trim().toLowerCase();
  const match = (Object.keys(DASHBOARD_ROLE_BY_SERVICE_ROLE) as ServiceRole[]).find(
    (key) => key === normalized,
  );
  return match ? DASHBOARD_ROLE_BY_SERVICE_ROLE[match] : null;
}



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

export function writeSessionMarker(role: DashboardRole, persist = true) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? " Secure;" : "";
  const lifetime = persist ? ` max-age=${7 * 24 * 60 * 60};` : "";
  document.cookie = `${SESSION_COOKIE}=${role}; path=/; SameSite=Lax;${lifetime}${secure}`;
}

export function clearSessionMarker() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax;`;
}

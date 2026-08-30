export type DashboardRole = "SUPER_ADMIN" | "MANAGER";

export type RoutePermission = {
  name: string;
  href: string;
  section: "Operations" | "Quality Control";
};

export const MANAGER_ACCESS_STORAGE_KEY = "cleanones-manager-route-access";
export const MANAGERS_STORAGE_KEY = "cleanones-managers";

export type ManagerRecord = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "BLOCKED";
  lastActive: string;
};

export const defaultManagers: ManagerRecord[] = [
  { id: "m-1", name: "Kaz Putters", email: "manager@cleanones.nl", status: "ACTIVE", lastActive: "Today, 09:42" },
  { id: "m-2", name: "David de Vries", email: "david@cleanones.nl", status: "ACTIVE", lastActive: "Yesterday, 16:18" },
  { id: "m-3", name: "Sanne Bakker", email: "sanne@cleanones.nl", status: "ACTIVE", lastActive: "12 Aug, 14:05" },
];

export const routePermissions: RoutePermission[] = [
  { name: "Dashboard", href: "/", section: "Operations" },
  { name: "Live Operations", href: "/live-operations", section: "Operations" },
  { name: "Roster", href: "/roster", section: "Operations" },
  { name: "Shift Monitoring", href: "/shift-monitoring", section: "Operations" },
  { name: "Workers", href: "/users", section: "Operations" },
  { name: "Clients", href: "/clients", section: "Operations" },
  { name: "Chat", href: "/chat", section: "Operations" },
  { name: "Locations", href: "/locations", section: "Operations" },
  { name: "Rooms", href: "/rooms", section: "Operations" },
  { name: "Cleaning Plans", href: "/cleaning-plans", section: "Operations" },
  { name: "Extra Services", href: "/extra-services", section: "Operations" },
  { name: "Photo Reviews", href: "/photo-reviews", section: "Quality Control" },
  { name: "Escalations", href: "/escalations", section: "Quality Control" },
  { name: "Reports", href: "/reports", section: "Quality Control" },
  { name: "Notifications", href: "/notifications", section: "Quality Control" },
  { name: "Settings", href: "/settings", section: "Quality Control" },
];

export const defaultManagerAccess = routePermissions.map((route) => route.href);

export function getStoredManagerAccess(): string[] {
  if (typeof window === "undefined") return defaultManagerAccess;
  const saved = window.localStorage.getItem(MANAGER_ACCESS_STORAGE_KEY);
  if (!saved) return defaultManagerAccess;
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : defaultManagerAccess;
  } catch {
    return defaultManagerAccess;
  }
}

export function getStoredManagers(): ManagerRecord[] {
  if (typeof window === "undefined") return defaultManagers;
  const saved = window.localStorage.getItem(MANAGERS_STORAGE_KEY);
  if (!saved) return defaultManagers;
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : defaultManagers;
  } catch {
    return defaultManagers;
  }
}

export function getManagerByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return getStoredManagers().find((manager) => manager.email.toLowerCase() === normalized) ?? getStoredManagers()[0];
}

export function managerIsBlocked(id: string) {
  return getStoredManagers().find((manager) => manager.id === id)?.status === "BLOCKED";
}

export function routeIsAllowed(pathname: string, allowedRoutes: string[]) {
  return allowedRoutes.some((route) => route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`));
}

export function getFirstAllowedRoute(allowedRoutes: string[]) {
  return routePermissions.find((route) => allowedRoutes.includes(route.href))?.href ?? null;
}

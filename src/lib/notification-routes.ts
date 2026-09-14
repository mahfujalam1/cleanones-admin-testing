import type { NotificationItem } from "@/redux/api/endpoints/notifications.api";
import type { NotificationApi } from "@/services/actions/notifications";

const dashboardSections = new Set([
  "roster",
  "shift-monitoring",
  "workers",
  "clients",
  "chat",
  "locations",
  "rooms",
  "cleaning-plans",
  "extra-services",
  "photo-reviews",
  "escalations",
  "reports",
  "settings",
]);

const routeByType: Record<string, string> = {
  photo_review: "/photo-reviews",
  photo_approved: "/photo-reviews",
  photo_rejected: "/photo-reviews",
  escalation_created: "/escalations",
  escalation_updated: "/escalations",
  escalation_resolved: "/escalations",
  new_message: "/chat",
  extra_service_request: "/extra-services",
  shift_reminder: "/roster",
  shift_started: "/shift-monitoring",
  shift_completed: "/shift-monitoring",
};

const routeByEntity: Record<string, string> = {
  chat: "/chat",
  escalation: "/escalations",
  photo_review: "/photo-reviews",
  photo: "/photo-reviews",
  shift: "/shift-monitoring",
  cleaning_plan: "/cleaning-plans",
  plan: "/cleaning-plans",
  extra_service: "/extra-services",
  worker: "/workers",
  client: "/clients",
  invoice: "/workers",
};

export function resolveNotificationRoute(item: NotificationItem | NotificationApi): string {
  // If entity is provided in data
  const entity = (item as NotificationItem).data?.entity?.toLowerCase();
  if (entity && routeByEntity[entity]) {
    return routeByEntity[entity];
  }

  // Check type or notification_type
  const type = ((item as NotificationItem).type || (item as NotificationApi).notification_type || "").toLowerCase();
  if (routeByType[type]) {
    return routeByType[type];
  }

  if (type === "approval_request") {
    return (item as any).data?.client_id ? "/clients" : "/workers";
  }

  const route = (item as any).data?.route;
  if (typeof route === "string") {
    const section = route.replace(/^\/manager\//, "").split("/")[0];
    if (section && dashboardSections.has(section)) return `/${section}`;
  }

  return "";
}

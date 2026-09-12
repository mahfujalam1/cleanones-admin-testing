import type { NotificationApi } from "@/services/actions/notifications";

// Dashboard sections a notification can legitimately land on. The backend's `data.route`
// points at manager/mobile paths (e.g. "/manager/escalations/esc_x"), which do not exist
// here, so it is only used to recover the section name.
const dashboardSections = new Set([
  "roster",
  "shift-monitoring",
  "users",
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

/**
 * Returns the dashboard path a notification should open, or "" when the notification has
 * no page to go to (a support ticket, for instance, has no screen in this dashboard yet).
 */
export function resolveNotificationRoute(item: NotificationApi): string {
  if (item.route_type === "chat") return "/chat";

  const byType = routeByType[item.notification_type];
  if (byType) return byType;

  // Signups are split across two screens depending on who signed up.
  if (item.notification_type === "approval_request") {
    return item.data?.client_id ? "/clients" : "/users";
  }

  const section = item.data?.route?.replace(/^\/manager\//, "").split("/")[0];
  return section && dashboardSections.has(section) ? `/${section}` : "";
}

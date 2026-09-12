import { authenticated } from "./auth";

export type NotificationData = { route?: string; deeplink?: string; review_id?: string; escalation_id?: string; conversation_id?: string; worker_id?: string; client_id?: string; support_message_id?: string; shift_id?: string | null; photo_id?: string; photo_url?: string };
export type NotificationApi = { id: string; title: string; message: string; time_ago: string; notification_type: string; route_type?: string; data?: NotificationData; is_read: boolean; created_at: string };
export async function getNotifications(page = 1, limit = 100) { return authenticated<{ total_count: number; page: number; limit: number; has_more: boolean; unread_count: number; notifications: NotificationApi[] }>(`/manager/notifications?page=${page}&limit=${limit}`, { method: "GET" }); }
export async function markAllNotificationsRead() { return authenticated<string>("/manager/notifications/mark-all-read", { method: "POST" }); }
export async function markNotificationRead(id: string) { return authenticated<string>(`/manager/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" }); }
/** Pass delete_all to clear every notification; otherwise only the listed ids are removed. */
export async function bulkDeleteNotifications(input: { notification_ids?: string[]; delete_all?: boolean }) {
    return authenticated<{ deleted_count: number; message: string }>("/manager/notifications/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_ids: input.notification_ids ?? [], delete_all: Boolean(input.delete_all) }),
    });
}
export async function deleteNotification(id: string) { return authenticated<string>(`/manager/notifications/${encodeURIComponent(id)}`, { method: "DELETE" }); }

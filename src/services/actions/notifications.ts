import { authenticated } from "./auth";

export type NotificationData = { route?: string; deeplink?: string; review_id?: string; escalation_id?: string; conversation_id?: string; worker_id?: string; client_id?: string; support_message_id?: string; shift_id?: string | null; photo_id?: string; photo_url?: string };
export type NotificationApi = { id: string; title: string; message: string; time_ago: string; notification_type: string; route_type?: string; data?: NotificationData; is_read: boolean; createdAt: string };
export async function getNotifications(page = 1, limit = 100) { return authenticated<{ total_count: number; page: number; limit: number; has_more: boolean; unread_count: number; notifications: NotificationApi[] }>(`/manager/notifications?page=${page}&limit=${limit}`, { method: "GET" }); }
export async function deleteNotification(id: string) { return authenticated<string>(`/manager/notifications/${encodeURIComponent(id)}`, { method: "DELETE" }); }

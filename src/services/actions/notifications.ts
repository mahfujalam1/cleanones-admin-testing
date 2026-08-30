"use server";
import { authenticated } from "./auth";

export type NotificationApi = { id: string; title: string; message: string; time_ago: string; notification_type: string; is_read: boolean; created_at: string };
export async function getNotifications(page = 1, limit = 100) { return authenticated<{ total_count: number; page: number; limit: number; has_more: boolean; unread_count: number; notifications: NotificationApi[] }>(`/manager/notifications?page=${page}&limit=${limit}`, { method: "GET" }); }
export async function markAllNotificationsRead() { return authenticated<string>("/manager/notifications/mark-all-read", { method: "POST" }); }
export async function markNotificationRead(id: string) { return authenticated<string>(`/manager/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" }); }
export async function deleteNotification(id: string) { return authenticated<string>(`/manager/notifications/${encodeURIComponent(id)}`, { method: "DELETE" }); }

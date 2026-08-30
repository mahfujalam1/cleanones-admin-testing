"use client";
import { useEffect, useState } from "react";
import { MdClose, MdNotificationsNone } from "react-icons/md";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";
import { deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead, type NotificationApi } from "@/services/actions/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationApi[]>([]);
  const [unreadCount, setUnreadCount] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [updatingAll, setUpdatingAll] = useState(false);
  useEffect(() => { void getNotifications().then((result) => { setLoading(false); if (!result.success) return setError(result.error); setNotifications(result.data.notifications); setUnreadCount(result.data.unread_count); }); }, []);
  const read = async (item: NotificationApi) => { if (item.is_read) return; const result = await markNotificationRead(item.id); if (!result.success) return setError(result.error); setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_read: true } : entry)); setUnreadCount((count) => Math.max(0, count - 1)); };
  const markAll = async () => { setUpdatingAll(true); const result = await markAllNotificationsRead(); setUpdatingAll(false); if (!result.success) return setError(result.error); setNotifications((current) => current.map((item) => ({ ...item, is_read: true }))); setUnreadCount(0); };
  const dismiss = async (item: NotificationApi) => { const result = await deleteNotification(item.id); if (!result.success) return setError(result.error); setNotifications((current) => current.filter((entry) => entry.id !== item.id)); if (!item.is_read) setUnreadCount((count) => Math.max(0, count - 1)); };
  return <div className="space-y-5 pb-10">
    <div className="flex items-center justify-between border-b border-gray-200 pb-5"><div className="flex items-center gap-2"><MdNotificationsNone className="text-xl text-slate-800" /><h2 className="text-lg font-bold text-slate-950">Notification Center</h2>{unreadCount > 0 && <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">{unreadCount} new</span>}</div><button disabled={updatingAll || unreadCount === 0} onClick={() => void markAll()} className="text-sm font-semibold text-sky-500 hover:underline disabled:opacity-40">{updatingAll ? "Marking..." : "Mark all read"}</button></div>
    {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <DetailSkeleton blocks={8} /> : <div className="space-y-2">{notifications.map((item) => <article key={item.id} onClick={() => void read(item)} className={`relative cursor-pointer rounded border px-4 py-4 pr-12 shadow-sm ${!item.is_read ? "border-sky-200 bg-emerald-50" : "border-gray-200 bg-white"}`}><div className="flex items-center gap-2"><h3 className="text-sm font-bold text-slate-950">{item.title}</h3>{!item.is_read && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}</div><p className="mt-1 text-sm text-slate-600">{item.message}</p><div className="mt-2 flex gap-3 text-xs text-slate-400"><span>{item.time_ago || new Date(item.created_at).toLocaleString()}</span><span>{item.notification_type.replaceAll("_", " ")}</span></div><button onClick={(event) => { event.stopPropagation(); void dismiss(item); }} className="absolute right-4 top-4 rounded p-1 text-slate-300 hover:bg-white hover:text-slate-500" aria-label={`Dismiss ${item.title}`}><MdClose className="text-lg" /></button></article>)}{notifications.length === 0 && <div className="rounded border bg-white py-16 text-center text-sm text-slate-500">No notifications</div>}</div>}
  </div>;
}

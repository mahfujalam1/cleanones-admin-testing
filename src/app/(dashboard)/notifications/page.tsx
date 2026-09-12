"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TbBell, TbChevronLeft, TbChevronRight, TbTrash } from "react-icons/tb";
import { bulkDeleteNotifications, deleteNotification, markAllNotificationsRead, markNotificationRead, type NotificationApi } from "@/services/actions/notifications";
import { useGetNotificationsQuery } from "@/redux/api/dashboardApi";
import { getLocale, localizePath } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import { resolveNotificationRoute } from "@/lib/notification-routes";

const limit = 8;

export default function NotificationsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [updatingAll, setUpdatingAll] = useState(false);
  const [opening, setOpening] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const { data: notifRes, isLoading: loading, refetch } = useGetNotificationsQuery({ page, limit });
  const notifications: NotificationApi[] = notifRes?.notifications ?? [];
  const hasMore = Boolean(notifRes?.has_more);
  const unreadCount = notifRes?.unread_count ?? notifications.filter((item) => !item.is_read).length;

  // Opening a notification marks it read first, so the unread badge is already correct
  // when the user comes back from whichever screen it points at.
  const open = async (item: NotificationApi) => {
    const target = resolveNotificationRoute(item);
    if (!item.is_read) {
      setOpening(item.id);
      const result = await markNotificationRead(item.id);
      setOpening("");
      if (!result.success) return setError(result.error);
      if (!target) return void refetch();
    }
    if (!target) return;
    void refetch();
    router.push(localizePath(target, locale));
  };

  // Selections are per page: the toolbar counts what is visible, so carrying ids across
  // pages would let a delete hit rows the user can no longer see.
  useEffect(() => { setSelectedIds(new Set()); }, [page]);

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = notifications.length > 0 && notifications.every((item) => selectedIds.has(item.id));
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(notifications.map((item) => item.id)));
  };

  const runBulkDelete = async (input: { notification_ids?: string[]; delete_all?: boolean }) => {
    setBulkBusy(true);
    const result = await bulkDeleteNotifications(input);
    setBulkBusy(false);
    if (!result.success) return setError(result.error);
    setError("");
    setSelectedIds(new Set());
    // The current page can end up empty after a bulk delete, so step back when needed.
    if (input.delete_all || notifications.length === (input.notification_ids?.length ?? 0)) setPage(1);
    void refetch();
  };

  const markAll = async () => {
    setUpdatingAll(true);
    const result = await markAllNotificationsRead();
    setUpdatingAll(false);
    if (!result.success) return setError(result.error);
    void refetch();
  };

  const dismiss = async (item: NotificationApi) => {
    const result = await deleteNotification(item.id);
    if (!result.success) return setError(result.error);
    void refetch();
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">{t.notifications.notificationCenter}</h1>
          <p className="mt-0.5 text-xs text-slate-500">Review your activity updates.</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white">
              {unreadCount} {t.notifications.newNotifications}
            </span>
          )}
          <button
            disabled={updatingAll || unreadCount === 0}
            onClick={() => void markAll()}
            className="text-xs font-semibold text-sky-500 hover:underline disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            {updatingAll ? t.notifications.marking : t.notifications.markAllRead}
          </button>
        </div>
      </div>

      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}

      {/* Selection toolbar */}
      {notifications.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-white px-3 py-2">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 accent-sky-500 cursor-pointer"
            />
            Select all on this page
          </label>
          {selectedIds.size > 0 && (
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-600">
              {selectedIds.size} selected
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
                >
                  Clear
                </button>
                <button
                  disabled={bulkBusy}
                  onClick={() => void runBulkDelete({ notification_ids: Array.from(selectedIds) })}
                  className="flex h-8 items-center gap-1.5 rounded bg-red-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  <TbTrash className="text-sm" /> {bulkBusy ? "Deleting..." : `Delete ${selectedIds.size}`}
                </button>
              </>
            )}
            <button
              disabled={bulkBusy}
              onClick={() => void runBulkDelete({ delete_all: true })}
              className="h-8 rounded border border-red-200 px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              title="Delete every notification, not just this page"
            >
              Delete all
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded border border-slate-200 bg-white p-3.5">
              <span className="h-9 w-9 shrink-0 animate-pulse rounded bg-slate-100" />
              <div className="flex-1 space-y-2">
                <span className="block h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                <span className="block h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                <span className="block h-2 w-24 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((item) => {
            const target = resolveNotificationRoute(item);
            const actionable = Boolean(target) || !item.is_read;
            return (
              <article
                key={item.id}
                onClick={() => void open(item)}
                className={`rounded border p-3.5 transition-colors ${actionable ? "cursor-pointer hover:border-slate-300" : "cursor-default"} ${
                  item.is_read ? "border-slate-200 bg-white" : "border-sky-200 bg-sky-50/40"
                } ${opening === item.id ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Selecting must not also open the notification. */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Select ${item.title}`}
                    className="mt-3 h-4 w-4 shrink-0 accent-sky-500 cursor-pointer"
                  />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-sky-100 bg-sky-50 text-sky-500">
                    <TbBell className="text-base" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-bold text-slate-800">{item.title}</p>
                      {!item.is_read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-label="Unread" />}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.message}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                      <time>{item.time_ago || new Date(item.created_at).toLocaleString()}</time>
                      <span className="capitalize">{item.notification_type.replaceAll("_", " ")}</span>
                      {target && (
                        <span className="flex items-center gap-0.5 font-semibold text-sky-500">
                          {`Open ${target.slice(1).replaceAll("-", " ")}`}
                          <TbChevronRight className="text-xs" />
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      void dismiss(item);
                    }}
                    className="shrink-0 rounded p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    aria-label={`Delete ${item.title}`}
                    title="Delete notification"
                  >
                    <TbTrash className="text-base" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded border border-slate-200 bg-white py-16 text-center text-xs text-slate-500">
          {t.notifications.noNotifications}
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
        <button
          disabled={page === 1 || loading}
          onClick={() => setPage((current) => current - 1)}
          className="flex h-8 items-center gap-1 rounded border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <TbChevronLeft className="text-sm" /> Previous
        </button>
        <button
          disabled={!hasMore || loading}
          onClick={() => setPage((current) => current + 1)}
          className="flex h-8 items-center gap-1 rounded border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          Next <TbChevronRight className="text-sm" />
        </button>
      </div>
    </div>
  );
}

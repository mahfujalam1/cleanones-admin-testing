"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TbBell, TbChevronRight, TbTrash } from "react-icons/tb";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { getUiTranslation } from "@/lib/translations";
import {
  useGetNotificationsQuery,
  useSeeNotificationsMutation,
  useDeleteNotificationMutation,
  type NotificationItem,
} from "@/redux/api/endpoints/notifications.api";
import { getLocale, localizePath } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import { resolveNotificationRoute } from "@/lib/notification-routes";
import { apiError } from "@/redux/api/apiError";

const limit = 8;

function formatNotificationTime(dateStr?: string): string {
  if (!dateStr) return "Recently";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 5) return "Recently";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "Recently";
  }
}

export default function NotificationsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);
  const ui = getUiTranslation(locale);

  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [updatingAll, setUpdatingAll] = useState(false);
  const [opening, setOpening] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  // RTK Query hooks using Swagger APIs
  const {
    data: notifRes,
    isLoading: loading,
    refetch,
  } = useGetNotificationsQuery({
    page,
    limit,
    sort: "-createdAt",
  });

  const [seeNotificationsMutation] = useSeeNotificationsMutation();
  const [deleteNotificationMutation] = useDeleteNotificationMutation();

  const notifications: NotificationItem[] = notifRes?.result ?? [];
  const meta = notifRes?.meta;
  const unreadCount = meta?.unreadCount ?? notifications.filter((item) => !item.isRead).length;

  // Opening a notification navigates to its route
  const open = async (item: NotificationItem) => {
    const target = resolveNotificationRoute(item);
    if (!item.isRead) {
      setOpening(item._id);
      try {
        await seeNotificationsMutation().unwrap();
      } catch {}
      setOpening("");
      if (!target) return void refetch();
    }
    if (!target) return;
    void refetch();
    router.push(localizePath(target, locale));
  };

  // Selections are per page
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page]);

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected =
    notifications.length > 0 && notifications.every((item) => selectedIds.has(item._id));
  const toggleSelectAll = () => {
    setSelectedIds(
      allSelected ? new Set() : new Set(notifications.map((item) => item._id))
    );
  };

  /** What the confirmation dialog is currently asking about. */
  const [pendingDelete, setPendingDelete] = useState<
    { kind: "one"; item: NotificationItem } | { kind: "selected" } | { kind: "all" } | null
  >(null);

  const runBulkDelete = async (input: { notification_ids?: string[]; delete_all?: boolean }) => {
    setBulkBusy(true);
    setError("");
    try {
      const idsToDelete = input.delete_all
        ? notifications.map((item) => item._id)
        : (input.notification_ids ?? []);

      await Promise.all(idsToDelete.map((id) => deleteNotificationMutation(id).unwrap()));
      setSelectedIds(new Set());
      if (input.delete_all || notifications.length === (input.notification_ids?.length ?? 0)) {
        setPage((p) => Math.max(1, p - 1));
      }
      void refetch();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBulkBusy(false);
    }
  };

  const markAll = async () => {
    setUpdatingAll(true);
    setError("");
    try {
      await seeNotificationsMutation().unwrap();
      void refetch();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setUpdatingAll(false);
    }
  };

  const dismiss = async (item: NotificationItem) => {
    setBulkBusy(true);
    try {
      await deleteNotificationMutation(item._id).unwrap();
      void refetch();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBulkBusy(false);
    }
  };

  /** Runs whichever delete the dialog was opened for, then closes it. */
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "one") await dismiss(pendingDelete.item);
    else if (pendingDelete.kind === "all") await runBulkDelete({ delete_all: true });
    else await runBulkDelete({ notification_ids: Array.from(selectedIds) });
    setPendingDelete(null);
  };

  const deletePrompt =
    pendingDelete?.kind === "one"
      ? { title: "Delete notification?", description: `"${pendingDelete.item.title}" will be removed.` }
      : pendingDelete?.kind === "all"
      ? { title: "Delete all notifications?", description: "Every notification on this page will be removed." }
      : {
          title: `Delete ${selectedIds.size} notification${selectedIds.size === 1 ? "" : "s"}?`,
          description: "The selected notifications will be removed.",
        };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">{t.notifications.notificationCenter}</h1>
          <p className="mt-0.5 text-xs text-slate-500">{ui.reviewUpdates}</p>
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
            {ui.selectAllOnPage}
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
                  onClick={() => setPendingDelete({ kind: "selected" })}
                  className="flex h-8 items-center gap-1.5 rounded bg-red-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  <TbTrash className="text-sm" /> {bulkBusy ? "Deleting..." : `Delete ${selectedIds.size}`}
                </button>
              </>
            )}
            <button
              disabled={bulkBusy}
              onClick={() => setPendingDelete({ kind: "all" })}
              className="h-8 rounded border border-red-200 px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              title={ui.deleteEveryNotification}
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
            const actionable = Boolean(target) || !item.isRead;
            const categoryLabel = item.type
              ? item.type.replaceAll("_", " ")
              : item.data?.entity
              ? item.data.entity.replaceAll("_", " ")
              : "";

            return (
              <article
                key={item._id}
                onClick={() => void open(item)}
                className={`rounded border p-3.5 transition-colors ${
                  actionable ? "cursor-pointer hover:border-slate-300" : "cursor-default"
                } ${
                  item.isRead ? "border-slate-200 bg-white" : "border-sky-200 bg-sky-50/40"
                } ${opening === item._id ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Selecting must not also open the notification */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item._id)}
                    onChange={() => toggleSelect(item._id)}
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
                      {!item.isRead && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-label="Unread" />
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.message}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                      <time>{formatNotificationTime(item.createdAt)}</time>
                      {categoryLabel && <span className="capitalize">{categoryLabel}</span>}
                      {target && (
                        <span className="flex items-center gap-0.5 font-semibold text-sky-500">
                          {`Open ${target.replace(/^\//, "").split("?")[0].replaceAll("-", " ")}`}
                          <TbChevronRight className="text-xs" />
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setPendingDelete({ kind: "one", item });
                    }}
                    className="shrink-0 rounded p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    aria-label={`Delete ${item.title}`}
                    title={ui.deleteNotification}
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

      <BackendPagination
        page={page}
        limit={limit}
        total={meta?.total ?? notifications.length}
        onPageChange={setPage}
        itemLabel="notifications"
      />

      {pendingDelete && (
        <ConfirmDialog
          title={deletePrompt.title}
          description={deletePrompt.description}
          confirmText="Delete"
          loading={bulkBusy}
          onConfirm={() => void confirmDelete()}
          onClose={() => !bulkBusy && setPendingDelete(null)}
        />
      )}
    </div>
  );
}

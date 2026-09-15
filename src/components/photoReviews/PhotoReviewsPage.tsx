"use client";

import { useMemo, useState } from "react";
import { Search, Eye, Image as ImageIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import { TableSkeleton } from "@/components/shared/SkeletonLoader";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { getUiTranslation } from "@/lib/translations";
import { apiError } from "@/redux/api/apiError";
import {
  useGetShiftPhotoReviewsQuery,
  type PhotoReviewTask,
} from "@/redux/api/photoReviewsApi";
import { PhotoReviewDetail } from "./ReviewDetail";

const PAGE_SIZE = 10;

const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
};

/** The payload has no id, so a row is identified by what makes the instance unique. */
export const rowKey = (task: PhotoReviewTask) =>
  `${task.shift_date}-${task.cleaning_name}-${task.room_name}-${task.task_name}`;

export function PhotoReviewsPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);
  const ui = getUiTranslation(locale);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PhotoReviewTask | null>(null);

  // No arguments: the endpoint defaults to the last 30 days through today.
  const { data: tasks = [], isLoading: loading, error } = useGetShiftPhotoReviewsQuery();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((task) =>
      [task.task_name, task.room_name, task.location_name, task.cleaning_name, task.address]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [tasks, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tableHeaders = [
    ui.task,
    t.extraServices.room,
    t.extraServices.location,
    ui.cleaningPlanColumn,
    t.roster.date,
    t.common.duration,
    t.common.photos,
    t.common.actions || t.photoReviews.actions,
  ];

  if (selected) {
    return <PhotoReviewDetail task={selected} onClose={() => setSelected(null)} />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col space-y-4 overflow-hidden">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {apiError(error)}
        </p>
      )}

      {/* Toolbar */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={ui.searchByTaskRoomLocation}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0ea5e9] focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
          />
        </div>

        {!loading && (
          <span className="whitespace-nowrap rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-sm font-semibold text-sky-700">
            {filtered.length} {filtered.length === 1 ? "task" : "tasks"} with photos
          </span>
        )}
      </div>

      {/* Table */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {tableHeaders.map((header, index) => (
                  <th
                    key={index}
                    className="whitespace-nowrap px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={tableHeaders.length} className="p-0">
                    <TableSkeleton rows={7} columns={tableHeaders.length} />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableHeaders.length}
                    className="py-16 text-center text-sm text-slate-400"
                  >
                    {t.photoReviews.noReviews}
                  </td>
                </tr>
              ) : (
                paginated.map((task) => (
                  <tr key={rowKey(task)} className="transition-colors hover:bg-sky-50/40">
                    <td className="max-w-[260px] px-5 py-4 text-sm font-semibold leading-snug text-slate-900">
                      {task.task_name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                      {task.room_name}
                    </td>
                    <td className="max-w-[220px] px-5 py-4 text-sm text-slate-600">
                      <span className="block truncate font-medium text-slate-800">
                        {task.location_name}
                      </span>
                      {task.address && (
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {task.address}
                        </span>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-5 py-4 text-sm text-slate-600">
                      {task.cleaning_name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                      {formatDate(task.shift_date)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                      {task.duration_minutes}m
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                        {task.uploaded_photos?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(task)}
                        className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2 text-sm font-semibold text-[#0ea5e9] transition-colors hover:border-sky-300 hover:bg-sky-100"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-3">
            <BackendPagination
              page={page}
              limit={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
              itemLabel="tasks"
            />
          </div>
        )}
      </div>
    </div>
  );
}

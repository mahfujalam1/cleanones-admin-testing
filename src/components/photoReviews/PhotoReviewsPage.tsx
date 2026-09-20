"use client";

import { useMemo, useState } from "react";
import { Search, Eye, Image as ImageIcon, RefreshCw, SlidersHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import { TableSkeleton } from "@/components/shared/SkeletonLoader";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { getUiTranslation } from "@/lib/translations";
import { apiError } from "@/redux/api/apiError";
import {
  useGetShiftPhotoReviewsQuery,
  type PhotoReviewTask,
  type UploadedPhoto,
} from "@/redux/api/photoReviewsApi";
import { useGetCleaningPlanListQuery } from "@/redux/api/endpoints/cleaningPlans.api";
import { useGetLocationCatalogQuery } from "@/redux/api/endpoints/catalog.api";
import { PhotoReviewDetail } from "./ReviewDetail";

const PAGE_SIZE = 10;
type QueueFilter = "needs" | "spot" | "not-checked" | "passed" | "all";

const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
};

/** The payload has no id, so a row is identified by what makes the instance unique. */
export const rowKey = (task: PhotoReviewTask) =>
  `${task.shift_date}-${task.cleaning_name}-${task.room_name}-${task.task_name}`;

const photoPriority = (photo?: UploadedPhoto) => {
  if (!photo) return 5;
  if (photo.forced_accept) return 0;
  if (photo.ai_subject_matches === false) return 1;
  if (photo.ai_status === "failed") return 2;
  if (photo.ai_status === "review") return 3;
  if (photo.audit_sampled) return 4;
  if (!photo.ai_status || ["error", "pending", "skipped"].includes(photo.ai_status)) return 5;
  return 6;
};

const headlinePhoto = (task: PhotoReviewTask) =>
  [...(task.uploaded_photos ?? [])].sort((a, b) => photoPriority(a) - photoPriority(b))[0];

const statusDetails = (photo?: UploadedPhoto) => {
  if (!photo) return { label: "Not checked", className: "border-slate-200 bg-slate-50 text-slate-600" };
  if (photo.forced_accept) return { label: "3 retries", className: "border-orange-200 bg-orange-50 text-orange-700" };
  if (photo.ai_subject_matches === false) return { label: "Wrong subject", className: "border-red-200 bg-red-50 text-red-700" };
  if (photo.audit_sampled) return { label: "Spot check", className: "border-violet-200 bg-violet-50 text-violet-700" };
  if (photo.ai_status === "pending") return { label: "Checking…", className: "border-sky-200 bg-sky-50 text-sky-700" };
  if (photo.ai_status === "passed") return { label: "Looks good", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  if (photo.ai_status === "failed") return { label: "Problem found", className: "border-red-200 bg-red-50 text-red-700" };
  if (photo.ai_status === "review") return { label: "Needs review", className: "border-amber-200 bg-amber-50 text-amber-700" };
  return { label: "Not checked", className: "border-slate-200 bg-slate-50 text-slate-600" };
};

const belongsToQueue = (task: PhotoReviewTask, queue: QueueFilter) => {
  const photos = task.uploaded_photos ?? [];
  if (queue === "all") return true;
  if (queue === "needs") {
    return photos.some((photo) =>
      photo.forced_accept ||
      photo.ai_subject_matches === false ||
      photo.ai_status === "failed" ||
      photo.ai_status === "review"
    );
  }
  if (queue === "spot") return photos.some((photo) => photo.audit_sampled);
  if (queue === "passed") return photos.length > 0 && photos.every((photo) => photo.ai_status === "passed");
  return photos.some((photo) => !photo.ai_status || ["pending", "error", "skipped"].includes(photo.ai_status));
};

export function PhotoReviewsPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);
  const ui = getUiTranslation(locale);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PhotoReviewTask | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [planId, setPlanId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [queue, setQueue] = useState<QueueFilter>("all");

  const query = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
      planId: planId || undefined,
      locationId: locationId || undefined,
    }),
    [from, to, planId, locationId],
  );
  const { data: tasks = [], isLoading: loading, isFetching, error, refetch } =
    useGetShiftPhotoReviewsQuery(query);
  const { data: planData } = useGetCleaningPlanListQuery({ page: 1, limit: 100 });
  const { data: locations = [] } = useGetLocationCatalogQuery();

  const counts = useMemo(() => ({
    needs: tasks.filter((task) => belongsToQueue(task, "needs")).length,
    spot: tasks.filter((task) => belongsToQueue(task, "spot")).length,
    "not-checked": tasks.filter((task) => belongsToQueue(task, "not-checked")).length,
    passed: tasks.filter((task) => belongsToQueue(task, "passed")).length,
    all: tasks.length,
  }), [tasks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((task) => belongsToQueue(task, queue))
      .filter((task) =>
        !q || [task.task_name, task.room_name, task.location_name, task.cleaning_name, task.address]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .sort((a, b) => {
        const priority = photoPriority(headlinePhoto(a)) - photoPriority(headlinePhoto(b));
        if (priority !== 0) return priority;
        return new Date(b.shift_date).getTime() - new Date(a.shift_date).getTime();
      });
  }, [tasks, search, queue]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tableHeaders = [
    ui.task,
    t.extraServices.room,
    t.extraServices.location,
    ui.cleaningPlanColumn,
    t.roster.date,
    t.common.duration,
    t.common.photos,
    "Review status",
    t.common.actions || t.photoReviews.actions,
  ];

  if (selected) {
    return <PhotoReviewDetail task={selected} onClose={() => setSelected(null)} />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col space-y-3 overflow-hidden">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {apiError(error)}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-primary">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-sm font-semibold text-slate-900">Manager photo review</h1>
              <p className="text-[11px] text-slate-500">Prioritized photos that need a manager check.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <DatePicker value={from} onValueChange={(value) => { setFrom(value); setPage(1); }} placeholder="From date" clearable max={to || undefined} />
          <DatePicker value={to} onValueChange={(value) => { setTo(value); setPage(1); }} placeholder="To date" clearable min={from || undefined} />
          <Select
            value={planId}
            onValueChange={(value) => { setPlanId(value); setPage(1); }}
            placeholder="All cleaning plans"
            options={[
              { value: "", label: "All cleaning plans" },
              ...(planData?.result ?? []).map((plan) => ({ value: plan._id, label: plan.title })),
            ]}
          />
          <Select
            value={locationId}
            onValueChange={(value) => { setLocationId(value); setPage(1); }}
            placeholder="All locations"
            options={[
              { value: "", label: "All locations" },
              ...locations.map((location) => ({ value: location._id, label: location.name })),
            ]}
          />
          <button
            type="button"
            onClick={() => {
              setFrom("");
              setTo("");
              setPlanId("");
              setLocationId("");
              setSearch("");
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Reset filters
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <SlidingTabs
            compact
            value={queue}
            onValueChange={(value) => { setQueue(value as QueueFilter); setPage(1); }}
            options={[
              { value: "needs", label: "Needs my decision", count: counts.needs },
              { value: "spot", label: "Spot checks", count: counts.spot },
              { value: "not-checked", label: "Not checked", count: counts["not-checked"] },
              { value: "passed", label: "Passed", count: counts.passed },
              { value: "all", label: "All", count: counts.all },
            ]}
          />
          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={ui.searchByTaskRoomLocation}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
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
                      {(() => {
                        const status = statusDetails(headlinePhoto(task));
                        return (
                          <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        );
                      })()}
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

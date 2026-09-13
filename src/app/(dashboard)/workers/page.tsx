"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MdAdd } from "react-icons/md";
import { WorkersTable } from "@/components/workers/WorkersTable";
import { WorkerForm } from "@/components/workers/WorkerForm";
import { WorkerDetailModal } from "@/components/workers/WorkerDetailModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { ErrorNotice, SearchInput } from "@/components/shared/ListStates";
import { TableSkeleton } from "@/components/shared/SkeletonLoader";
import { Select } from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  workerName,
  useDeleteWorkerMutation,
  useGetWorkerListQuery,
  type Worker,
  type WorkerSort,
  type WorkerType,
} from "@/redux/api/endpoints/workers.api";
import { apiError } from "@/redux/api/apiError";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

const LIMIT = 10;

const SORT_LABELS: Array<{ value: WorkerSort; label: string }> = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "email", label: "Email A–Z" },
  { value: "-email", label: "Email Z–A" },
  { value: "hourly_rate", label: "Rate low to high" },
  { value: "-hourly_rate", label: "Rate high to low" },
];

export default function WorkersPage() {
  const locale = getLocale(usePathname());
  const t = getDashboardTranslation(locale);

  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const [workerType, setWorkerType] = useState<WorkerType | "">("");
  const [sort, setSort] = useState<WorkerSort>("-created_at");
  const [page, setPage] = useState(1);

  const [formTarget, setFormTarget] = useState<Worker | "new" | null>(null);
  const [viewTarget, setViewTarget] = useState<Worker | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Worker | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => setPage(1), [searchTerm, workerType, sort]);

  const { data, isFetching, error } = useGetWorkerListQuery({
    page,
    limit: LIMIT,
    searchTerm: searchTerm || undefined,
    worker_type: workerType || undefined,
    sort,
  });
  const [deleteWorker, { isLoading: deleting }] = useDeleteWorkerMutation();

  const workers = data?.result ?? [];
  const total = data?.meta.total ?? 0;
  const message = actionError || (error ? apiError(error) : "");

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionError("");
    try {
      await deleteWorker(deleteTarget._id).unwrap();
      setDeleteTarget(null);
    } catch (cause) {
      setActionError(apiError(cause));
    }
  };

  const typeFilters: Array<{ value: WorkerType | ""; label: string }> = [
    { value: "", label: t.common.allWorkers },
    { value: "Employee", label: t.workers.employees },
    { value: "Freelancer", label: t.workers.freelancers },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900">{t.nav.workers}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} {total === 1 ? "worker" : "workers"} on the roster
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormTarget("new")}
          className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-[#0284c7]"
        >
          <MdAdd className="text-base" /> {t.workers.addWorker}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5">
        <div className="w-full min-w-0 sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder={t.workers.searchPlaceholder} />
        </div>

        <div className="flex max-w-full overflow-x-auto rounded-md bg-slate-100 p-0.5 text-xs">
          {typeFilters.map((filter) => (
            <button
              key={filter.value || "all"}
              onClick={() => setWorkerType(filter.value)}
              className={`shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 font-semibold transition-all ${
                workerType === filter.value
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="ml-auto w-full sm:w-48">
          <Select
            value={sort}
            options={SORT_LABELS.map(({ value, label }) => ({ value, label }))}
            onValueChange={(next) => setSort(next as WorkerSort)}
            placeholder="Sort"
          />
        </div>
      </div>

      {message && <ErrorNotice message={message} />}

      {isFetching ? (
        <TableSkeleton />
      ) : (
        <WorkersTable
          workers={workers}
          onViewWorker={setViewTarget}
          onEditWorker={setFormTarget}
          onDeleteWorker={setDeleteTarget}
        />
      )}

      <BackendPagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />

      {formTarget && (
        <WorkerForm
          worker={formTarget === "new" ? undefined : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}

      {viewTarget && (
        <WorkerDetailModal
          workerId={viewTarget._id}
          onClose={() => setViewTarget(null)}
          onEdit={(worker) => {
            setViewTarget(null);
            setFormTarget(worker);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete worker?"
          description={`${workerName(deleteTarget)} will be removed from the roster and their login blocked.`}
          confirmText="Delete"
          loading={deleting}
          onConfirm={() => void confirmDelete()}
          onClose={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

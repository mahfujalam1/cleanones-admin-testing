"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MdAdd, MdUploadFile } from "react-icons/md";
import { WorkersTable } from "@/components/workers/WorkersTable";
import { WorkerForm } from "@/components/workers/WorkerForm";
import { WorkerDetailModal } from "@/components/workers/WorkerDetailModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BulkUploadModal, type BulkUploadColumn } from "@/components/shared/BulkUploadModal";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { ErrorNotice, SearchInput } from "@/components/shared/ListStates";
import { TableSkeleton } from "@/components/shared/SkeletonLoader";
import { Select } from "@/components/ui/select";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  workerName,
  useDeleteWorkerMutation,
  useGetWorkerListQuery,
  useBulkUploadWorkersMutation,
  type Worker,
  type WorkerSort,
  type WorkerType,
} from "@/redux/api/endpoints/workers.api";
import { apiError } from "@/redux/api/apiError";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
import { getDashboardTranslation } from "@/lib/translations";

const LIMIT = 10;

const WORKER_BULK_COLUMNS: BulkUploadColumn[] = [
  { name: "name", required: true },
  { name: "email", required: true, notes: "Must be unique" },
  { name: "phone", required: true, notes: "Must be unique" },
  { name: "worker_type", required: true, notes: "Employee or Freelancer" },
  { name: "password", required: true, notes: "Min 6 characters" },
  { name: "position", required: false },
  { name: "address", required: false },
  { name: "nationality", required: false },
  { name: "base_location", required: false },
  { name: "national_id", required: false },
  { name: "dob", required: false, notes: "e.g. 1995-04-20" },
  { name: "hourly_rate", required: false, notes: "Defaults to 25" },
  { name: "languages", required: false, notes: "Separate with ; or |, e.g. en;da" },
  { name: "working_days", required: false, notes: "Separate with ; or |, e.g. monday;tuesday" },
];

const SAMPLE_WORKERS_CSV = `name,email,phone,worker_type,password,hourly_rate,languages,working_days
Ann Lee,ann@example.com,+4511111111,Employee,secret123,30,en;da,monday;tuesday;friday
Bob Ray,bob@example.com,+4522222222,Freelancer,secret456,,en,`;

const WORKER_BULK_NOTES = [
  "Use ';' or '|' to separate multiple values in languages or working_days (e.g. 'en;da' or 'monday;tuesday'). Do NOT use commas inside a column.",
  "worker_type must be either 'Employee' or 'Freelancer'.",
];

const SORT_LABELS: Array<{ value: WorkerSort; label: string }> = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "email", label: "Email A–Z" },
  { value: "-email", label: "Email Z–A" },
  { value: "hourly_rate", label: "Rate Low To High" },
  { value: "-hourly_rate", label: "Rate High To Low" },
];

export default function WorkersPage() {
  const locale = getLocale(usePathname());
  const ui = getUiTranslation(getLocale(usePathname()));
  const t = getDashboardTranslation(locale);

  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const [workerType, setWorkerType] = useState<WorkerType | "">("");
  const [sort, setSort] = useState<WorkerSort>("-createdAt");
  const [page, setPage] = useState(1);

  const [formTarget, setFormTarget] = useState<Worker | "new" | null>(null);
  const [viewTarget, setViewTarget] = useState<Worker | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Worker | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
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
  const [bulkUploadWorkers] = useBulkUploadWorkersMutation();

  const workers = data?.result ?? [];
  const total = data?.meta.total ?? 0;
  const message = actionError || (error ? apiError(error) : "");

  
  useEffect(() => {
    if (!isFetching && data && workers.length === 0 && page > 1) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [isFetching, data, workers.length, page]);

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
            {total} {ui.workersOnRoster}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBulkUpload(true)}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
          >
            <MdUploadFile className="text-base text-slate-500" /> Bulk Upload
          </button>
          <button
            type="button"
            onClick={() => setFormTarget("new")}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-[#0284c7]"
          >
            <MdAdd className="text-base" /> {t.workers.addWorker}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5">
        <div className="w-full min-w-0 sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder={t.workers.searchPlaceholder} />
        </div>

        <SlidingTabs
          compact
          value={workerType}
          options={typeFilters.map((filter) => ({ value: filter.value, label: filter.label }))}
          onValueChange={(next) => setWorkerType(next as WorkerType | "")}
        />

        <div className="ml-auto w-full sm:w-48">
          <Select
            value={sort}
            options={SORT_LABELS.map(({ value, label }) => ({ value, label }))}
            onValueChange={(next) => setSort(next as WorkerSort)}
            placeholder={ui.sort}
          />
        </div>
      </div>

      {message && <ErrorNotice message={message} />}

      <div key={workerType || "all"} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
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
      </div>

      <BackendPagination
        page={page}
        limit={LIMIT}
        total={total}
        itemCount={workers.length}
        onPageChange={setPage}
      />

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
          title={ui.deleteWorker}
          description={`${workerName(deleteTarget)} will be removed from the roster and their login blocked.`}
          confirmText={ui.delete}
          loading={deleting}
          onConfirm={() => void confirmDelete()}
          onClose={() => !deleting && setDeleteTarget(null)}
        />
      )}

      {showBulkUpload && (
        <BulkUploadModal
          title="Bulk Upload Workers"
          entityName="Workers"
          columns={WORKER_BULK_COLUMNS}
          sampleCsvFilename="workers_template.csv"
          sampleCsvContent={SAMPLE_WORKERS_CSV}
          notes={WORKER_BULK_NOTES}
          onUpload={async (formData) => {
            return await bulkUploadWorkers(formData).unwrap();
          }}
          onClose={() => setShowBulkUpload(false)}
        />
      )}
    </div>
  );
}

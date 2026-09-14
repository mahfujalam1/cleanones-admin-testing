"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MdCheckCircle,
  MdClose,
  MdDeleteOutline,
  MdLocationOn,
  MdOutlinePerson,
  MdOutlineRefresh,
  MdOutlineWarningAmber,
  MdPendingActions,
  MdSearch,
  MdSync,
} from "react-icons/md";
import { CardGridSkeleton, DetailSkeleton } from "@/components/shared/SkeletonLoader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { Select } from "@/components/ui/select";
import {
  useDeleteIssueReportMutation,
  useGetEscalationsQuery,
  useUpdateIssueReportMutation,
  type IssueReport,
} from "@/redux/api/escalationsApi";
import { useGetLocationCatalogQuery } from "@/redux/api/endpoints/catalog.api";
import { useGetWorkersQuery } from "@/redux/api/workersApi";

const SEVERITY_CONFIG: Record<string, { border: string; text: string; bg: string; badge: string }> = {
  emergency: {
    border: "border-l-red-500",
    text: "text-red-600",
    bg: "bg-red-50",
    badge: "bg-red-50 text-red-700 ring-red-200",
  },
  high: {
    border: "border-l-amber-500",
    text: "text-amber-600",
    bg: "bg-amber-50",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  medium: {
    border: "border-l-sky-500",
    text: "text-sky-600",
    bg: "bg-sky-50",
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  low: {
    border: "border-l-emerald-500",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    dot: "bg-sky-500",
  },
  RESOLVED: {
    label: "Resolved",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
  },
};

export default function EscalationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 12;
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IssueReport | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, severityFilter]);

  const { data: rawIssues = [], isLoading, isFetching, refetch } = useGetEscalationsQuery();
  const { data: locations = [] } = useGetLocationCatalogQuery(undefined, { refetchOnMountOrArgChange: false });
  const { data: workersData } = useGetWorkersQuery({ limit: 100 });

  const [updateReport, { isLoading: updating }] = useUpdateIssueReportMutation();
  const [deleteReport, { isLoading: deleting }] = useDeleteIssueReportMutation();

  const locationMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const loc of locations) {
      map.set(loc._id, loc.name);
    }
    return map;
  }, [locations]);

  const workerMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of workersData?.workers ?? []) {
      map.set(w.worker_id, w.full_name);
    }
    return map;
  }, [workersData]);

  // Compute status counts
  const counts = useMemo(() => {
    let pending = 0;
    let inProgress = 0;
    let resolved = 0;

    for (const issue of rawIssues) {
      const s = (issue.status || "").toUpperCase();
      if (s === "PENDING" || s === "OPEN") pending++;
      else if (s === "IN_PROGRESS") inProgress++;
      else if (s === "RESOLVED" || s === "CLOSED") resolved++;
    }

    return { total: rawIssues.length, pending, inProgress, resolved };
  }, [rawIssues]);

  // Filtered issues
  const filtered = useMemo(() => {
    return rawIssues.filter((issue) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const issueType = (issue.issueType || "").toLowerCase();
        const desc = (issue.description || "").toLowerCase();
        const locName = (typeof issue.location === "object" ? issue.location?.name : locationMap.get(issue.location || "")) || "";
        const workerName = (typeof issue.worker === "object" ? (issue.worker?.name || issue.worker?.full_name) : workerMap.get(issue.worker || "")) || "";

        if (
          !issueType.includes(q) &&
          !desc.includes(q) &&
          !locName.toLowerCase().includes(q) &&
          !workerName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (statusFilter) {
        const currentStatus = (issue.status || "").toUpperCase();
        if (statusFilter === "PENDING" && currentStatus !== "PENDING" && currentStatus !== "OPEN") return false;
        if (statusFilter === "IN_PROGRESS" && currentStatus !== "IN_PROGRESS") return false;
        if (statusFilter === "RESOLVED" && currentStatus !== "RESOLVED" && currentStatus !== "CLOSED") return false;
      }

      if (severityFilter) {
        if ((issue.severity || "").toLowerCase() !== severityFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [rawIssues, search, statusFilter, severityFilter, locationMap, workerMap]);

  const pagedIssues = useMemo(() => {
    return filtered.slice((page - 1) * LIMIT, page * LIMIT);
  }, [filtered, page]);

  const handleUpdateStatus = async (id: string, status: "PENDING" | "IN_PROGRESS" | "RESOLVED") => {
    setActionError("");
    try {
      await updateReport({ id, status }).unwrap();
      setSelectedIssue(null);
    } catch (err) {
      console.error("Failed to update status:", err);
      setActionError("Failed to update issue report status. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionError("");
    try {
      await deleteReport(deleteTarget._id).unwrap();
      if (selectedIssue?._id === deleteTarget._id) {
        setSelectedIssue(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete issue report:", err);
      setActionError("Failed to delete issue report. Please try again.");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Escalations & Field Issues</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {counts.total}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Review, track, and resolve operational issues reported by on-site cleaning staff.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <MdOutlineRefresh className={`text-base ${isFetching ? "animate-spin text-primary" : ""}`} />
          <span>Refresh</span>
        </button>
      </header>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Total Issues</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{counts.total}</p>
        </div>
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-amber-700">
            <MdPendingActions className="text-sm" />
            <p className="text-[11px] font-semibold">Pending</p>
          </div>
          <p className="mt-1 text-xl font-bold text-amber-800">{counts.pending}</p>
        </div>
        <div className="rounded-xl border border-sky-200/60 bg-sky-50/40 p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-sky-700">
            <MdSync className="text-sm" />
            <p className="text-[11px] font-semibold">In Progress</p>
          </div>
          <p className="mt-1 text-xl font-bold text-sky-800">{counts.inProgress}</p>
        </div>
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <MdCheckCircle className="text-sm" />
            <p className="text-[11px] font-semibold">Resolved</p>
          </div>
          <p className="mt-1 text-xl font-bold text-emerald-800">{counts.resolved}</p>
        </div>
      </div>

      {/* Toolbar: Search & Select Filters */}
      <div className="grid gap-2 rounded-xl bg-white p-2.5 ring-1 ring-slate-200/70 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by issue type, description, location..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
          placeholder="All statuses"
          options={[
            { value: "", label: "All statuses" },
            { value: "PENDING", label: `Pending (${counts.pending})` },
            { value: "IN_PROGRESS", label: `In Progress (${counts.inProgress})` },
            { value: "RESOLVED", label: `Resolved (${counts.resolved})` },
          ]}
        />

        <Select
          value={severityFilter}
          onValueChange={setSeverityFilter}
          placeholder="All severities"
          options={[
            { value: "", label: "All severities" },
            { value: "Emergency", label: "Emergency" },
            { value: "High", label: "High" },
            { value: "Medium", label: "Medium" },
            { value: "Low", label: "Low" },
          ]}
        />
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {actionError}
        </div>
      )}

      {/* Issues Grid / List */}
      {isLoading ? (
        <CardGridSkeleton cards={6} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <MdOutlineWarningAmber className="text-2xl" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-800">No issue reports found</p>
          <p className="mt-1 text-xs text-slate-500">
            {search || statusFilter || severityFilter
              ? "Try adjusting your search query or filters."
              : "No escalations have been reported by cleaning staff yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pagedIssues.map((issue) => {
            const sevKey = (issue.severity || "medium").toLowerCase();
            const sevStyle = SEVERITY_CONFIG[sevKey] ?? SEVERITY_CONFIG.medium;
            const statusKey = (issue.status || "PENDING").toUpperCase();
            const statusStyle = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.PENDING;

            const locationName =
              typeof issue.location === "object"
                ? issue.location?.name
                : locationMap.get(issue.location || "") || "Unspecified location";

            const workerName =
              typeof issue.worker === "object"
                ? issue.worker?.full_name || issue.worker?.name
                : workerMap.get(issue.worker || "") || "Cleaning Staff";

            return (
              <div
                key={issue._id}
                onClick={() => setSelectedIssue(issue)}
                className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-4.5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  {/* Top Bar: Severity & Status Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sevStyle.badge}`}>
                      {issue.severity || "Medium"}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Issue Type Title */}
                  <h3 className="mt-2.5 truncate text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {issue.issueType || "Field Issue"}
                  </h3>

                  {/* Description Excerpt */}
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 font-normal">
                    {issue.description || "No description provided."}
                  </p>
                </div>

                {/* Bottom Metadata */}
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <MdLocationOn className="shrink-0 text-slate-400 text-xs" />
                    <span className="truncate">{locationName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <MdOutlinePerson className="shrink-0 text-slate-400 text-xs" />
                      <span className="truncate">{workerName}</span>
                    </div>
                    {issue.createdAt && (
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {new Date(issue.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BackendPagination
        page={page}
        limit={LIMIT}
        total={filtered.length}
        onPageChange={setPage}
        itemLabel="issues"
      />

      {/* Modal: Issue Details & Manager Status Update */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          locationMap={locationMap}
          workerMap={workerMap}
          updating={updating}
          onClose={() => setSelectedIssue(null)}
          onUpdateStatus={(status) => handleUpdateStatus(selectedIssue._id, status)}
          onDelete={() => setDeleteTarget(selectedIssue)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Issue Report?"
          description={`Are you sure you want to permanently delete this report for "${deleteTarget.issueType}"? This action cannot be undone.`}
          confirmText="Delete Report"
          destructive
          loading={deleting}
          onConfirm={() => void handleDelete()}
          onClose={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function IssueDetailModal({
  issue,
  locationMap,
  workerMap,
  updating,
  onClose,
  onUpdateStatus,
  onDelete,
}: {
  issue: IssueReport;
  locationMap: Map<string, string>;
  workerMap: Map<string, string>;
  updating: boolean;
  onClose: () => void;
  onUpdateStatus: (status: "PENDING" | "IN_PROGRESS" | "RESOLVED") => Promise<void>;
  onDelete: () => void;
}) {
  const currentStatus = (issue.status || "PENDING").toUpperCase() as "PENDING" | "IN_PROGRESS" | "RESOLVED";
  const [selectedStatus, setSelectedStatus] = useState<"PENDING" | "IN_PROGRESS" | "RESOLVED">(currentStatus);

  const sevKey = (issue.severity || "medium").toLowerCase();
  const sevStyle = SEVERITY_CONFIG[sevKey] ?? SEVERITY_CONFIG.medium;
  const statusStyle = STATUS_CONFIG[selectedStatus] ?? STATUS_CONFIG.PENDING;

  const locationName =
    typeof issue.location === "object"
      ? issue.location?.name
      : locationMap.get(issue.location || "") || "Unspecified location";

  const workerName =
    typeof issue.worker === "object"
      ? issue.worker?.full_name || issue.worker?.name
      : workerMap.get(issue.worker || "") || "Cleaning Staff";

  const formattedDate = issue.createdAt
    ? new Date(issue.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh]">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${sevStyle.badge}`}>
                {issue.severity || "Medium"}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                {statusStyle.label}
              </span>
            </div>
            <h2 className="mt-1.5 text-base font-bold text-slate-900">{issue.issueType || "Field Issue Report"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Issue Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Description
            </label>
            <div className="mt-1.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-xs font-normal leading-relaxed text-slate-700 whitespace-pre-wrap">
              {issue.description || "No description provided."}
            </div>
          </div>

          {/* Context Info Cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MdLocationOn className="text-sm text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-800 truncate">{locationName}</p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MdOutlinePerson className="text-sm text-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Reported By</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-800 truncate">{workerName}</p>
            </div>
          </div>

          {/* Report Date */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs text-xs text-slate-600 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Logged At</span>
            <span className="font-semibold text-slate-700">{formattedDate}</span>
          </div>

          {/* Manager Action: Status Management (PATCH) */}
          <div className="rounded-xl border border-primary/20 bg-sky-50/40 p-4 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Manager Status Action</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Update the operational resolution status via PATCH API.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus("PENDING")}
                className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === "PENDING"
                    ? "border-amber-400 bg-amber-50 text-amber-800 shadow-xs ring-1 ring-amber-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MdPendingActions className="text-base text-amber-600 mb-0.5" />
                <span>Pending</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("IN_PROGRESS")}
                className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === "IN_PROGRESS"
                    ? "border-primary bg-sky-50 text-primary shadow-xs ring-1 ring-primary/40"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MdSync className="text-base text-primary mb-0.5" />
                <span>In Progress</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("RESOLVED")}
                className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === "RESOLVED"
                    ? "border-emerald-400 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MdCheckCircle className="text-base text-emerald-600 mb-0.5" />
                <span>Resolved</span>
              </button>
            </div>

            <button
              type="button"
              disabled={updating || selectedStatus === currentStatus}
              onClick={() => void onUpdateStatus(selectedStatus)}
              className="mt-2 flex h-9.5 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {updating ? "Saving Changes..." : "Apply Status Update"}
            </button>
          </div>
        </div>

        {/* Modal Footer: Delete action & Close */}
        <footer className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50">
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer shadow-2xs"
          >
            <MdDeleteOutline className="text-base" />
            <span>Delete Report</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

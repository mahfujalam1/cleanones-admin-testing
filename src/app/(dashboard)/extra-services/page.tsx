"use client";
import { useEffect, useState } from "react";
import { MdCheck, MdClose, MdOutlineClose, MdPerson, MdSearch } from "react-icons/md";
import { CardGridSkeleton, DetailSkeleton } from "@/components/shared/SkeletonLoader";
import {
  approveExtraService,
  completeApproveExtraService,
  getExtraService,
  getExtraServiceWorkersDropdown,
  rejectExtraService,
  type ExtraServiceRequest,
  type ExtraServiceWorkerDropdownItem,
} from "@/services/actions/extraServices";
import { useGetExtraServicesQuery } from "@/redux/api/dashboardApi";

const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const statusColor: Record<string, string> = {
  under_review: "bg-amber-50 text-amber-700",
  approved: "bg-sky-50 text-sky-700",
  in_progress: "bg-violet-50 text-violet-700",
  completed: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

export default function ExtraServicesPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<ExtraServiceRequest | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: servicesRes, isLoading: loading, refetch } = useGetExtraServicesQuery({ status: status || undefined });
  const rawItems: ExtraServiceRequest[] = servicesRes?.requests ?? [];
  const items = search.trim() ? rawItems.filter(item => item.title.toLowerCase().includes(search.toLowerCase())) : rawItems;

  const open = async (item: ExtraServiceRequest) => {
    setSelected(item);
    setDetailsLoading(true);
    const result = await getExtraService(item.id);
    setDetailsLoading(false);
    if (result.success) setSelected(result.data);
    else setError(result.error);
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[260px] flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.extraServices.searchPlaceholder}
            className="h-10 w-full rounded border bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-400"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded border bg-white px-3 text-sm">
          <option value="">{t.extraServices.allStatuses}</option>
          <option value="under_review">{t.extraServices.underReview}</option>
          <option value="approved">{t.extraServices.approved}</option>
          <option value="in_progress">{t.extraServices.inProgress}</option>
          <option value="completed">{t.extraServices.completed}</option>
          <option value="rejected">{t.extraServices.rejected}</option>
        </select>
      </div>

      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <CardGridSkeleton cards={6} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <button key={item.id} onClick={() => void open(item)} className="rounded border bg-white p-5 text-left shadow-sm hover:shadow transition-shadow cursor-pointer">
              <div className="flex justify-between gap-3">
                <h2 className="font-bold text-slate-900">{item.title}</h2>
                <span className={`shrink-0 rounded px-2 py-1 text-[10px] font-semibold ${statusColor[item.status] ?? "bg-slate-50 text-slate-600"}`}>
                  {label(item.status)}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.description}</p>
              <div className="mt-4 space-y-1 text-xs text-slate-500">
                <p>{item.client_name || item.client?.name}</p>
                <p>{item.location_name || item.location?.name} · {item.room_name || item.room?.name}</p>
                <p>Preferred: {item.preferred_date}</p>
                <p className="font-semibold">Priority: {label(item.priority)}</p>
              </div>
            </button>
          ))}
          {items.length === 0 && <p className="col-span-full rounded border bg-white py-16 text-center text-sm text-slate-500">{t.extraServices.noRequests}</p>}
        </div>
      )}

      {selected && (
        <RequestDrawer
          item={selected}
          loading={detailsLoading}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            void refetch();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

function RequestDrawer({
  item,
  loading,
  onClose,
  onDone,
  onError,
}: {
  item: ExtraServiceRequest;
  loading: boolean;
  onClose: () => void;
  onDone: () => void;
  onError: (value: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);

  const handleReject = async () => {
    setSaving(true);
    const result = await rejectExtraService(item.id, rejectionReason || "Service requested is outside operational scope.");
    setSaving(false);
    if (!result.success) return onError(result.error);
    onDone();
  };

  const handleComplete = async () => {
    setSaving(true);
    const result = await completeApproveExtraService(item.id);
    setSaving(false);
    if (!result.success) return onError(result.error);
    onDone();
  };

  return (
    <>
      <div className="modal-backdrop fixed inset-0 z-40 flex justify-end">
        <button className="absolute inset-0 cursor-default" onClick={onClose} />
        <aside className="relative z-10 flex h-full w-full max-w-[520px] flex-col bg-white shadow-xl">
          <header className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">{item.title}</h2>
              <p className="text-xs text-slate-500">Request ID: {item.id}</p>
            </div>
            <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer">
              <MdClose className="text-2xl" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <DetailSkeleton blocks={7} />
            ) : (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</h4>
                  <p className="text-sm leading-6 text-slate-700">{item.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-xs text-slate-700">
                  <div>
                    <span className="font-medium text-slate-400">Client:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{item.client_name || item.client?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Location:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{item.location_name || item.location?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Room:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{item.room_name || item.room?.name || "All rooms"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Preferred Date:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{item.preferred_date}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Priority:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{label(item.priority)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-400">Status:</span>
                    <span className={`inline-block mt-0.5 rounded px-2 py-0.5 text-[10px] font-semibold ${statusColor[item.status] ?? "bg-slate-50 text-slate-600"}`}>
                      {label(item.status)}
                    </span>
                  </div>
                </div>

                {item.assigned_workers && item.assigned_workers.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Assigned Workers</h4>
                    <div className="space-y-2">
                      {item.assigned_workers.map((worker) => (
                        <div key={worker.worker_id} className="flex items-center gap-3 rounded border border-slate-200 bg-white p-3">
                          <img
                            src={worker.profile_picture || worker.profile_photo || "/avatar-placeholder.svg"}
                            alt={worker.name}
                            className="h-8 w-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{worker.name}</p>
                            <p className="text-[10px] text-slate-500">{worker.position ? label(worker.position) : "Assigned Worker"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.rejection_reason && (
                  <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <span className="font-semibold block mb-0.5">Rejection Reason:</span>
                    {item.rejection_reason}
                  </div>
                )}

                {/* Rejection Prompt */}
                {showRejectPrompt && (
                  <div className="space-y-2 rounded border border-red-200 bg-red-50 p-3">
                    <label className="block text-xs font-semibold text-red-800">Reason for rejection:</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Specify reason..."
                      className="w-full rounded border border-red-300 bg-white p-2 text-xs text-slate-800 outline-none focus:ring-1 focus:ring-red-400"
                      rows={2}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowRejectPrompt(false)}
                        className="px-3 py-1 text-xs font-medium text-slate-600 bg-white rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={saving}
                        onClick={() => void handleReject()}
                        className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                      >
                        {saving ? "Rejecting..." : "Confirm Reject"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          {!loading && (
            <div className="border-t bg-slate-50 px-6 py-4">
              {item.status === "under_review" && !showRejectPrompt && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex h-10 items-center justify-center gap-1.5 rounded bg-[#0ea5e9] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#0284c7] transition-colors cursor-pointer"
                  >
                    Approve & Assign
                  </button>
                  <button
                    onClick={() => setShowRejectPrompt(true)}
                    className="flex h-10 items-center justify-center gap-1.5 rounded border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              )}

              {["completed", "awaiting_approval", "pending_completion_review"].includes(item.status) && (
                <button
                  disabled={saving}
                  onClick={() => void handleComplete()}
                  className="flex h-10 w-full items-center justify-center gap-1.5 rounded bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Approving..." : "Final approve & credit hours"}
                </button>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Assign Worker Modal */}
      {showAssignModal && (
        <AssignWorkerModal
          request={item}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setShowAssignModal(false);
            onDone();
          }}
          onError={onError}
        />
      )}
    </>
  );
}

function AssignWorkerModal({
  request,
  onClose,
  onSuccess,
  onError,
}: {
  request: ExtraServiceRequest;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [workers, setWorkers] = useState<ExtraServiceWorkerDropdownItem[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [search, setSearch] = useState("");
  const [workerType, setWorkerType] = useState<"all" | "employee" | "freelancer">("all");
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [workerPositions, setWorkerPositions] = useState<Record<string, "teamleader" | "co_leader" | "normal">>({});
  const [estimatedHours, setEstimatedHours] = useState(1);
  const [requiredPhotos, setRequiredPhotos] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadWorkers = () => {
    setLoadingWorkers(true);
    void getExtraServiceWorkersDropdown(request.id, {
      search: search || undefined,
      workerType: workerType === "all" ? undefined : workerType,
    }).then((result) => {
      setLoadingWorkers(false);
      if (!result.success) return setError(result.error);
      setError("");
      setWorkers(result.data.workers || []);
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(loadWorkers, 300);
    return () => window.clearTimeout(timer);
  }, [search, workerType]);

  const toggleWorker = (id: string) => {
    setSelectedWorkerIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((wId) => wId !== id);
        setWorkerPositions((p) => {
          const copy = { ...p };
          delete copy[id];
          return copy;
        });
        return next;
      } else {
        setWorkerPositions((p) => ({ ...p, [id]: prev.length === 0 ? "teamleader" : "normal" }));
        return [...prev, id];
      }
    });
  };

  const handleAssign = async () => {
    if (selectedWorkerIds.length === 0) return setError("Please select at least one worker to assign");
    setSubmitting(true);
    setError("");

    const workerAssignments = selectedWorkerIds.map((id) => ({
      worker_id: id,
      position: workerPositions[id] || "normal",
    }));

    const photosList = request.required_photos?.map((p: any) => (typeof p === "string" ? p : p.name || p.id)).filter(Boolean) || [];

    const result = await approveExtraService(request.id, {
      worker_ids: selectedWorkerIds,
      workers: workerAssignments,
      required_photos: photosList,
      estimated_hours: estimatedHours,
      admin_notes: adminNotes,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onSuccess();
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">Assign Workers & Approve</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {request.title} — {request.client_name || request.client?.name}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <MdOutlineClose className="text-xl" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search workers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded bg-white text-xs outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex bg-slate-200 p-0.5 rounded text-xs font-medium shrink-0">
              {(["all", "employee", "freelancer"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setWorkerType(t)}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer ${workerType === t ? "bg-[#0ea5e9] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                >
                  {label(t)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Workers List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Available Workers ({workers.length})</span>
              {selectedWorkerIds.length > 0 && (
                <span className="text-xs font-semibold text-[#0ea5e9] bg-sky-50 px-2.5 py-0.5 rounded-full">
                  {selectedWorkerIds.length} selected
                </span>
              )}
            </div>

            {loadingWorkers ? (
              <DetailSkeleton blocks={4} />
            ) : workers.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 border border-dashed rounded-lg bg-slate-50">
                No workers found for this request date
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                {workers.map((worker) => {
                  const isSelected = selectedWorkerIds.includes(worker.worker_id);
                  const currentPos = workerPositions[worker.worker_id] || "normal";
                  return (
                    <div
                      key={worker.worker_id}
                      onClick={() => toggleWorker(worker.worker_id)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected ? "border-[#0ea5e9] bg-sky-50/50 shadow-sm" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-10 w-10 shrink-0">
                          <img
                            src={worker.profile_photo || worker.profile_picture || "/avatar-placeholder.svg"}
                            alt={worker.name}
                            className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                          />
                          {isSelected && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#0ea5e9] rounded-full flex items-center justify-center border-2 border-white">
                              <MdCheck className="text-white text-[8px]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 truncate">{worker.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                worker.is_available ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {worker.is_available ? "Available" : worker.unavailable_reason || "Busy"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {label(worker.position || worker.worker_type || "Worker")} · {worker.formatted_avg_work || "0 mins/day"} · {worker.total_shifts_this_month ?? 0} shifts/mo
                          </p>
                        </div>
                      </div>

                      {/* Position Select when selected */}
                      {isSelected && (
                        <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center gap-1">
                          <select
                            value={currentPos}
                            onChange={(e) => setWorkerPositions((p) => ({ ...p, [worker.worker_id]: e.target.value as any }))}
                            className="h-8 rounded border border-sky-300 bg-white px-2 text-[11px] font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
                          >
                            <option value="teamleader">Team Leader</option>
                            <option value="co_leader">Co-Leader</option>
                            <option value="normal">Normal Cleaner</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operational Inputs */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full h-9 border border-slate-300 rounded px-3 text-xs text-slate-800 outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required Photos</label>
                <div className="flex h-9 w-full items-center rounded border border-slate-200 bg-slate-100 px-3 text-xs font-semibold text-slate-600">
                  {request.total_photos_count ?? request.required_photos?.length ?? 0} photos required
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Special instructions or notes for assigned workers..."
                rows={2}
                className="w-full border border-slate-300 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-sky-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        {error && <p className="border-t border-red-100 bg-red-50 px-6 py-2 text-xs font-medium text-red-700">{error}</p>}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={selectedWorkerIds.length === 0 || submitting}
            onClick={() => void handleAssign()}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Assigning & Approving..." : `Assign & Approve (${selectedWorkerIds.length} worker${selectedWorkerIds.length > 1 ? "s" : ""})`}
          </button>
        </div>
      </div>
    </div>
  );
}


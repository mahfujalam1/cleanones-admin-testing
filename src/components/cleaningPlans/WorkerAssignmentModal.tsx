"use client";

import { useEffect, useState } from "react";
import { MdOutlineClose, MdSearch } from "react-icons/md";
import { TbUsers } from "react-icons/tb";
import { assignPlanWorkers, getCleaningPlan, getPlanWorkers, type PlanDetails, type PlanWorkerOption, type WorkerAssignment } from "@/services/actions/cleaningPlans";
import { Select } from "@/components/ui/select";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { TableSkeleton } from "@/components/shared/SkeletonLoader";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getPlaceholderTranslation } from "@/lib/translations";

const limit = 10;
const positionOptions = [{ value: "teamleader", label: "Team leader" }, { value: "co_leader", label: "Co-leader" }, { value: "normal", label: "Standard worker" }];

export function WorkerAssignmentModal({ planId, planTitle, onClose, onAssigned }: { planId: string; planTitle: string; onClose: () => void; onAssigned: (details: PlanDetails) => void }) {
  const p = getPlaceholderTranslation(getLocale(usePathname()));
  const [workers, setWorkers] = useState<PlanWorkerOption[]>([]);
  const [selected, setSelected] = useState<Record<string, WorkerAssignment["position"]>>({});
  const [search, setSearch] = useState(""), [workerType, setWorkerType] = useState("all"), [action, setAction] = useState<"append" | "replace">("append");
  const [page, setPage] = useState(1), [total, setTotal] = useState(0), [planDate, setPlanDate] = useState(""), [timeWindow, setTimeWindow] = useState("");
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState("");
  const [forced, setForced] = useState<Record<string, boolean>>({});
  const [assignedPositions, setAssignedPositions] = useState<Record<string, WorkerAssignment["position"]>>({});

  useEffect(() => { const timer = window.setTimeout(() => { setLoading(true); void getPlanWorkers(planId, { search, workerType, page, limit }).then((result) => { setLoading(false); if (!result.success) return setError(result.error); setError(""); setWorkers(result.data.workers ?? []); setTotal(result.data.total_count ?? 0); setPlanDate(result.data.plan_date ?? ""); setTimeWindow(result.data.plan_time_window ?? ""); }); }, 300); return () => window.clearTimeout(timer); }, [planId, search, workerType, page]);
  useEffect(() => { setPage(1); }, [search, workerType]);
  // The plan already knows who is on it and in which position. Seed the selection from
  // that so those rows open with their current role instead of looking unassigned.
  useEffect(() => {
    void getCleaningPlan(planId).then((result) => {
      if (!result.success) return;
      const positions = Object.fromEntries((result.data.workers ?? []).map((worker) => [worker.worker_id, (worker.position || "normal") as WorkerAssignment["position"]]));
      setAssignedPositions(positions);
      setSelected((current) => ({ ...positions, ...current }));
    });
  }, [planId]);

  const deselect = (workerId: string) => { setSelected((current) => { const next = { ...current }; delete next[workerId]; return next; }); setForced((current) => { const next = { ...current }; delete next[workerId]; return next; }); };
  // The shift needs a lead, so the first person picked takes that role and everyone
  // after them defaults to a standard worker.
  const select = (workerId: string, isForced: boolean) => { setSelected((current) => ({ ...current, [workerId]: isForced ? "teamleader" : (Object.values(current).includes("teamleader") ? "normal" : "teamleader") })); if (isForced) setForced((current) => ({ ...current, [workerId]: true })); };
  // Workers already on the plan are locked while appending (append cannot remove anyone),
  // but replacing rebuilds the roster, so there they are free to uncheck.
  const canToggle = (worker: PlanWorkerOption) => assignedPositions[worker.worker_id] ? action === "replace" : worker.is_available;
  const toggle = (worker: PlanWorkerOption) => { if (!canToggle(worker)) return; if (selected[worker.worker_id]) return deselect(worker.worker_id); select(worker.worker_id, false); };
  // A worker with a schedule conflict can only be picked through the force button, which
  // flips force=true on the request so the backend accepts the overlap.
  const forceAssign = (worker: PlanWorkerOption) => { if (assignedPositions[worker.worker_id]) return; if (selected[worker.worker_id]) return deselect(worker.worker_id); select(worker.worker_id, true); };
  const forcedCount = Object.keys(selected).filter((workerId) => forced[workerId]).length;
  const assignedCount = Object.keys(selected).filter((workerId) => assignedPositions[workerId]).length;
  const newCount = Object.keys(selected).length - assignedCount;
  const roleChanged = Object.entries(assignedPositions).some(([workerId, position]) => selected[workerId] && selected[workerId] !== position);
  const removedCount = action === "replace" ? Object.keys(assignedPositions).filter((workerId) => !selected[workerId]).length : 0;
  const submit = async () => { const assignments = Object.entries(selected).map(([worker_id, position]) => ({ worker_id, position })); if (!assignments.length) return setError("Select at least one worker."); setSaving(true); setError(""); const result = await assignPlanWorkers(planId, assignments, action, forcedCount > 0); setSaving(false); if (!result.success) return setError(result.error); onAssigned(result.data); onClose(); };

  return <div onClick={onClose} className="modal-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4"><div onClick={(event) => event.stopPropagation()} className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-md bg-white shadow-xl">
    <header className="flex items-center gap-3 border-b border-gray-200 px-5 py-4"><span className="flex h-9 w-9 items-center justify-center rounded bg-sky-100 text-sky-600"><TbUsers /></span><div className="min-w-0 flex-1"><h2 className="font-bold text-gray-900">Assign workers</h2><p className="truncate text-xs text-gray-400">{planTitle}{planDate && ` · ${planDate}`}{timeWindow && ` · ${timeWindow}`}</p></div><button onClick={onClose} className="p-1 text-gray-400"><MdOutlineClose className="text-xl" /></button></header>
    <div className="space-y-4 overflow-y-auto p-5">
      <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]"><label className="relative"><MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search worker, email or phone..." className="h-10 w-full rounded border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label><Select value={workerType} onValueChange={setWorkerType} options={[{ value: "all", label: "All worker types" }, { value: "employee", label: "Employees" }, { value: "freelancer", label: "Freelancers" }]} /><Select value={action} onValueChange={(value) => { const next = value as "append" | "replace"; setAction(next); if (next === "append") setSelected((current) => ({ ...assignedPositions, ...current })); }} options={[{ value: "append", label: "Append workers" }, { value: "replace", label: "Replace workers" }]} /></div>
      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}
      {loading ? <TableSkeleton rows={6} columns={3} /> : <div className="space-y-2">{workers.length === 0 ? <p className="py-12 text-center text-sm text-gray-400">No workers found</p> : workers.map((worker) => { const isSelected = Boolean(selected[worker.worker_id]); const isAssigned = Boolean(assignedPositions[worker.worker_id]); const blocked = !worker.is_available && !isAssigned; const locked = isAssigned && action !== "replace"; return <div key={worker.worker_id} className={`rounded border p-3 ${isAssigned ? "border-indigo-200 bg-indigo-50/40" : blocked ? "border-red-100 bg-red-50/50" : isSelected ? "border-sky-400 bg-sky-50" : "border-gray-200 bg-white"}`}><div className="flex flex-col gap-3 md:flex-row md:items-center"><label className={`flex min-w-0 flex-1 items-center gap-3 ${locked || blocked ? "cursor-not-allowed" : "cursor-pointer"}`}><input type="checkbox" disabled={locked || blocked} checked={isSelected} onChange={() => toggle(worker)} className="h-4 w-4 accent-sky-500" /><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">{worker.name?.split(" ").map((part) => part[0]).join("").slice(0, 2) || "W"}</span><span className="min-w-0"><span className="flex items-center gap-2"><b className="truncate text-sm text-gray-800">{worker.name}</b>{isAssigned && <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600">Assigned</span>}</span><span className="block truncate text-xs text-gray-400">{worker.worker_type} · {worker.email || worker.phone}</span></span></label><div className="grid grid-cols-2 gap-3 text-xs md:w-64"><span><b className="block text-gray-700">{worker.formatted_avg_work || "0 mins/day"}</b><span className="text-gray-400">Monthly average</span></span><span><b className="block text-gray-700">{worker.total_shifts_this_month ?? 0}</b><span className="text-gray-400">Shifts this month</span></span></div>{isSelected && <div className="md:w-44"><Select value={selected[worker.worker_id]} onValueChange={(value) => setSelected((current) => ({ ...current, [worker.worker_id]: value as WorkerAssignment["position"] }))} options={positionOptions} /></div>}{blocked && <button type="button" onClick={() => forceAssign(worker)} className={`h-9 shrink-0 rounded border px-3 text-xs font-semibold transition cursor-pointer ${isSelected ? "border-amber-400 bg-amber-100 text-amber-700 hover:bg-amber-200" : "border-red-300 bg-white text-red-600 hover:bg-red-50"}`}>{isSelected ? "Forced - undo" : "Force assign"}</button>}</div>{blocked && <p className="mt-2 pl-7 text-xs font-medium text-red-600">{worker.unavailable_reason || "Already assigned at this time. You can forcefully assign them."}</p>}{isAssigned && <p className="mt-2 pl-7 text-xs text-indigo-600">{locked ? "Already on this plan - change the position to update their role." : "On this plan - uncheck to drop them when you replace."}</p>}</div>; })}</div>}
      <BackendPagination page={page} limit={limit} total={total} onPageChange={setPage} />
    </div>
    <footer className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-4"><p className="text-xs text-gray-500">{newCount} new worker(s) selected{assignedCount > 0 && <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-600">{assignedCount} already assigned</span>}{removedCount > 0 && <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-600">{removedCount} to be removed</span>}{forcedCount > 0 && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">{forcedCount} forced despite conflict</span>}</p><div className="flex gap-2"><button onClick={onClose} className="rounded border border-gray-300 px-4 py-2 text-sm">Cancel</button><button onClick={() => void submit()} disabled={saving || (!newCount && !roleChanged && !removedCount)} className="rounded bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">{saving ? "Saving..." : action === "replace" ? "Replace workers" : newCount ? "Assign workers" : "Update roles"}</button></div></footer>
  </div></div>;
}

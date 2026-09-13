"use client";

import { useEffect, useMemo, useState } from "react";
import { MdOutlineClose, MdWarningAmber } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SearchInput, ErrorNotice } from "@/components/shared/ListStates";
import { apiError } from "@/redux/api/apiError";
import { refId } from "@/redux/api/types";
import { WORKER_TYPES, workerName, type WorkerType } from "@/redux/api/endpoints/workers.api";
import {
  conflictLabel,
  useAssignWorkersMutation,
  useGetCleaningPlanQuery,
  useGetEligibleWorkersQuery,
  type CleaningPlan,
} from "@/redux/api/endpoints/cleaningPlans.api";

/** Roles a worker can hold on a plan. Default is Team leader for the primary assignment. */
const ROLES = ["Team leader", "Cleaner", "Supervisor"] as const;

const formatWindow = (plan: CleaningPlan) => {
  if (!plan.date_time) return plan.title;
  const start = new Date(plan.date_time);
  if (Number.isNaN(start.getTime())) return plan.title;
  const time = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${plan.title} · ${start.toLocaleDateString()} · ${time}`;
};

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function getWorkerIdFromAssignment(assignment: any): string {
  if (!assignment) return "";
  if (typeof assignment === "string") return assignment;
  if (typeof assignment.worker === "string") return assignment.worker;
  if (assignment.worker && typeof assignment.worker === "object") {
    return assignment.worker._id || assignment.worker.id || assignment.worker.worker_id || assignment.worker.user || "";
  }
  return assignment.worker_id || assignment.id || assignment._id || "";
}

function getRoleFromAssignment(assignment: any): string {
  return assignment?.role || assignment?.position || "Team leader";
}

export function AssignWorkersModal({ plan, onClose }: { plan: CleaningPlan; onClose: () => void }) {
  const { data: eligible = [], isFetching } = useGetEligibleWorkersQuery(plan._id);
  const [assignWorkers, { isLoading: saving }] = useAssignWorkersMutation();

  /**
   * The list endpoint leaves `assigned_workers` out, so the current assignment is read from
   * the single-plan route instead.
   */
  const { data: detail, isLoading: loadingDetail } = useGetCleaningPlanQuery(plan._id);

  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [forcedWorkers, setForcedWorkers] = useState<Record<string, boolean>>({});
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (seeded || !detail) return;
    const rawList = (detail as any).assigned_workers || (detail as any).workers || [];
    const assignments = rawList
      .map((assignment: any) => ({
        id: getWorkerIdFromAssignment(assignment),
        role: getRoleFromAssignment(assignment),
      }))
      .filter((assignment: any) => assignment.id);

    setPicked(new Set(assignments.map((assignment: any) => assignment.id)));
    setRoles(Object.fromEntries(assignments.map((assignment: any) => [assignment.id, assignment.role])));
    setSeeded(true);
  }, [detail, seeded]);

  const [search, setSearch] = useState("");
  const [workerType, setWorkerType] = useState<WorkerType | "">("");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return eligible.filter(({ worker }) => {
      if (workerType && worker.worker_type !== workerType) return false;
      if (!term) return true;
      return `${workerName(worker)} ${worker.email} ${worker.phone}`.toLowerCase().includes(term);
    });
  }, [eligible, search, workerType]);

  const toggle = (id: string, isConflictBlocked: boolean) => {
    if (isConflictBlocked) return;
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!roles[id]) {
          setRoles((r) => ({ ...r, [id]: current.size === 0 ? "Team leader" : "Cleaner" }));
        }
      }
      return next;
    });
  };

  const toggleForce = (id: string) => {
    setForcedWorkers((prev) => {
      const nextForced = !prev[id];
      if (nextForced) {
        // Turning force on: also select the worker and set a default role
        setPicked((cur) => new Set(cur).add(id));
        setRoles((cur) => ({ ...cur, [id]: cur[id] || (picked.size === 0 ? "Team leader" : "Cleaner") }));
      } else {
        // Turning force off: deselect the conflicting worker
        setPicked((cur) => {
          const nextPicked = new Set(cur);
          nextPicked.delete(id);
          return nextPicked;
        });
      }
      return { ...prev, [id]: nextForced };
    });
  };

  const save = async () => {
    setError("");
    setConflict("");

    const assigned_workers = [...picked]
      .filter(Boolean)
      .map((id) => ({
        worker: id,
        role: roles[id] ?? (picked.size === 1 ? "Team leader" : "Cleaner"),
      }));

    const hasForced = [...picked].some((id) => forcedWorkers[id]);

    try {
      await assignWorkers({ id: plan._id, assigned_workers, force: hasForced }).unwrap();
      onClose();
    } catch (cause) {
      if ((cause as { status?: number })?.status === 409) {
        setConflict(apiError(cause, "Some of these workers are already booked at this time. Click 'Force assign' to override conflict."));
        return;
      }
      setError(apiError(cause));
    }
  };

  const chosenConflicts = visible.filter(({ worker, is_conflict }) => {
    const id = worker._id || (worker as any).id || (worker as any).worker_id;
    return is_conflict && picked.has(id);
  });

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Assign workers"
        className="flex max-h-[88vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">Assign workers</h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">{formatWindow(plan)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-50"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        <div className="grid gap-2 border-b border-slate-100 px-5 pb-4 md:grid-cols-[1.6fr_1fr]">
          <SearchInput value={search} onChange={setSearch} placeholder="Search worker, email or phone…" />
          <Select
            value={workerType}
            onValueChange={(value) => setWorkerType(value as WorkerType | "")}
            placeholder="All worker types"
            options={[
              { value: "", label: "All worker types" },
              ...WORKER_TYPES.map((value) => ({ value, label: value })),
            ]}
          />
        </div>

        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-5">
          {error && <ErrorNotice message={error} />}

          {conflict && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <MdWarningAmber className="mt-0.5 shrink-0 text-base text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-amber-800">{conflict}</p>
                <p className="mt-1 text-[11px] text-amber-700">
                  Assigning anyway records them with a conflict flag.
                </p>
              </div>
            </div>
          )}

          {(isFetching || loadingDetail) && eligible.length === 0 ? (
            Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-100" />
            ))
          ) : visible.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-400">No eligible workers found</p>
          ) : (
            visible.map(({ worker, is_conflict, conflict_reason }) => {
              const workerId = worker._id || (worker as any).id || (worker as any).worker_id;
              const name = workerName(worker);
              const checked = picked.has(workerId);
              const isConflict = Boolean(is_conflict);
              const isForced = Boolean(forcedWorkers[workerId]);
              const blocked = isConflict && !isForced;

              return (
                <div
                  key={workerId}
                  className={`rounded-lg border p-3 transition-colors ${
                    isForced && checked
                      ? "border-amber-300 bg-amber-50/40 ring-1 ring-amber-200"
                      : checked
                      ? "border-primary/30 bg-sky-50/50"
                      : isConflict
                      ? "border-red-200 bg-red-50/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={blocked}
                        onChange={() => toggle(workerId, blocked)}
                        aria-label={`Assign ${name}`}
                        className={`h-4 w-4 shrink-0 rounded border-slate-300 accent-primary ${
                          blocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        }`}
                      />

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                        {initials(name)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                          {isConflict && (
                            <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              Conflict
                            </span>
                          )}
                          {isForced && (
                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              Forced override
                            </span>
                          )}
                        </div>

                        <p className="truncate text-xs text-slate-500">
                          {worker.worker_type?.toLowerCase()} · {worker.email}
                        </p>

                        {isConflict && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                            <MdWarningAmber className="shrink-0 text-sm text-red-600" />
                            <span>
                              {conflictLabel(conflict_reason) || "Schedule conflict: Worker is already booked at this time"}
                            </span>
                          </div>
                        )}
                        {isForced && (
                          <p className="mt-0.5 text-[11px] font-medium text-amber-700">
                            Force enabled: Worker will be assigned despite the conflict.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isConflict && (
                        <Button
                          type="button"
                          size="sm"
                          variant={isForced ? "secondary" : "outline"}
                          onClick={() => toggleForce(workerId)}
                          className={`h-8 text-xs font-medium cursor-pointer ${
                            isForced
                              ? "border-amber-400 bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : "border-red-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                          }`}
                        >
                          {isForced ? "Forced (undo)" : "Force assign"}
                        </Button>
                      )}

                      {checked && (
                        <div className="w-36 shrink-0">
                          <Select
                            value={roles[workerId] ?? (picked.size === 1 ? "Team leader" : "Cleaner")}
                            onValueChange={(value) =>
                              setRoles((current) => ({ ...current, [workerId]: value }))
                            }
                            options={ROLES.map((role) => ({ value: role, label: role }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <p className="text-xs text-slate-500">
            {picked.size} worker{picked.size === 1 ? "" : "s"} assigned
            {chosenConflicts.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                {chosenConflicts.length} with conflict override
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void save()} disabled={saving || loadingDetail}>
              {saving ? "Saving…" : "Save assignment"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}


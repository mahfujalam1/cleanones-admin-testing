"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MdOutlineClose, MdWarningAmber } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SearchInput, ErrorNotice } from "@/components/shared/ListStates";
import { FieldLabel } from "@/components/shared/Field";
import { TimePicker } from "@/components/ui/time-picker";
import { apiError } from "@/redux/api/apiError";
import { WORKER_TYPES, workerName, type WorkerType } from "@/redux/api/endpoints/workers.api";
import { conflictLabel, planWorkDurationMinutes, useGetCleaningPlanQuery } from "@/redux/api/endpoints/cleaningPlans.api";
import {
  useAssignShiftWorkersMutation,
  useGetShiftEligibleWorkersQuery,
  type PlanRosterAssignedWorker,
} from "@/redux/api/rosterApi";
import { useModalJump } from "@/hooks/useModalJump";
import { endFromStart } from "@/components/shift-management/planShift";


const ROLES = ["Team leader", "Co-leader", "Normal worker"] as const;

type PlanRole = (typeof ROLES)[number];
const DEFAULT_ROLE: PlanRole = "Normal worker";

export type ShiftAssignTarget = {
  planId: string;
  date: string;
  planTitle?: string;
  locationName?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  assignedWorkers?: PlanRosterAssignedWorker[];
};

function toTimestamp(date: string, time: string) {
  if (!time) return "";
  if (time.includes("T")) {
    const parsed = new Date(time);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  const [hours, minutes] = time.split(":").map(Number);
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setHours(hours || 0, minutes || 0, 0, 0);
  return parsed.toISOString();
}

function toTimeSlot(value?: string) {
  if (!value) return "";
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
}

function timeFromDate(value: Date) {
  return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isPastStartSlot(date: string, time: string) {
  if (date !== todayKey()) return false;
  const start = new Date(toTimestamp(date, time));
  if (Number.isNaN(start.getTime())) return false;
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMilliseconds(0);
  return start.getTime() < now.getTime();
}

function calculateEnd(date: string, startTime: string, durationMinutes: number) {
  if (!startTime || durationMinutes <= 0) return { time: "", iso: "" };
  const start = new Date(toTimestamp(date, startTime));
  const end = endFromStart(start, durationMinutes);
  if (!end) return { time: "", iso: "" };
  return { time: timeFromDate(end), iso: end.toISOString() };
}

export function formatAssignDateLabel(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function workerIdOf(worker: { _id?: string; id?: string; worker_id?: string }) {
  return worker._id || worker.id || worker.worker_id || "";
}

export function AssignWorkersPanel({
  target,
  onCancel,
  onSaved,
  embedded = false,
  active = true,
}: {
  target: ShiftAssignTarget;
  onCancel: () => void;
  onSaved: () => void;
  embedded?: boolean;
  active?: boolean;
}) {
  const lockTimes = Boolean(target.startTime && (target.assignedWorkers?.length ?? 0) > 0);
  const [startTime, setStartTime] = useState(() => (lockTimes ? toTimeSlot(target.startTime) : ""));
  const { data: plan } = useGetCleaningPlanQuery(target.planId, {
    skip: !target.planId || Boolean(target.durationMinutes),
  });
  const durationMinutes = target.durationMinutes || (plan ? planWorkDurationMinutes(plan) : 0);
  const computedEnd = calculateEnd(target.date, startTime, durationMinutes);
  const endTime = computedEnd.time;
  const startIso = lockTimes && target.startTime?.includes("T")
    ? new Date(target.startTime).toISOString()
    : toTimestamp(target.date, startTime);
  const endIso = computedEnd.iso;
  const timesValid = Boolean(startTime && endTime && new Date(endIso).getTime() > new Date(startIso).getTime());

  const { data: eligible = [], isFetching } = useGetShiftEligibleWorkersQuery(
    { planId: target.planId, date: target.date, start_time: startIso, end_time: endIso },
    { skip: !timesValid || !active },
  );
  const [assignWorkers, { isLoading: saving }] = useAssignShiftWorkersMutation();

  const [picked, setPicked] = useState<Set<string>>(() => new Set(
    (target.assignedWorkers ?? []).map((worker) => worker.worker_id).filter(Boolean),
  ));
  const [roles, setRoles] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (target.assignedWorkers ?? [])
        .filter((worker) => worker.worker_id)
        .map((worker) => [
          worker.worker_id,
          ROLES.includes(worker.role as (typeof ROLES)[number]) ? (worker.role as string) : DEFAULT_ROLE,
        ]),
    ),
  );
  const [forcedWorkers, setForcedWorkers] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [workerType, setWorkerType] = useState<WorkerType | "">("");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState("");

  useEffect(() => {
    setStartTime(lockTimes ? toTimeSlot(target.startTime) : "");
    setPicked(new Set((target.assignedWorkers ?? []).map((worker) => worker.worker_id).filter(Boolean)));
    setRoles(
      Object.fromEntries(
        (target.assignedWorkers ?? [])
          .filter((worker) => worker.worker_id)
          .map((worker) => [
            worker.worker_id,
            ROLES.includes(worker.role as (typeof ROLES)[number]) ? (worker.role as string) : DEFAULT_ROLE,
          ]),
      ),
    );
    setForcedWorkers({});
    setError("");
    setConflict("");
  }, [lockTimes, target.planId, target.date, target.startTime, target.endTime, target.assignedWorkers]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return eligible.filter(({ worker }) => {
      if (workerType && worker.worker_type !== workerType) return false;
      if (!term) return true;
      return `${workerName(worker)} ${worker.email ?? ""} ${worker.phone ?? ""}`.toLowerCase().includes(term);
    });
  }, [eligible, search, workerType]);

  const toggle = (id: string) => {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!roles[id]) {
          setRoles((currentRoles) => ({ ...currentRoles, [id]: DEFAULT_ROLE }));
        }
      }
      return next;
    });
  };

  const toggleForce = (id: string) => {
    setForcedWorkers((prev) => {
      const nextForced = !prev[id];
      if (nextForced) {
        setPicked((cur) => new Set(cur).add(id));
        setRoles((cur) => ({ ...cur, [id]: cur[id] || DEFAULT_ROLE }));
      } else {
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
    if (!startTime) {
      setError("Select a start time.");
      return;
    }
    if (!lockTimes && isPastStartSlot(target.date, startTime)) {
      setError("That start time has already passed. Pick a later time.");
      return;
    }
    if (!timesValid) {
      setError("This plan needs a task duration before workers can be assigned.");
      return;
    }

    const assigned_workers = [...picked]
      .filter(Boolean)
      .map((id) => ({
        worker: id,
        role: roles[id] ?? DEFAULT_ROLE,
      }));

    const hasForced =
      [...picked].some((id) => forcedWorkers[id]) ||
      visible.some(({ worker, is_conflict, is_available }) => {
        const id = workerIdOf(worker);
        return picked.has(id) && (Boolean(is_conflict) || is_available === false);
      });

    try {
      await assignWorkers({
        planId: target.planId,
        date: target.date,
        assigned_workers,
        start_time: startIso,
        end_time: endIso,
        force: hasForced,
      }).unwrap();
      onSaved();
    } catch (cause) {
      if ((cause as { status?: number })?.status === 409) {
        setConflict(apiError(cause, "Some of these workers are already booked at this time. Click 'Force assign' to override conflict."));
        return;
      }
      setError(apiError(cause));
    }
  };

  const chosenOverrides = visible.filter(({ worker, is_conflict, is_available }) => {
    const id = workerIdOf(worker);
    return picked.has(id) && (Boolean(is_conflict) || is_available === false);
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!embedded && (
        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">{lockTimes ? "Manage workers" : "Assign workers"}</h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {[target.planTitle, target.locationName, formatAssignDateLabel(target.date)].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Close"
            className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:text-slate-700 disabled:opacity-50"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </header>
      )}

      <div className={`grid gap-2 border-b border-slate-100 px-5 pb-4 sm:grid-cols-2 ${embedded ? "pt-4" : ""}`}>
        <div>
          <FieldLabel htmlFor="assign-start-time" label="Start time" required />
          <TimePicker
            value={startTime}
            disabled={lockTimes}
            placeholder="Select start time"
            onValueChange={(value) => {
              if (lockTimes) return;
              if (value && isPastStartSlot(target.date, value)) {
                setError("That start time has already passed. Pick a later time.");
                return;
              }
              setStartTime(value);
              setError("");
            }}
          />
        </div>
        <div>
          <FieldLabel htmlFor="assign-end-time" label="End time" />
          <TimePicker
            value={endTime}
            disabled
            placeholder={startTime ? "No task duration on this plan" : "Select a start time first"}
            onValueChange={() => undefined}
          />
          {startTime && durationMinutes > 0 ? (
            <p className="mt-1.5 text-[11px] text-slate-400">
              {lockTimes
                ? "Times are locked for this shift. You can still change workers."
                : `Fixed from the ${durationMinutes}m total duration.`}
            </p>
          ) : lockTimes ? (
            <p className="mt-1.5 text-[11px] text-slate-400">Times are locked for this shift. You can still change workers.</p>
          ) : null}
        </div>
      </div>

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
        {!startTime ? (
          <p className="py-12 text-center text-xs text-slate-400">Select a start time to see eligible workers.</p>
        ) : !timesValid ? (
          <p className="py-12 text-center text-xs text-slate-400">This plan needs a task duration before workers can be assigned.</p>
        ) : isFetching && eligible.length === 0 ? (
          Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-100" />
          ))
        ) : visible.length === 0 ? (
          <p className="py-12 text-center text-xs text-slate-400">No eligible workers found</p>
        ) : (
          visible.map(({ worker, is_conflict, is_available, conflict_reason }) => {
            const id = workerIdOf(worker);
            const name = workerName(worker);
            const checked = picked.has(id);
            const isConflict = Boolean(is_conflict);
            const isForced = Boolean(forcedWorkers[id]);
            const unavailable = is_available === false;
            const needsForce = isConflict || unavailable;

            return (
              <div
                key={id}
                className={`rounded-lg border p-3 transition-colors ${
                  isForced && checked
                    ? "border-amber-300 bg-amber-50/40 ring-1 ring-amber-200"
                    : unavailable
                    ? "border-red-200 bg-red-50"
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
                      onChange={() => toggle(id)}
                      aria-label={`Assign ${name}`}
                      className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-primary"
                    />

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                      {initials(name)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                        {unavailable && (
                          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            Not available
                          </span>
                        )}
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

                      {unavailable && (
                        <p className="mt-1 text-xs font-medium text-red-700">
                          This worker is not available. You can still force assign them.
                        </p>
                      )}
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
                          Force enabled: Worker will be assigned anyway.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {needsForce && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleForce(id)}
                        className={`h-8 text-xs font-medium cursor-pointer ${
                          isForced
                            ? "bg-amber-100 text-amber-800 ring-amber-400 hover:bg-amber-200 hover:ring-amber-500"
                            : "bg-white text-red-600 ring-red-300 hover:bg-red-50 hover:text-red-700 hover:ring-red-400"
                        }`}
                      >
                        {isForced ? "Forced (undo)" : "Force assign"}
                      </Button>
                    )}

                    {checked && (
                      <div className="w-36 shrink-0">
                        <Select
                          value={roles[id] ?? DEFAULT_ROLE}
                          onValueChange={(value) =>
                            setRoles((current) => ({ ...current, [id]: value }))
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

      <footer className="space-y-2.5 border-t border-slate-100 px-5 py-4">
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

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {picked.size} worker{picked.size === 1 ? "" : "s"} assigned
            {chosenOverrides.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                {chosenOverrides.length} with conflict override
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={saving}>
              {embedded ? "Back" : "Cancel"}
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save assignment"}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AssignWorkersModal({
  target,
  onClose,
}: {
  target: ShiftAssignTarget;
  onClose: () => void;
}) {
  const { triggerJump, jumpClassName } = useModalJump();

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          triggerJump();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Assign workers"
        className={`flex max-h-[88vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${jumpClassName}`}
      >
        <AssignWorkersPanel target={target} onCancel={onClose} onSaved={onClose} />
      </div>
    </div>,
    document.body
  );
}

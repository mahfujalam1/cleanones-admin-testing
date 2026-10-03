"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdOutlineClose, MdWarningAmber } from "react-icons/md";
import { TbCheck, TbInfoCircle, TbUsers } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { DateField, FieldLabel, SelectField } from "@/components/shared/Field";
import { ErrorNotice, SearchInput } from "@/components/shared/ListStates";
import { TimePicker } from "@/components/ui/time-picker";
import { Select } from "@/components/ui/select";
import { apiError, apiStatus } from "@/redux/api/apiError";
import { WORKER_TYPES, workerName, type WorkerType } from "@/redux/api/endpoints/workers.api";
import { conflictLabel, planWorkDurationMinutes, useGetCleaningPlanQuery } from "@/redux/api/endpoints/cleaningPlans.api";
import {
  useBulkAssignShiftsMutation,
  useGetShiftEligibleWorkersQuery,
  useLazyGetBulkAssignPreviewQuery,
  type BulkAssignOutcome,
  type BulkAssignPreview,
  type BulkAssignPreviewDate,
  type BulkAssignRole,
} from "@/redux/api/rosterApi";
import { useModalJump } from "@/hooks/useModalJump";
import { endFromStart, toDateKey } from "./planShift";

const ROLES: BulkAssignRole[] = ["Team leader", "Co-leader", "Normal worker"];
const MAX_RANGE_DAYS = 60;

export type BulkAssignTarget = {
  planId: string;
  planTitle?: string;
  locationName?: string;
  from?: string;
  to?: string;
  selectedDates?: string[];
  staffedDates?: string[];
  assignedWorkers?: Array<{ worker_id: string; name: string }>;
  durationMinutes?: number;
};

function addDays(value: string, days: number) {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  parsed.setDate(parsed.getDate() + days);
  return toDateKey(parsed);
}

function inclusiveDays(from: string, to: string) {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function dateKey(value?: string) {
  if (!value) return "";
  return value.includes("T") ? value.slice(0, 10) : value;
}

function formatPreviewDate(item: BulkAssignPreviewDate) {
  const key = dateKey(item.date);
  const parsed = new Date(`${key}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return item.weekday || key;
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

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

function timeFromDate(value: Date) {
  return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}

function calculateEnd(date: string, startTime: string, durationMinutes: number) {
  if (!startTime || durationMinutes <= 0) return { time: "", iso: "" };
  const start = new Date(toTimestamp(date, startTime));
  const end = endFromStart(start, durationMinutes);
  if (!end) return { time: "", iso: "" };
  return { time: timeFromDate(end), iso: end.toISOString() };
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

function previewErrorMessage(error: unknown) {
  const status = apiStatus(error);
  const message = apiError(error);
  const lower = message.toLowerCase();
  if (status === 404) return "This cleaning plan could not be found.";
  if (lower.includes("60") || lower.includes("fewer")) return "Please select 60 days or fewer";
  if (lower.includes("invalid date") || (lower.includes("before") && lower.includes("from"))) {
    return "Invalid date range";
  }
  if (
    lower.includes("not available") ||
    lower.includes("blocked") ||
    lower.includes("deleted") ||
    (status === 400 && lower.includes("worker"))
  ) {
    return "This worker is not available";
  }
  return message;
}

function AssignProgress({ percent }: { percent: number }) {
  const size = 44;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const ring = 2 * Math.PI * radius;
  return (
    <div className="relative h-11 w-11 shrink-0" aria-label={`Assigning ${percent}%`}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-slate-200" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-primary transition-[stroke-dashoffset] duration-200 ease-linear"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={ring}
          strokeDashoffset={ring - (percent / 100) * ring}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">
        {percent}%
      </span>
    </div>
  );
}

function averageDuration(samples: number[]) {
  if (samples.length === 0) return 1800;
  return samples.reduce((total, value) => total + value, 0) / samples.length;
}

function startAssignProgress(
  timer: { current: ReturnType<typeof setInterval> | null },
  startedAt: { current: number },
  durations: { current: number[] },
  onTick: (percent: number) => void,
) {
  if (timer.current) {
    clearInterval(timer.current);
    timer.current = null;
  }
  startedAt.current = Date.now();
  const expectedMs = Math.max(800, Math.min(averageDuration(durations.current), 6000));
  timer.current = setInterval(() => {
    const elapsed = Date.now() - startedAt.current;
    const ratio = elapsed / expectedMs;
    const percent =
      ratio <= 1
        ? Math.round(2 + ratio * 90)
        : Math.min(99, Math.round(92 + 7 * (1 - Math.exp(-(ratio - 1) * 2))));
    onTick(percent);
  }, 50);
}

function clearAssignTimers(
  progress: { current: ReturnType<typeof setInterval> | null },
  closer: { current: ReturnType<typeof setTimeout> | null },
) {
  if (progress.current) clearInterval(progress.current);
  if (closer.current) clearTimeout(closer.current);
}

function finishAssignProgress(
  timer: { current: ReturnType<typeof setInterval> | null },
  startedAt: { current: number },
  durations: { current: number[] },
  complete: boolean,
  onComplete: (percent: number) => void,
) {
  const elapsed = Date.now() - startedAt.current;
  if (elapsed > 0) {
    durations.current = [...durations.current, elapsed].slice(-6);
  }
  if (timer.current) {
    clearInterval(timer.current);
    timer.current = null;
  }
  onComplete(complete ? 100 : 0);
}

function defaultRange(target: BulkAssignTarget) {
  const today = toDateKey(new Date());
  const selected = (target.selectedDates ?? []).map(dateKey).filter(Boolean).sort();
  const requestedFrom = dateKey(selected[0] || target.from);
  const from = requestedFrom && requestedFrom >= today ? requestedFrom : today;
  const requestedTo = dateKey(selected[selected.length - 1] || target.to);
  const maxTo = addDays(from, MAX_RANGE_DAYS - 1);
  const to = requestedTo && requestedTo >= from && requestedTo <= maxTo ? requestedTo : maxTo;
  return { from, to };
}

export function BulkAssignModal({
  target,
  onClose,
  onAssigned,
}: {
  target: BulkAssignTarget;
  onClose: () => void;
  onAssigned?: () => void;
}) {
  const { triggerJump, jumpClassName } = useModalJump();
  const initial = defaultRange(target);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [workerId, setWorkerId] = useState("");
  const [role, setRole] = useState<BulkAssignRole>("Normal worker");
  const [startTime, setStartTime] = useState("09:00");
  const [search, setSearch] = useState("");
  const [workerType, setWorkerType] = useState<WorkerType | "">("");
  const [checked, setChecked] = useState<Set<string>>(new Set(target.selectedDates?.map(dateKey) ?? []));
  const [preview, setPreview] = useState<BulkAssignPreview | null>(null);
  const [outcome, setOutcome] = useState<BulkAssignOutcome | null>(null);
  const [focusDates, setFocusDates] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [repeatPrompt, setRepeatPrompt] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressStartedAt = useRef(0);
  const assignDurations = useRef<number[]>([]);
  const [staffedDates, setStaffedDates] = useState(
    () => new Set((target.staffedDates ?? []).map(dateKey).filter(Boolean)),
  );
  const [sessionAssignedIds, setSessionAssignedIds] = useState<string[]>([]);
  const assignedWorkerIds = useMemo(
    () =>
      new Set([
        ...(target.assignedWorkers ?? []).map((worker) => worker.worker_id),
        ...sessionAssignedIds,
      ].filter(Boolean)),
    [target.assignedWorkers, sessionAssignedIds],
  );

  const { data: plan } = useGetCleaningPlanQuery(target.planId, {
    skip: !target.planId || Boolean(target.durationMinutes),
  });
  const durationMinutes = target.durationMinutes || (plan ? planWorkDurationMinutes(plan) : 0);
  const computedEnd = calculateEnd(from, startTime, durationMinutes);
  const endTime = computedEnd.time || (startTime ? "17:00" : "");
  const startIso = toTimestamp(from, startTime);
  const endIso = computedEnd.iso || toTimestamp(from, endTime);
  const timesValid = Boolean(startTime && endTime && new Date(endIso).getTime() > new Date(startIso).getTime());

  const maxTo = from ? addDays(from, MAX_RANGE_DAYS - 1) : undefined;
  const rangeDays = from && to ? inclusiveDays(from, to) : 0;
  const rangeValid = Boolean(from && to && to >= from && rangeDays > 0 && rangeDays <= MAX_RANGE_DAYS);

  const { data: eligible = [], isFetching: loadingWorkers } = useGetShiftEligibleWorkersQuery(
    { planId: target.planId, date: from, start_time: startIso, end_time: endIso },
    { skip: !target.planId || !rangeValid || !timesValid },
  );
  const [loadPreview, { isFetching: loadingPreview }] = useLazyGetBulkAssignPreviewQuery();
  const [bulkAssign, { isLoading: assigning }] = useBulkAssignShiftsMutation();

  const visibleWorkers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const fromEligible = eligible.map((row) => ({
      ...row,
      alreadyAssigned: assignedWorkerIds.has(workerIdOf(row.worker)),
    }));
    const seen = new Set(fromEligible.map((row) => workerIdOf(row.worker)).filter(Boolean));
    const extras = (target.assignedWorkers ?? [])
      .filter((worker) => worker.worker_id && !seen.has(worker.worker_id))
      .map((worker) => ({
        worker: { _id: worker.worker_id, name: worker.name, email: "", phone: "", worker_type: undefined },
        alreadyAssigned: true,
        is_available: undefined,
        is_conflict: undefined,
        conflict_reason: undefined,
        conflicting_plan_id: undefined,
      }));
    return [...extras, ...fromEligible].filter(({ worker, alreadyAssigned }) => {
      if (workerType && worker.worker_type && worker.worker_type !== workerType) return false;
      if (workerType && !worker.worker_type && !alreadyAssigned) return false;
      if (!term) return true;
      return `${workerName(worker)} ${worker.email ?? ""} ${worker.phone ?? ""}`.toLowerCase().includes(term);
    });
  }, [eligible, search, workerType, target.assignedWorkers, assignedWorkerIds]);

  const matching = preview?.matching_dates ?? [];
  const selectedDates = matching.map((item) => dateKey(item.date)).filter((date) => checked.has(date));
  const assignedKeys = useMemo(
    () => new Set((outcome?.assigned ?? []).map(dateKey).filter(Boolean)),
    [outcome],
  );
  const assignedDone = Boolean(outcome);
  const assignedCount = outcome?.counts.assigned ?? assignedKeys.size;
  const assignedDates = [...assignedKeys].map((date) => {
    const listed = matching.find((item) => dateKey(item.date) === date);
    return listed ?? { date, weekday: "" };
  });

  useEffect(() => {
    return () => clearAssignTimers(progressTimer, closeTimer);
  }, []);

  useEffect(() => {
    if (!outcome) return;
    const frame = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [outcome]);

  const resetPreview = () => {
    setPreview(null);
    setOutcome(null);
    setError("");
  };

  useEffect(() => {
    setWorkerId("");
    setFocusDates([]);
    resetPreview();
  }, [from, to, startTime]);

  const handleFromChange = (value: string) => {
    setFrom(value);
    if (to && value && to < value) setTo(value);
    else if (to && value && inclusiveDays(value, to) > MAX_RANGE_DAYS) setTo(addDays(value, MAX_RANGE_DAYS - 1));
  };

  const runPreview = async (id = workerId) => {
    setError("");
    setOutcome(null);
    if (!from || !to || to < from) {
      setError("Invalid date range");
      return;
    }
    if (inclusiveDays(from, to) > MAX_RANGE_DAYS) {
      setError("Please select 60 days or fewer");
      return;
    }
    if (!id) {
      setError("Select a worker to preview.");
      return;
    }

    try {
      const data = await loadPreview({ planId: target.planId, worker: id, from, to }, false).unwrap();
      const staffed = staffedDates;
      const focus = new Set(focusDates);
      const inScope = (date: string) => {
        if (!date || staffed.has(date)) return false;
        if (focus.size) return focus.has(date);
        return true;
      };
      const matchingDates = data.matching_dates.filter((item) => inScope(dateKey(item.date)));
      const matchingKeys = matchingDates.map((item) => dateKey(item.date)).filter(Boolean);
      const matchingSet = new Set(matchingKeys);
      const otherGapDates = (focus.size ? [...focus] : data.other_gap_dates.map((item) => dateKey(item.date)))
        .filter((date) => inScope(date) && !matchingSet.has(date))
        .map((date) => {
          const listed =
            data.other_gap_dates.find((item) => dateKey(item.date) === date) ??
            data.matching_dates.find((item) => dateKey(item.date) === date);
          return listed ?? { date, weekday: "" };
        });
      setPreview({ ...data, matching_dates: matchingDates, other_gap_dates: otherGapDates });
      setChecked(new Set(matchingKeys));
    } catch (cause) {
      setPreview(null);
      setError(previewErrorMessage(cause));
    }
  };

  const pickWorker = (id: string) => {
    if (assignedWorkerIds.has(id)) return;
    setWorkerId(id);
    void runPreview(id);
  };

  const startProgress = () => {
    setShowProgress(true);
    setProgress(2);
    startAssignProgress(progressTimer, progressStartedAt, assignDurations, setProgress);
  };

  const finishProgress = (complete: boolean) => {
    finishAssignProgress(progressTimer, progressStartedAt, assignDurations, complete, (percent) => {
      if (complete) setProgress(percent);
      else {
        setShowProgress(false);
        setProgress(0);
      }
    });
  };

  const assign = async (dates = selectedDates) => {
    setError("");
    if (dates.length === 0) {
      setError("Select at least one date to assign.");
      return;
    }
    if (dates.length > MAX_RANGE_DAYS) {
      setError("Please select 60 days or fewer");
      return;
    }
    if (!timesValid) {
      setError("End time must be after start time.");
      return;
    }

    startProgress();
    try {
      const result = await bulkAssign({
        planId: target.planId,
        worker: workerId,
        role,
        dates,
        start_time: toTimestamp(dates[0], startTime),
        end_time: toTimestamp(dates[0], endTime),
      }).unwrap();
      finishProgress(true);
      setOutcome(result);
      setStaffedDates((current) => {
        const next = new Set(current);
        for (const date of result.assigned) next.add(dateKey(date));
        for (const date of result.skipped_already_staffed) next.add(dateKey(date));
        return next;
      });
      if (result.counts.assigned > 0 && workerId) {
        setSessionAssignedIds((current) => (current.includes(workerId) ? current : [...current, workerId]));
      }
      onAssigned?.();
      const remainingGaps = preview?.other_gap_dates.length ?? 0;
      const leftover = remainingGaps > 0 || result.counts.failed > 0;
      if (remainingGaps > 0) {
        setRepeatPrompt(remainingGaps);
      }
      if (closeTimer.current) clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        setShowProgress(false);
        if (!leftover) onClose();
      }, 700);
    } catch (cause) {
      finishProgress(false);
      setError(apiError(cause));
    }
  };

  const startOverForGaps = () => {
    const gaps = (preview?.other_gap_dates ?? []).map((item) => dateKey(item.date)).filter(Boolean);
    setFocusDates(gaps);
    setWorkerId("");
    setOutcome(null);
    setPreview(null);
    setChecked(new Set(gaps));
    setRepeatPrompt(0);
    setError("");
    setShowProgress(false);
    setProgress(0);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) triggerJump();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bulk assign workers"
        className={`flex h-[88vh] max-h-[88vh] min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${jumpClassName}`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <TbUsers className="text-lg" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-slate-900">
                Bulk assign{target.planTitle ? ` — ${target.planTitle}` : ""}
              </h2>
              <p className="truncate text-xs text-slate-500">
                {[target.locationName, "Choose dates, then an eligible worker"].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        <div ref={bodyRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5">
          <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DateField label="From" value={from} onChange={handleFromChange} required min={toDateKey(new Date())} />
              <DateField
                label="To"
                value={to}
                onChange={setTo}
                required
                min={from || toDateKey(new Date())}
                max={maxTo}
              />
              <div>
                <FieldLabel htmlFor="bulk-start" label="Start time" required />
                <TimePicker value={startTime} onValueChange={setStartTime} />
              </div>
              <div>
                <FieldLabel htmlFor="bulk-end" label="End time" />
                <TimePicker value={endTime} disabled onValueChange={() => undefined} />
                {durationMinutes > 0 && (
                  <p className="mt-1.5 text-[11px] text-slate-400">Fixed from the {durationMinutes}m plan duration.</p>
                )}
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              {rangeValid
                ? `${rangeDays} day${rangeDays === 1 ? "" : "s"} selected · eligible workers load after the date range`
                : "Choose a range of 60 days or fewer"}
            </p>
          </section>

          <section className="rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <h3 className="pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Eligible workers</h3>
              <div className="w-44">
                <SelectField
                  label="Role"
                  value={role}
                  options={ROLES}
                  onChange={(value) => setRole(value as BulkAssignRole)}
                />
              </div>
            </div>
            <div className="grid gap-2 border-b border-slate-100 px-4 py-3 md:grid-cols-[1.6fr_1fr]">
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
            <div className="max-h-64 space-y-2 overflow-y-auto p-4">
              {!rangeValid ? (
                <p className="py-10 text-center text-xs text-slate-400">Select from and to dates to see eligible workers.</p>
              ) : !timesValid ? (
                <p className="py-10 text-center text-xs text-slate-400">This plan needs a task duration before workers can be assigned.</p>
              ) : loadingWorkers && eligible.length === 0 ? (
                Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-lg bg-slate-100" />
                ))
              ) : visibleWorkers.length === 0 ? (
                <p className="py-10 text-center text-xs text-slate-400">No eligible workers found</p>
              ) : (
                visibleWorkers.map(({ worker, is_conflict, conflict_reason, alreadyAssigned }) => {
                  const id = workerIdOf(worker);
                  const name = workerName(worker);
                  const isDisabled = Boolean(alreadyAssigned);
                  const picked = !isDisabled && workerId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => !isDisabled && pickWorker(id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                        isDisabled
                          ? "cursor-not-allowed border-slate-200 bg-slate-50/70 opacity-60"
                          : picked
                            ? "border-primary/40 bg-sky-50/70"
                            : is_conflict
                              ? "border-red-200 bg-red-50/40 hover:border-red-300"
                              : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="bulk-assign-worker"
                        disabled={isDisabled}
                        checked={picked}
                        onChange={() => !isDisabled && pickWorker(id)}
                        className="h-4 w-4 accent-primary disabled:cursor-not-allowed"
                      />
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                        {initials(name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold text-slate-900">{name}</span>
                          {alreadyAssigned && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Assigned
                            </span>
                          )}
                          {is_conflict && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              Conflict
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {worker.worker_type?.toLowerCase()} · {worker.email}
                        </span>
                        {is_conflict && (
                          <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-600">
                            <MdWarningAmber />
                            {conflictLabel(conflict_reason) || "Already booked at this time"}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {error ? <ErrorNotice message={error} /> : null}

          {preview && (
            <div className="space-y-3">
              {focusDates.length > 0 && !assignedDone && (
                <p className="flex items-center gap-1.5 text-xs text-amber-700">
                  <MdWarningAmber />
                  Showing the {focusDates.length} date{focusDates.length === 1 ? "" : "s"} that still need a worker
                </p>
              )}
              <section className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <TbCheck className="text-base" />
                    {assignedDone
                      ? assignedCount > 0
                        ? `Assigned (${assignedCount})`
                        : "Assignment results"
                      : `Will be assigned (${selectedDates.length}/${matching.length})`}
                  </h3>
                  {matching.length > 0 && !assignedDone && (
                    <button
                      type="button"
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
                      onClick={() => {
                        const keys = matching.map((item) => dateKey(item.date)).filter(Boolean);
                        const allOn = keys.every((key) => checked.has(key));
                        setChecked(allOn ? new Set() : new Set(keys));
                      }}
                    >
                      {matching.every((item) => checked.has(dateKey(item.date))) ? "Clear all" : "Select all"}
                    </button>
                  )}
                </div>
                {matching.length === 0 ? (
                  <p className="text-xs text-emerald-800/70">No unstaffed dates match this worker’s availability.</p>
                ) : assignedDone && assignedDates.length === 0 ? (
                  <p className="text-xs text-emerald-800/70">No new shifts were assigned for this worker.</p>
                ) : assignedDone ? (
                  <div className="grid grid-cols-5 gap-2">
                    {assignedDates.map((item) => (
                      <span
                        key={dateKey(item.date)}
                        className="flex min-w-0 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-800"
                      >
                        <TbCheck className="shrink-0 text-sm text-emerald-600" />
                        <span className="truncate">{formatPreviewDate(item)}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2">
                    {matching.map((item) => {
                      const key = dateKey(item.date);
                      const on = checked.has(key);
                      return (
                        <label
                          key={key}
                          className={`flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            on
                              ? "border-emerald-200 bg-white text-slate-800 shadow-xs"
                              : "border-slate-200 bg-white/70 text-slate-500"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={(event) => {
                              setChecked((current) => {
                                const next = new Set(current);
                                if (event.target.checked) next.add(key);
                                else next.delete(key);
                                return next;
                              });
                            }}
                            className="h-3.5 w-3.5 shrink-0 rounded border-slate-300 accent-primary"
                          />
                          <span className="truncate">{formatPreviewDate(item)}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </section>

              {preview.other_gap_dates.length > 0 && (
                <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                    <MdWarningAmber className="text-base" />
                    Still needs a worker ({preview.other_gap_dates.length})
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {preview.other_gap_dates.map((item) => (
                      <span
                        key={dateKey(item.date)}
                        className="min-w-0 truncate rounded-lg border border-amber-100 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-800"
                      >
                        {formatPreviewDate(item)}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {preview.already_covered_count > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <TbInfoCircle className="text-sky-600" />
                  {preview.already_covered_count} date{preview.already_covered_count === 1 ? "" : "s"} already staffed
                </p>
              )}
            </div>
          )}

          {loadingPreview && !preview ? (
            <p className="text-center text-xs text-slate-400">Checking matching dates…</p>
          ) : null}

          {outcome && (
            <section ref={resultRef} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
              {outcome.counts.assigned > 0 && (
                <p className="font-semibold text-emerald-700">
                  Assigned to {outcome.counts.assigned} shift{outcome.counts.assigned === 1 ? "" : "s"}
                </p>
              )}
              {outcome.counts.skipped_already_staffed > 0 && (
                <p className="text-slate-600">
                  {outcome.counts.skipped_already_staffed} shift
                  {outcome.counts.skipped_already_staffed === 1 ? " was" : "s were"} already staffed
                </p>
              )}
              {outcome.failed.length > 0 && (
                <ul className="space-y-1 text-red-700">
                  {outcome.failed.map((item) => (
                    <li key={item.date}>
                      {dateKey(item.date)}: {item.message}
                    </li>
                  ))}
                </ul>
              )}
              {repeatPrompt > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sky-800">
                  <p>{repeatPrompt} date{repeatPrompt === 1 ? "" : "s"} still need a worker — assign someone else?</p>
                  <Button size="sm" variant="secondary" onClick={startOverForGaps}>
                    Assign someone else
                  </Button>
                </div>
              )}
            </section>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-3">
          {showProgress && <AssignProgress percent={progress} />}
          <Button variant="secondary" onClick={onClose} disabled={showProgress && progress < 100}>
            Close
          </Button>
          {preview && !assignedDone && (
            <Button
              disabled={assigning || showProgress || selectedDates.length === 0 || !timesValid}
              onClick={() => void assign()}
            >
              {showProgress ? "Assigning…" : `Assign ${selectedDates.length} shift${selectedDates.length === 1 ? "" : "s"}`}
            </Button>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}

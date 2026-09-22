"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  MdCheckCircle,
  MdOutlineClose,
  MdOutlineGroupAdd,
  MdOutlineMeetingRoom,
  MdOutlinePhotoCamera,
  MdPerson,
} from "react-icons/md";
import { useGetSingleLiveShiftQuery } from "@/redux/api/shiftsApi";
import { apiError } from "@/redux/api/apiError";
import { ErrorNotice } from "@/components/shared/ListStates";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { AssignWorkersModal, formatAssignDateLabel, type ShiftAssignTarget } from "@/components/cleaningPlans/AssignWorkersModal";
import { canReassign } from "@/components/shift-management/planShift";
import { useModalJump } from "@/hooks/useModalJump";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation, getUiTranslation } from "@/lib/translations";
import { formatTime12, isShiftCompleted, type Shift } from "./types";

export function LiveShiftDetailModal({
  shiftId,
  fallback,
  onClose,
  onAssigned,
}: {
  shiftId: string;
  fallback?: Shift;
  onClose: () => void;
  onAssigned?: () => void;
}) {
  const locale = getLocale(usePathname());
  const ui = getUiTranslation(locale);
  const dash = getDashboardTranslation(locale);
  const roster = dash.roster;
  const { data: shift, isLoading, error, refetch } = useGetSingleLiveShiftQuery(shiftId);
  const { triggerJump, jumpClassName } = useModalJump();
  const [assigning, setAssigning] = useState(false);

  const planTitle =
    typeof shift?.cleaning_plan === "object"
      ? shift.cleaning_plan?.title
      : fallback?.location || roster.title;
  const planId =
    (typeof shift?.cleaning_plan === "object" ? shift.cleaning_plan?._id : "") ||
    fallback?.planId ||
    "";
  const status = shift?.status || fallback?.status || "";
  const completed = isShiftCompleted(status);
  const locationName = shift?.location?.name || fallback?.location || ui.notSet;
  const clientName = shift?.client?.name || ui.notSet;
  const startIso = shift?.date_time || fallback?.startAt || "";
  const endIso = shift?.end_time || "";
  const start = formatClock(startIso) || formatTime12(fallback?.startTime);
  const end = formatClock(endIso) || formatTime12(fallback?.endTime);
  const dateKey = dateKeyOf(startIso || shift?.date) || fallback?.date || "";
  const dateLabel = dateKey ? formatAssignDateLabel(dateKey) : ui.notSet;
  const duration = shift?.duration_minutes;
  const progress = Math.min(100, Math.max(0, shift?.overall_progress_percent ?? (completed ? 100 : 0)));
  const rooms = shift?.rooms ?? [];
  const tasks = shift?.tasks ?? [];
  const workers = shift?.assigned_workers ?? shift?.workers ?? [];
  const assignedWorkers = workers
    .map((worker) => ({
      worker_id: worker.worker_id || worker.worker || "",
      name: worker.name,
      role: worker.role || worker.shift_role,
    }))
    .filter((worker) => worker.worker_id);
  const photoCount = tasks.reduce((total, task) => {
    const named = task.photo_requirements?.filter((photo) => photo.title)?.length ?? 0;
    if (named > 0) return total + named;
    return total + (task.is_photo_required ? 1 : 0);
  }, 0);
  const canAssign = Boolean(
    planId &&
    dateKey &&
    canReassign({
      startTime: startIso || fallback?.startTime,
      date: dateKey,
      status,
    }),
  );
  const assignTarget: ShiftAssignTarget | undefined = canAssign
    ? {
        planId,
        date: dateKey,
        planTitle,
        locationName,
        startTime: startIso || fallback?.startTime,
        endTime: endIso || fallback?.endTime,
        durationMinutes: duration,
        assignedWorkers,
      }
    : undefined;
  const assignLabel = assignedWorkers.length > 0 ? dash.common.manageWorkers : dash.common.assignWorkers;

  if (typeof document === "undefined") return null;

  const details = createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) triggerJump();
      }}
    >
      <div
        className={`flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150 ${jumpClassName}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {ui.shifts}
              </span>
              {status ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                    completed
                      ? "bg-emerald-50 text-emerald-700"
                      : status.toLowerCase() === "in_progress"
                        ? "bg-sky-50 text-sky-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {statusLabel(status, ui)}
                </span>
              ) : null}
            </div>
            <h3 className="truncate text-base font-semibold text-slate-800">{planTitle}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {[locationName, dateLabel !== ui.notSet ? dateLabel : ""].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={ui.close}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <MdOutlineClose className="text-lg" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <DetailSkeleton blocks={5} />
          ) : error ? (
            <ErrorNotice message={apiError(error)} />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Tile label={ui.duration} value={duration ? `${duration}m` : ui.notSet} />
                <Tile
                  label={ui.rooms}
                  value={String(shift?.total_room ?? rooms.length)}
                />
                <Tile label={ui.tasks} value={String(shift?.total_task ?? tasks.length)} />
                <Tile label={ui.progress} value={`${progress}%`} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Fact label={ui.date} value={dateLabel} />
                <Fact label={roster.startTime} value={start || ui.notSet} />
                <Fact label={roster.endTime} value={end || ui.notSet} />
                <Fact label={ui.client} value={clientName} />
                <Fact label={ui.location} value={locationName} />
              </div>

              {rooms.length > 0 && (
                <section className="rounded-lg border border-slate-200 p-4">
                  <h4 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <MdOutlineMeetingRoom /> {ui.rooms} ({rooms.length})
                  </h4>
                  <ul className="space-y-2">
                    {rooms.map((room, index) => (
                      <li
                        key={room.room || `${room.name}-${index}`}
                        className="rounded-lg border border-slate-200 bg-slate-50/60 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{room.name}</p>
                            {room.room_type ? (
                              <p className="text-xs text-slate-500">{room.room_type}</p>
                            ) : null}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600">
                            {room.completed_task ?? 0}/{room.total_task ?? 0} {ui.tasks}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-sky-500"
                            style={{ width: `${Math.min(100, Math.max(0, room.progress_percent ?? 0))}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {tasks.length > 0 && (
                <section className="rounded-lg border border-slate-200 p-4">
                  <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {ui.tasks} ({tasks.length})
                    {photoCount > 0 ? ` · ${photoCount} ${ui.photos}` : ""}
                  </h4>
                  <ul className="space-y-2">
                    {tasks.map((task, index) => {
                      const photos = (task.photo_requirements ?? []).filter((photo) => photo.title);
                      return (
                        <li
                          key={task.task || `${task.name}-${index}`}
                          className="rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-slate-800">{task.name}</p>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                task.is_completed
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {task.is_completed ? ui.completed : ui.pending}
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            {typeof task.duration_minutes === "number" ? (
                              <span>{task.duration_minutes}m</span>
                            ) : null}
                            {task.is_photo_required ? (
                              <span className="inline-flex items-center gap-1 text-amber-600">
                                <MdOutlinePhotoCamera /> {ui.photo}
                              </span>
                            ) : null}
                          </div>
                          {photos.length > 0 ? (
                            <ul className="mt-2 space-y-1">
                              {photos.map((photo, photoIndex) => (
                                <li
                                  key={`${photo.title}-${photoIndex}`}
                                  className="flex items-start gap-2 rounded bg-slate-50 px-2 py-1.5 text-[11px]"
                                >
                                  {photo.photo_url ? (
                                    <img
                                      src={photo.photo_url}
                                      alt={photo.title}
                                      className="h-10 w-10 shrink-0 rounded object-cover"
                                    />
                                  ) : null}
                                  <span className="min-w-0 flex-1">
                                    <span className="font-medium text-slate-700">{photo.title}</span>
                                    {photo.description ? (
                                      <span className="mt-0.5 block text-slate-500">{photo.description}</span>
                                    ) : null}
                                  </span>
                                  <span className={photo.is_uploaded ? "text-emerald-600" : "text-slate-400"}>
                                    {photo.is_uploaded ? ui.completed : ui.pending}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {(workers.length > 0 || canAssign) && (
                <section className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      <MdPerson /> {ui.workers} ({workers.length})
                    </h4>
                    {canAssign ? (
                      <Button size="sm" onClick={() => setAssigning(true)}>
                        <MdOutlineGroupAdd className="text-sm" /> {assignLabel}
                      </Button>
                    ) : null}
                  </div>
                  {workers.length === 0 ? (
                    <p className="text-xs text-slate-400">{ui.noDataFound}</p>
                  ) : (
                    <ul className="space-y-2">
                      {workers.map((worker, index) => (
                        <li
                          key={worker.worker_id || worker.worker || `${worker.name}-${index}`}
                          className="flex items-center gap-3 rounded-lg border border-slate-200 p-2.5"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">
                            {initials(worker.name)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">{worker.name}</p>
                            <p className="truncate text-xs text-slate-400">
                              {worker.role || worker.shift_role || ui.worker}
                            </p>
                          </div>
                          <div className="shrink-0 text-right text-[11px] text-slate-500">
                            <p>{ui.checkIn} {formatClock(worker.check_in_at || worker.check_in_time || worker.checkin_time) || ui.notSet}</p>
                            <p>{roster.endTime} {formatClock(worker.check_out_at) || ui.notSet}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
          {completed ? (
            <span className="mr-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <MdCheckCircle /> {ui.completed}
            </span>
          ) : canAssign ? (
            <span className="mr-auto">
              <Button size="sm" onClick={() => setAssigning(true)}>
                <MdOutlineGroupAdd className="text-sm" /> {assignLabel}
              </Button>
            </span>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {ui.close}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );

  return (
    <>
      {details}
      {assigning && assignTarget ? (
        <AssignWorkersModal
          target={assignTarget}
          onClose={() => {
            setAssigning(false);
            void refetch();
            onAssigned?.();
          }}
        />
      ) : null}
    </>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  );
}

function statusLabel(value: string, ui: ReturnType<typeof getUiTranslation>) {
  const key = value.toLowerCase();
  if (key === "completed") return ui.completed;
  if (key === "in_progress") return ui.inProgress;
  if (key === "upcoming") return ui.upcoming;
  if (key === "pending") return ui.pending;
  return value.replaceAll("_", " ");
}

function initials(name?: string) {
  if (!name) return "W";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function formatClock(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime()) && (value.includes("T") || value.includes("-"))) {
    const hours = parsed.getHours();
    const minutes = String(parsed.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${minutes} ${period}`;
  }
  return formatTime12(value);
}

function dateKeyOf(value?: string | null) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
}

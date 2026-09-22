"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  MdChevronLeft,
  MdDeleteOutline,
  MdModeEditOutline,
  MdCheckCircle,
  MdOutlineAssignment,
  MdOutlineBusinessCenter,
  MdOutlineClose,
  MdOutlineGroupAdd,
  MdOutlineMeetingRoom,
  MdOutlinePhotoCamera,
  MdOutlinePlace,
  MdOutlineSchedule,
} from "react-icons/md";
import { ErrorNotice } from "@/components/shared/ListStates";
import { Button } from "@/components/ui/button";
import { apiError } from "@/redux/api/apiError";
import { refDoc, refId } from "@/redux/api/types";
import { clientCompanyLabel, CLIENT_LOOKUP_ARGS, useGetClientsQuery, type Client } from "@/redux/api/endpoints/clients.api";
import type { Location } from "@/redux/api/endpoints/locations.api";
import type { Room } from "@/redux/api/endpoints/rooms.api";
import type { AdditionalTask } from "@/redux/api/endpoints/additionalTasks.api";
import type { Worker } from "@/redux/api/endpoints/workers.api";
import { workerName } from "@/redux/api/endpoints/workers.api";
import {
  planCounts,
  planWorkDurationMinutes,
  useGetCleaningPlanQuery,
  type CleaningPlan,
} from "@/redux/api/endpoints/cleaningPlans.api";
import { useModalJump } from "@/hooks/useModalJump";
import { getLocale } from "@/lib/locale";
import { getScreenCopy } from "@/lib/screen-copy";
import { usePathname } from "next/navigation";
import {
  AssignWorkersPanel,
  formatAssignDateLabel,
  type ShiftAssignTarget,
} from "@/components/cleaningPlans/AssignWorkersModal";
import type { PlanRosterAssignedWorker, PlanShiftDetail } from "@/redux/api/rosterApi";
import { normalizePlanShift, useGetPlanShiftQuery } from "@/redux/api/rosterApi";
import { useGetSingleLiveShiftQuery } from "@/redux/api/shiftsApi";
import {
  canReassign,
  endFromStart,
  formatClock,
  hasShiftStarted,
  statusLabel,
} from "@/components/shift-management/planShift";

const formatDateTime = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.toLocaleDateString()} · ${parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};



const formatPlanEnd = (start?: string, minutes?: number, endDate?: string) => {
  if (start && minutes) {
    const parsed = new Date(start);
    if (!Number.isNaN(parsed.getTime())) {
      const end = endFromStart(parsed, minutes);
      if (end) return formatDateTime(end.toISOString());
    }
  }
  return formatDate(endDate);
};

function computedEndIso(start?: string | null, durationMinutes?: number, date?: string) {
  if (!start || !durationMinutes || durationMinutes <= 0) return undefined;
  const parsed = /^\d{2}:\d{2}$/.test(start) && date
    ? new Date(`${date}T${start}:00`)
    : new Date(start);
  return endFromStart(parsed, durationMinutes)?.toISOString();
}

const formatDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

function Tile({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200/70">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg text-slate-400 ring-1 ring-slate-200/70">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
        <p className="truncate text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-white ring-1 ring-slate-200/70">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Detail({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-base text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-slate-800">{children || "—"}</p>
      </div>
    </div>
  );
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function PlanBody({
  plan,
  assignedWorkers,
}: {
  plan: CleaningPlan;
  assignedWorkers?: PlanRosterAssignedWorker[];
}) {
  const copy = getScreenCopy(getLocale(usePathname()));
  const { data: clientPage } = useGetClientsQuery(CLIENT_LOOKUP_ARGS);
  const populatedClient = refDoc<Client>(plan.client);
  const client =
    populatedClient ?? clientPage?.result.find((candidate) => candidate._id === refId(plan.client));
  const clientDisplay = client ? clientCompanyLabel(client) : refId(plan.client);

  const rawLocation = plan.location;
  const location = refDoc<Location>(rawLocation);
  const locationName =
    location?.name ||
    (typeof rawLocation === "object" && rawLocation ? (rawLocation as { name?: string }).name : "") ||
    refId(rawLocation);

  const counts = planCounts(plan);
  const rooms = (plan.rooms ?? []).map((room) => refDoc<Room>(room)).filter(Boolean) as Room[];
  const tasks = (plan.additional_tasks ?? [])
    .map((task) => refDoc<AdditionalTask>(task))
    .filter(Boolean) as AdditionalTask[];

  const allRoomTasks = rooms.flatMap((r) => r.tasks ?? []);
  const roomPhotos = rooms.reduce(
    (sum, r) => sum + (r.tasks ?? []).reduce((tsum, t) => tsum + (t.photo_requirements?.filter((photo) => photo.title)?.length ?? 0), 0),
    0
  );
  const additionalPhotos = tasks.reduce(
    (total, task) => total + (task.photo_requirements?.filter((photo) => photo.title)?.length ?? 0),
    0,
  );
  const totalPhotos = roomPhotos + additionalPhotos;
  const totalTasksDisplay = allRoomTasks.length + tasks.length || counts.tasks;

  const crew = assignedWorkers
    ? assignedWorkers
        .filter((worker) => worker.worker_id || worker.name)
        .map((worker) => ({
          id: worker.worker_id || worker.name,
          name: worker.name,
          role: worker.role,
          conflict: false,
        }))
    : (plan.assigned_workers ?? []).map((assignment, index) => {
        const worker = refDoc<Worker>(assignment.worker);
        return {
          id: `${refId(assignment.worker)}-${index}`,
          name: worker ? workerName(worker) : refId(assignment.worker),
          role: assignment.role,
          conflict: Boolean(assignment.assigned_with_conflict),
        };
      });

  const durationMinutes = planWorkDurationMinutes(plan);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          icon={<MdOutlineSchedule />}
          value={durationMinutes > 0 ? `${durationMinutes}m` : "—"}
          label={copy.totalDuration}
        />
        <Tile icon={<MdOutlineMeetingRoom />} value={rooms.length || counts.rooms} label={copy.rooms} />
        <Tile icon={<MdOutlineAssignment />} value={totalTasksDisplay} label={copy.tasks} />
        <Tile icon={<MdOutlinePhotoCamera />} value={totalPhotos} label={copy.photos} />
      </div>

      <div className={`grid gap-4 ${assignedWorkers || crew.length > 0 ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
        <div className="space-y-4">
          <Panel title={copy.clientAndLocation}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail icon={<MdOutlineBusinessCenter />} label={copy.client}>
                {clientDisplay}
              </Detail>
              <Detail icon={<MdOutlinePlace />} label={copy.location}>
                {locationName}
              </Detail>
            </div>

            {(plan.description || plan.note) && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">{copy.description}</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {plan.description || plan.note}
                </p>
              </div>
            )}
          </Panel>

          <Panel title={`${copy.rooms} (${rooms.length || counts.rooms})`}>
            {rooms.length === 0 ? (
              <p className="text-xs text-slate-400">No rooms on this plan.</p>
            ) : (
              <ul className="space-y-3">
                {rooms.map((room) => (
                  <li
                    key={room._id}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2.5 transition-colors hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-base text-sky-600 ring-1 ring-sky-100">
                          <MdOutlineMeetingRoom />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{room.name}</p>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                            <span>{room.room_type}</span>
                            {room.cleaning_type && <span>· {room.cleaning_type}</span>}
                            {typeof room.floor === "number" && <span>· Floor {room.floor}</span>}
                          </div>
                        </div>
                      </div>

                      {room.tasks && room.tasks.length > 0 && (
                        <span className="shrink-0 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 border border-sky-100">
                          {room.tasks.length} {room.tasks.length === 1 ? copy.task : copy.tasks}
                        </span>
                      )}
                    </div>

                    
                    {room.tasks && room.tasks.length > 0 && (
                      <div className="mt-2 space-y-2 border-t border-slate-200/60 pt-2">
                        {room.tasks.map((task, taskIdx) => {
                          const photos = (task.photo_requirements ?? []).filter((photo) => photo.title);
                          return (
                            <div
                              key={task._id || taskIdx}
                              className="rounded-lg bg-white px-2.5 py-2 text-xs text-slate-700 ring-1 ring-slate-200/60"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="min-w-0 truncate font-medium">{task.name}</span>
                                <div className="flex shrink-0 items-center gap-2 text-[10px] text-slate-500">
                                  {task.frequency_type && (
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 capitalize">
                                      {task.frequency_type}
                                    </span>
                                  )}
                                  {typeof task.duration_minutes === "number" && task.duration_minutes > 0 && (
                                    <span>{task.duration_minutes}m</span>
                                  )}
                                  {task.is_photo_required && (
                                    <span className="flex items-center gap-0.5 font-medium text-amber-600">
                                      <MdOutlinePhotoCamera />
                                      {photos.length ? `${photos.length} ${copy.photos.toLowerCase()}` : copy.photo}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {photos.length > 0 ? (
                                <ul className="mt-2 space-y-1">
                                  {photos.map((photo, photoIndex) => (
                                    <li
                                      key={`${photo.title}-${photoIndex}`}
                                      className="rounded bg-slate-50 px-2 py-1.5 text-[11px]"
                                    >
                                      <span className="font-medium text-slate-700">{photo.title}</span>
                                      {photo.description ? (
                                        <span className="mt-0.5 block text-slate-500">{photo.description}</span>
                                      ) : null}
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {tasks.length > 0 && (
          <Panel title={`${copy.additionalTasks} (${tasks.length})`}>
            <ul className="space-y-2.5">
                {tasks.map((task) => (
                  <li key={task._id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{task.name}</p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            task.is_completed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {task.is_completed ? "Completed" : "Incomplete"}
                        </span>
                        
                        {task.status === "Approved" && (
                          <MdCheckCircle
                            aria-label="Approved"
                            title="Approved"
                            className="text-base text-emerald-600"
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      {formatDate(task.date_time) && <span>{formatDate(task.date_time)}</span>}
                      {typeof task.duration_minutes === "number" && <span>{task.duration_minutes} min</span>}
                      {task.is_photo_required && (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <MdOutlinePhotoCamera className="text-xs" />
                          {task.photo_requirements?.length
                            ? `${task.photo_requirements.length} ${copy.photos.toLowerCase()}`
                            : copy.photoRequired}
                        </span>
                      )}
                      {task.status === "Rejected" ? (
                        <span className="text-red-600">Rejected</span>
                      ) : task.status && task.status !== "Approved" ? (
                        <span className="text-amber-600">Awaiting approval</span>
                      ) : null}
                    </div>

                    {task.photo_requirements?.some((photo) => photo.title) ? (
                      <ul className="mt-2 space-y-1">
                        {task.photo_requirements.filter((photo) => photo.title).map((photo, index) => (
                          <li
                            key={`${photo.title}-${index}`}
                            className="rounded bg-slate-50 px-2 py-1.5 text-[11px]"
                          >
                            <span className="font-medium text-slate-700">{photo.title}</span>
                            {photo.description ? (
                              <span className="mt-0.5 block text-slate-500">{photo.description}</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
            </ul>
          </Panel>
          )}
        </div>

        {(assignedWorkers || (plan.assigned_workers ?? []).length > 0) && (
        <Panel title={`${copy.assignedWorkers} (${crew.length})`}>
          {crew.length === 0 ? (
            <p className="text-xs text-slate-400">Nobody assigned yet. Staff each due date from Shift Management.</p>
          ) : (
            <ul className="space-y-2.5">
              {crew.map((assignment) => (
                <li key={assignment.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                    {initials(assignment.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{assignment.name}</p>
                    <p className="truncate text-xs text-slate-400">{assignment.role || copy.worker}</p>
                  </div>
                  {assignment.conflict && (
                    <span
                      title="This worker is already booked at that time"
                      className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"
                    >
                      Conflict
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        )}
      </div>
    </div>
  );
}

function ShiftBody({
  shift,
  schedule,
  onManage,
  manageLabel,
}: {
  shift: PlanShiftDetail;
  schedule: { date?: string; startTime?: string | null; endTime?: string | null };
  onManage?: () => void;
  manageLabel?: string;
}) {
  const copy = getScreenCopy(getLocale(usePathname()));
  const rooms = shift.room_items ?? [];
  const tasks = shift.task_items ?? [];
  const photoCount = tasks.reduce((total, task) => {
    const required = task.photo_requirements?.filter((photo) => photo.title)?.length ?? 0;
    if (required > 0) return total + required;
    return total + (task.is_photo_required ? 1 : 0);
  }, 0);
  const crew = (shift.assigned_workers ?? [])
    .filter((worker) => worker.worker_id || worker.name)
    .map((worker) => ({
      id: worker.worker_id || worker.name,
      name: worker.name,
      role: worker.role,
    }));
  const durationMinutes = shift.duration_minutes ?? 0;
  const locationName = shift.location_name;
  const clientName = shift.client_name;
  const dateLabel = schedule.date ? formatAssignDateLabel(schedule.date) : "";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          icon={<MdOutlineSchedule />}
          value={durationMinutes > 0 ? `${durationMinutes}m` : "—"}
          label={copy.totalDuration}
        />
        <Tile icon={<MdOutlineMeetingRoom />} value={rooms.length || shift.rooms?.total || 0} label={copy.rooms} />
        <Tile icon={<MdOutlineAssignment />} value={tasks.length || shift.tasks?.total || 0} label={copy.tasks} />
        <Tile icon={<MdOutlinePhotoCamera />} value={photoCount} label={copy.photos} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel title={copy.clientAndLocation}>
            <div className="grid gap-4 sm:grid-cols-2">
              {dateLabel ? (
                <Detail icon={<MdOutlineSchedule />} label="Date">
                  {dateLabel}
                </Detail>
              ) : null}
              <Detail icon={<MdOutlinePlace />} label={copy.location}>
                {locationName}
              </Detail>
              {clientName ? (
                <Detail icon={<MdOutlineBusinessCenter />} label={copy.client}>
                  {clientName}
                </Detail>
              ) : null}
              <Detail icon={<MdOutlineSchedule />} label={copy.startTime}>
                {formatClock(schedule.startTime) || "—"}
              </Detail>
              <Detail icon={<MdOutlineSchedule />} label={copy.endTime}>
                {formatClock(schedule.endTime)
                  || formatPlanEnd(schedule.startTime ?? undefined, durationMinutes)
                  || "—"}
              </Detail>
            </div>

            {shift.description && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">{copy.description}</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {shift.description}
                </p>
              </div>
            )}
          </Panel>

          <Panel title={`${copy.rooms} (${rooms.length})`}>
            {rooms.length === 0 ? (
              <p className="text-xs text-slate-400">No rooms on this shift.</p>
            ) : (
              <ul className="space-y-3">
                {rooms.map((room) => (
                  <li
                    key={room.id || room.name}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-base text-sky-600 ring-1 ring-sky-100">
                        <MdOutlineMeetingRoom />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{room.name}</p>
                        {room.room_type && <p className="text-xs text-slate-500">{room.room_type}</p>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`${copy.tasks} (${tasks.length})${photoCount > 0 ? ` · ${photoCount} ${copy.photos}` : ""}`}>
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400">No tasks on this shift.</p>
            ) : (
              <ul className="space-y-2.5">
                {tasks.map((task) => {
                  const photos = (task.photo_requirements ?? []).filter((photo) => photo.title);
                  return (
                    <li key={task.id || task.name} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{task.name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            task.is_completed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {task.is_completed ? "Completed" : "Incomplete"}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                        {typeof task.duration_minutes === "number" && <span>{task.duration_minutes} min</span>}
                        {task.is_photo_required && (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <MdOutlinePhotoCamera className="text-xs" />
                            {photos.length ? `${photos.length} ${copy.photos.toLowerCase()}` : copy.photoRequired}
                          </span>
                        )}
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
                                {photo.is_uploaded ? "Uploaded" : "Pending"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <Panel title={`${copy.assignedWorkers} (${crew.length})`}>
          {crew.length === 0 ? (
            <p className="text-xs text-slate-400">Nobody assigned yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {crew.map((assignment) => (
                <li key={assignment.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                    {initials(assignment.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{assignment.name}</p>
                    <p className="truncate text-xs text-slate-400">{assignment.role || copy.worker}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {onManage && (
            <div className="mt-3">
              <Button size="sm" className="w-full" onClick={onManage}>
                <MdOutlineGroupAdd className="text-sm" /> {manageLabel ?? "Manage workers"}
              </Button>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export function PlanDetailModal({
  planId,
  shiftDate,
  liveShiftId,
  onClose,
  onEdit,
  onEditShiftPlan,
  onDelete,
  onAssign,
  assignTarget,
  assignedWorkers,
  shiftSchedule,
  onAssigned,
}: {
  planId: string;
  shiftDate?: string;
  liveShiftId?: string;
  onClose: () => void;
  onEdit?: (plan: CleaningPlan) => void;
  onEditShiftPlan?: (planId: string) => void;
  onDelete?: (plan: CleaningPlan) => void;
  onAssign?: (plan: CleaningPlan) => void;
  assignTarget?: ShiftAssignTarget;
  assignedWorkers?: PlanRosterAssignedWorker[];
  shiftSchedule?: { date?: string; startTime?: string | null; endTime?: string | null };
  onAssigned?: () => void;
}) {
  const fromShift = Boolean(shiftDate || liveShiftId);
  const { data: plan, isLoading: planLoading, error: planError } = useGetCleaningPlanQuery(planId, {
    skip: fromShift || !planId,
  });
  const { data: planShiftFromDate, isLoading: shiftLoading, error: shiftError } = useGetPlanShiftQuery(
    { planId, date: shiftDate ?? "" },
    { skip: !shiftDate || Boolean(liveShiftId) },
  );
  const { data: liveShift, isLoading: liveLoading, error: liveError } = useGetSingleLiveShiftQuery(liveShiftId ?? "", {
    skip: !liveShiftId,
  });
  const liveShiftDetail = liveShift ? normalizePlanShift(liveShift) : undefined;
  const planShift: PlanShiftDetail | undefined = liveShiftDetail ?? planShiftFromDate;
  const isLoading = liveShiftId ? liveLoading : fromShift ? shiftLoading : planLoading;
  const error = liveShiftId ? liveError : fromShift ? shiftError : planError;
  const active = plan?.is_active ?? plan?.status === "active";
  const shiftStatus = statusLabel(planShift?.status);
  const { triggerJump, jumpClassName } = useModalJump();
  const [step, setStep] = useState<"details" | "assign">("details");
  const assigning = step === "assign";
  const liveWorkers = planShift?.assigned_workers ?? assignedWorkers ?? assignTarget?.assignedWorkers;
  const startTime = planShift?.start_time ?? shiftSchedule?.startTime ?? assignTarget?.startTime;
  const durationMinutes =
    planShift?.duration_minutes || assignTarget?.durationMinutes || (plan ? planWorkDurationMinutes(plan) : 0);
  const liveSchedule = {
    date: shiftDate ?? planShift?.date ?? shiftSchedule?.date ?? assignTarget?.date,
    startTime,
    endTime:
      computedEndIso(startTime, durationMinutes, shiftDate ?? planShift?.date ?? shiftSchedule?.date ?? assignTarget?.date)
      ?? (durationMinutes ? undefined : planShift?.end_time ?? shiftSchedule?.endTime ?? assignTarget?.endTime),
  };
  const resolvedPlanId = planShift?.plan_id || planId;
  const liveAssignTarget = (assignTarget || shiftDate || liveShiftId)
    ? {
        planId: resolvedPlanId,
        date: liveSchedule.date ?? shiftDate ?? assignTarget?.date ?? "",
        planTitle: assignTarget?.planTitle ?? planShift?.plan_title ?? plan?.title,
        locationName: assignTarget?.locationName ?? planShift?.location_name,
        startTime: liveSchedule.startTime ?? undefined,
        endTime: liveSchedule.endTime ?? undefined,
        durationMinutes: durationMinutes || undefined,
        assignedWorkers: liveWorkers,
      }
    : undefined;
  const staffable = fromShift
    ? canReassign({
        startTime,
        date: liveSchedule.date,
        status: planShift?.status,
      })
    : Boolean(assignTarget) || Boolean(onAssign);
  const canAssign = Boolean(staffable && (liveAssignTarget || onAssign));
  const title = assignTarget?.planTitle || planShift?.plan_title || planShift?.location_name || plan?.title || "Cleaning plan";
  const crewCount = (liveWorkers ?? []).length;
  const isStaffed = crewCount > 0;
  const schedule = liveSchedule;
  const canEditShiftPlan = Boolean(
    fromShift
      && onEditShiftPlan
      && !isStaffed
      && !hasShiftStarted(schedule.startTime, schedule.date),
  );
  const scheduleLabel = [
    schedule.date ? formatAssignDateLabel(schedule.date) : "",
    formatClock(schedule.startTime) && formatClock(schedule.endTime)
      ? `${formatClock(schedule.startTime)} – ${formatClock(schedule.endTime)}`
      : formatClock(schedule.startTime) || formatClock(schedule.endTime),
  ].filter(Boolean).join(" · ");

  useEffect(() => {
    setStep("details");
  }, [planId, shiftDate, liveShiftId]);

  const goAssign = () => {
    if (liveAssignTarget) {
      setStep("assign");
      return;
    }
    if (plan) onAssign?.(plan);
  };

  if (typeof document === "undefined") return null;

  
  
  
  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          triggerJump();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={assigning ? "Assign workers" : "Cleaning plan"}
        className={`flex h-[88vh] max-h-[88vh] min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-slate-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${jumpClassName}`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            {assigning ? (
              <button
                type="button"
                onClick={() => setStep("details")}
                aria-label="Back to plan details"
                className="mt-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-slate-50 text-lg text-slate-500 ring-1 ring-slate-200/70 transition-colors hover:bg-slate-100 hover:text-slate-800"
              >
                <MdChevronLeft />
              </button>
            ) : (
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg text-slate-400 ring-1 ring-slate-200/70">
                <MdOutlineAssignment />
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-semibold text-slate-900">
                  {assigning ? (isStaffed ? "Manage workers" : "Assign workers") : title}
                </h2>
                {!assigning && (fromShift ? Boolean(shiftStatus) : Boolean(plan)) && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      fromShift
                        ? "bg-emerald-50 text-emerald-700"
                        : active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {fromShift ? shiftStatus : active ? "Active" : "Inactive"}
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {assigning && liveAssignTarget
                  ? [plan?.title ?? liveAssignTarget.planTitle, liveAssignTarget.locationName, formatAssignDateLabel(liveAssignTarget.date)]
                      .filter(Boolean)
                      .join(" · ")
                  : scheduleLabel}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {canEditShiftPlan && !assigning && (
              <Button variant="secondary" size="sm" onClick={() => onEditShiftPlan?.(planId)}>
                <MdModeEditOutline className="text-sm" /> Edit plan
              </Button>
            )}
            {plan && onEdit && !assigning && (
              <Button variant="secondary" size="sm" onClick={() => onEdit(plan)}>
                <MdModeEditOutline className="text-sm" /> Edit
              </Button>
            )}
            {plan && onDelete && !assigning && (
              <button
                type="button"
                aria-label="Delete plan"
                onClick={() => onDelete(plan)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <MdDeleteOutline className="text-base" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:text-slate-700"
            >
              <MdOutlineClose className="text-xl" />
            </button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div
            className="flex h-full w-[200%] transition-transform duration-300 ease-out"
            style={{ transform: assigning ? "translateX(-50%)" : "translateX(0)" }}
          >
            <div className="flex h-full w-1/2 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                      {Array.from({ length: 4 }, (_, index) => (
                        <div key={index} className="h-16 animate-pulse rounded-xl bg-white" />
                      ))}
                    </div>
                    <div className="h-64 animate-pulse rounded-xl bg-white" />
                  </div>
                ) : error ? (
                  <ErrorNotice message={apiError(error)} />
                ) : fromShift && planShift ? (
                  <ShiftBody
                    shift={planShift}
                    schedule={schedule}
                    onManage={canAssign ? goAssign : undefined}
                    manageLabel={isStaffed ? "Manage workers" : "Assign workers"}
                  />
                ) : plan ? (
                  <PlanBody
                    plan={plan}
                    assignedWorkers={liveWorkers}
                  />
                ) : null}
              </div>
              {!fromShift && plan && canAssign && (
                <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-5 py-3">
                  <Button size="sm" onClick={goAssign}>
                    <MdOutlineGroupAdd className="text-sm" /> {isStaffed ? "Manage workers" : "Assign workers"}
                  </Button>
                </div>
              )}
            </div>
            <div className="flex h-full w-1/2 flex-col overflow-hidden bg-white">
              {canAssign && liveAssignTarget ? (
                <AssignWorkersPanel
                  target={liveAssignTarget}
                  embedded
                  active={assigning}
                  onCancel={() => setStep("details")}
                  onSaved={() => {
                    onAssigned?.();
                    onClose();
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

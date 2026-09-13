"use client";

import React from "react";
import {
  MdDeleteOutline,
  MdModeEditOutline,
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
import { clientLabel, type Client } from "@/redux/api/endpoints/clients.api";
import type { Location } from "@/redux/api/endpoints/locations.api";
import type { Room } from "@/redux/api/endpoints/rooms.api";
import type { AdditionalTask } from "@/redux/api/endpoints/additionalTasks.api";
import type { Worker } from "@/redux/api/endpoints/workers.api";
import { workerName } from "@/redux/api/endpoints/workers.api";
import {
  planCounts,
  useGetCleaningPlanQuery,
  useGetEligibleWorkersQuery,
  type CleaningPlan,
} from "@/redux/api/endpoints/cleaningPlans.api";

const formatDateTime = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.toLocaleDateString()} · ${parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

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

function PlanBody({ plan, onAssign }: { plan: CleaningPlan; onAssign?: (plan: CleaningPlan) => void }) {
  const client = refDoc<Client>(plan.client);
  const location = refDoc<Location>(plan.location);
  const counts = planCounts(plan);
  const rooms = (plan.rooms ?? []).map((room) => refDoc<Room>(room)).filter(Boolean) as Room[];
  const tasks = (plan.additional_tasks ?? [])
    .map((task) => refDoc<AdditionalTask>(task))
    .filter(Boolean) as AdditionalTask[];
  // No photo count comes back on the plan, so it is summed from what the tasks ask for.
  const photos = tasks.reduce((total, task) => total + (task.photo_requirements?.length ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          icon={<MdOutlineSchedule />}
          value={plan.max_estimated_duration ? `${plan.max_estimated_duration}m` : "—"}
          label="Duration"
        />
        <Tile icon={<MdOutlineMeetingRoom />} value={counts.rooms} label="Rooms" />
        <Tile icon={<MdOutlineAssignment />} value={counts.tasks} label="Tasks" />
        <Tile icon={<MdOutlinePhotoCamera />} value={photos} label="Photos" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel title="Client & location">
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail icon={<MdOutlineBusinessCenter />} label="Client">
                {client ? clientLabel(client) : refId(plan.client)}
              </Detail>
              <Detail icon={<MdOutlinePlace />} label="Location">
                {location?.name || refId(plan.location)}
              </Detail>
              <Detail icon={<MdOutlineSchedule />} label="Starts">
                {formatDateTime(plan.date_time)}
              </Detail>
              <Detail icon={<MdOutlineSchedule />} label="Ends">
                {formatDate(plan.end_date)}
              </Detail>
            </div>

            {(plan.description || plan.note) && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Description</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {plan.description || plan.note}
                </p>
              </div>
            )}
          </Panel>

          <Panel title={`Rooms (${rooms.length || counts.rooms})`}>
            {rooms.length === 0 ? (
              <p className="text-xs text-slate-400">No rooms on this plan.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <li key={room._id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-base text-slate-400 ring-1 ring-slate-200/70">
                      <MdOutlineMeetingRoom />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{room.name}</p>
                      <p className="truncate text-xs text-slate-400">{room.room_type}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Additional tasks (${tasks.length || counts.tasks})`}>
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400">No additional tasks yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {tasks.map((task) => (
                  <li key={task._id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{task.name}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          task.is_completed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {task.is_completed ? "Done" : "Pending"}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      {formatDate(task.date_time) && <span>{formatDate(task.date_time)}</span>}
                      {typeof task.duration_minutes === "number" && <span>{task.duration_minutes} min</span>}
                      {task.is_photo_required && (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <MdOutlinePhotoCamera className="text-xs" />
                          {task.photo_requirements?.length
                            ? `${task.photo_requirements.length} photos`
                            : "Photo required"}
                        </span>
                      )}
                      {task.is_approved === false && <span className="text-amber-600">Awaiting approval</span>}
                    </div>

                    {task.photo_requirements?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {task.photo_requirements.map((photo, index) => (
                          <span
                            key={`${photo.title}-${index}`}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                          >
                            {photo.title}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel
          title={`Assigned workers (${counts.workers})`}
          action={
            onAssign && (
              <button
                type="button"
                onClick={() => onAssign(plan)}
                className="cursor-pointer text-[11px] font-semibold text-primary hover:underline"
              >
                Edit
              </button>
            )
          }
        >
          {(plan.assigned_workers ?? []).length === 0 ? (
            <p className="text-xs text-slate-400">Nobody assigned yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {(plan.assigned_workers ?? []).map((assignment, index) => {
                const worker = refDoc<Worker>(assignment.worker);
                const name = worker ? workerName(worker) : refId(assignment.worker);
                return (
                  <li key={`${refId(assignment.worker)}-${index}`} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
                      {initials(name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{name}</p>
                      <p className="truncate text-xs text-slate-400">{assignment.role || "Worker"}</p>
                    </div>
                    {assignment.assigned_with_conflict && (
                      <span
                        title="This worker is already booked at that time"
                        className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"
                      >
                        Conflict
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

export function PlanDetailModal({
  planId,
  onClose,
  onEdit,
  onDelete,
  onAssign,
}: {
  planId: string;
  onClose: () => void;
  onEdit?: (plan: CleaningPlan) => void;
  onDelete?: (plan: CleaningPlan) => void;
  onAssign?: (plan: CleaningPlan) => void;
}) {
  const { data: plan, isLoading, error } = useGetCleaningPlanQuery(planId);
  const active = plan?.is_active ?? plan?.status === "active";

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cleaning plan"
        className="flex max-h-[88vh] w-full max-w-4xl flex-col rounded-xl bg-slate-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg text-slate-400 ring-1 ring-slate-200/70">
              <MdOutlineAssignment />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-semibold text-slate-900">
                  {plan?.title ?? "Cleaning plan"}
                </h2>
                {plan && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {active ? "Active" : "Inactive"}
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {formatDateTime(plan?.date_time)}
                {plan?.end_date ? ` → ${formatDate(plan.end_date)}` : ""}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {plan && onAssign && (
              <Button size="sm" onClick={() => onAssign(plan)}>
                <MdOutlineGroupAdd className="text-sm" /> Assign workers
              </Button>
            )}
            {plan && onEdit && (
              <Button variant="secondary" size="sm" onClick={() => onEdit(plan)}>
                <MdModeEditOutline className="text-sm" /> Edit
              </Button>
            )}
            {plan && onDelete && (
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

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
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
          ) : plan ? (
            <PlanBody plan={plan} onAssign={onAssign} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

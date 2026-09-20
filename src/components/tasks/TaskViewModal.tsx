"use client";

import React, { useEffect } from "react";
import { MdOutlineClose, MdChecklist, MdSchedule, MdPhotoCamera } from "react-icons/md";
import type { Task, WeekDay } from "@/redux/api/endpoints/tasks.api";
import { useModalJump } from "@/hooks/useModalJump";

const DAY_LABELS: Record<WeekDay, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

const capitalise = (value: string) => value[0].toUpperCase() + value.slice(1);

function scheduleLabel(task: Task): string {
  const frequency = capitalise(task.frequency_type);
  if (task.frequency_type === "daily") return "Every day";
  if (task.frequency_type === "weekly" && task.days_of_week?.length) {
    return `${frequency} · ${task.days_of_week.map((day) => DAY_LABELS[day]).join(", ")}`;
  }
  if (task.frequency_type === "monthly" && task.days_of_month?.length) {
    return `${frequency} · ${[...task.days_of_month].sort((a, b) => a - b).join(", ")}`;
  }
  return frequency;
}

function scheduleDates(task: Task): string[] {
  if (task.frequency_type === "weekly") {
    return (task.days_of_week ?? []).map((day) => DAY_LABELS[day]);
  }
  if (task.frequency_type === "monthly") {
    return [...(task.days_of_month ?? [])].sort((a, b) => a - b).map(String);
  }
  return [];
}

export function TaskViewModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const { triggerJump, jumpClassName } = useModalJump();

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  return (
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
        aria-label={`View task: ${task.name}`}
        className={`flex max-h-[90vh] w-full max-w-[520px] flex-col rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${jumpClassName}`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">Task details</h2>
            <p className="mt-0.5 truncate text-xs text-slate-400">{task.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:text-slate-600"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-2xl text-emerald-600"
            >
              <MdChecklist />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-bold text-slate-900">{task.name}</h3>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-500">
                <MdSchedule className="mt-0.5 shrink-0 text-slate-400" />
                <span>{scheduleLabel(task)}</span>
              </p>
            </div>
          </div>

          {scheduleDates(task).length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {task.frequency_type === "weekly" ? "Days" : "Dates"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {scheduleDates(task).map((value) => (
                  <span
                    key={value}
                    className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Duration</p>
              <p className="mt-1 font-medium text-slate-900">
                {typeof task.duration_minutes === "number" ? `${task.duration_minutes} min` : "Not specified"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</p>
              <p className="mt-1">
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                    task.is_active
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-slate-100 text-slate-500 ring-slate-200"
                  }`}
                >
                  {task.is_active ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <MdPhotoCamera className="text-slate-400" /> Photo requirements
              </p>
            </div>
            <div className="p-4">
              {task.is_photo_required && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-xs font-semibold text-slate-600">Daily random photo count</span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-900 ring-1 ring-slate-200">
                    {task.required_photo_count ?? "—"}
                    {task.photo_requirements?.length
                      ? ` of ${task.photo_requirements.length}`
                      : ""}
                  </span>
                </div>
              )}
              {!task.is_photo_required ? (
                <p className="text-sm text-slate-500">No photos required for this task.</p>
              ) : task.photo_requirements?.length ? (
                <ul className="space-y-3">
                  {task.photo_requirements.map((req, i) => (
                    <li key={i} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                      {req.reference_image_url ? (
                        <a
                          href={req.reference_image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white"
                          title="Open example image"
                        >
                          <img
                            src={req.reference_image_url}
                            alt={`Example for ${req.title}`}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-slate-900/65 py-0.5 text-center text-[8px] font-semibold uppercase tracking-wide text-white">
                            Example
                          </span>
                        </a>
                      ) : (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      )}
                      <span className="min-w-0">
                        <b className="block text-sm font-semibold text-slate-800">{req.title}</b>
                        {req.description ? (
                          <span className="mt-1 block text-xs leading-5 text-slate-500">{req.description}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Photo required, but no specific names given.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

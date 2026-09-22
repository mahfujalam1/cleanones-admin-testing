"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdOutlineClose,
  MdMailOutline,
  MdPhone,
  MdEventAvailable,
  MdBadge,
  MdArrowForward,
} from "react-icons/md";
import { TbSparkles, TbChecklist, TbCamera } from "react-icons/tb";
import type { ExtraServiceModalProps } from "./types";
import { useModalJump } from "@/hooks/useModalJump";
import { toPlanDetails, type SingleCleaningPlan } from "@/services/actions/cleaningPlans";
import { type ExtraServiceTaskDetail } from "@/services/actions/extraServices";
import { statusColor } from "./ExtraServiceCard";
import {
  additionalTaskStatus,
  useGetAdditionalTaskQuery,
  type AdditionalTask,
} from "@/redux/api/endpoints/additionalTasks.api";
import { clientLabel } from "@/redux/api/endpoints/clients.api";
import { refDoc, refId, refLabel } from "@/redux/api/types";
import { ExtraServicePlanSection } from "./ExtraServicePlanSection";
import { ExtraServiceActionFooter } from "./ExtraServiceActionFooter";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

function getClientInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null;

function additionalTaskToDetail(task: AdditionalTask): ExtraServiceTaskDetail {
  return {
    id: task._id,
    name: task.name,
    description: task.description ?? null,
    duration_minutes: task.duration_minutes ?? null,
    is_photo_req: task.is_photo_required,
    photo: (task.photo_requirements ?? []).map((photo) => ({
      name: photo.title,
      description: photo.description,
    })),
    total_photos_required: task.photo_requirements?.length,
    is_completed: task.is_completed,
    fixed_date: task.date_time ? task.date_time.slice(0, 10) : null,
  };
}

export function ExtraServiceModal({ request, onClose, onDone, onError }: ExtraServiceModalProps) {
  const t = getDashboardTranslation(getLocale(usePathname()));
  const listedTask = request.rawAdditionalTask;
  const taskId = listedTask?._id || request.taskId || request.id;
  const { data: fetchedTask, isFetching: loadingTask } = useGetAdditionalTaskQuery(taskId, {
    skip: !taskId,
  });
  const taskRecord = fetchedTask ?? listedTask;
  const taskPlan = refDoc(taskRecord?.cleaning_plan_id);
  const plan = taskPlan ? toPlanDetails(taskPlan as unknown as SingleCleaningPlan) : null;
  const nestedClient = taskPlan ? refDoc(taskPlan.client) : null;
  const nestedLocation = taskPlan ? refDoc(taskPlan.location) : null;
  const planId = refId(taskRecord?.cleaning_plan_id) || request.planId || "";

  const clientDisplayName =
    (nestedClient ? clientLabel(nestedClient) : "") ||
    request.client_name ||
    request.rawExtraService?.client_name ||
    request.rawExtraService?.client?.name ||
    "Client";

  const companyName = nestedClient?.company_name || plan?.company_name || "";
  const clientEmail = nestedClient?.email || "";
  const clientPhone = nestedClient?.phone || "";
  const licenceExpiry = formatDate(nestedClient?.licence_expiration_date);
  const clientInitials = getClientInitials(clientDisplayName);

  const rawTasks: ExtraServiceTaskDetail[] = taskRecord
    ? [additionalTaskToDetail(taskRecord)]
    : request.rawPendingTask
      ? [request.rawPendingTask as unknown as ExtraServiceTaskDetail]
      : request.rawExtraService?.tasks?.length
        ? request.rawExtraService.tasks
        : [{ id: request.id, name: request.title, description: request.description }];

  const displayTitle = taskRecord?.name || request.title;
  const displayStatus = taskRecord ? additionalTaskStatus(taskRecord) : request.status;
  const displayDescription = taskRecord?.description || request.description;
  const planDisplayName = plan?.title || refLabel(taskRecord?.cleaning_plan_id) || "";
  const locationDisplayName =
    nestedLocation?.name ||
    (taskPlan ? refLabel(taskPlan.location) : undefined) ||
    request.location_name ||
    "—";
  const roomDisplayName = request.room_name || "";
  const { triggerJump, jumpClassName } = useModalJump();

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerJump();
        }
      }}
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex h-[92vh] max-h-[92vh] min-h-0 w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 ${jumpClassName}`}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <TbSparkles className="text-xl" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{displayTitle}</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColor[displayStatus.toLowerCase()] ?? "bg-slate-50 text-slate-600"
                    }`}
                >
                  {displayStatus.replaceAll("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.extraServices.requestId}: <span className="font-mono text-slate-600">{request.id}</span>
                {planDisplayName && (
                  <span className="ml-2">
                    · {t.plans.title}: <span className="font-semibold text-slate-600">{planDisplayName}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 space-y-4 text-xs text-slate-700 transition-opacity ${loadingTask ? "opacity-60" : "opacity-100"
            }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <TbSparkles className="text-sky-600 text-base" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Request Details
                  </h4>
                </div>
                <div className="mt-2.5">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.extraServices.description}</h5>
                  <p className="text-xs text-slate-800 leading-relaxed mt-1 font-medium whitespace-pre-line">
                    {displayDescription || t.extraServices.noRequests}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                {locationDisplayName && locationDisplayName !== "—" && (
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    {t.extraServices.location}{roomDisplayName ? ` / ${t.extraServices.room}` : ""}
                  </span>
                  <span className="font-medium text-slate-800">
                    {locationDisplayName}
                    {roomDisplayName ? ` · ${roomDisplayName}` : ""}
                  </span>
                </div>
                )}
                {(taskRecord?.date_time || request.preferred_date) && (
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">{t.extraServices.preferredDate}</span>
                  <span className="font-medium text-slate-800">
                    {(taskRecord?.date_time ? taskRecord.date_time.slice(0, 10) : "") ||
                      request.preferred_date}
                  </span>
                </div>
                )}
                {taskRecord?.duration_minutes ? (
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">{t.common.duration}</span>
                  <span className="font-medium text-slate-800">
                    {`${taskRecord.duration_minutes}m`}
                  </span>
                </div>
                ) : null}
                {request.priority && (
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Priority</span>
                  <span className="font-medium capitalize text-slate-800">
                    {request.priority}
                  </span>
                </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <MdBadge className="text-sky-600 text-base" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Client Information
                    </h4>
                  </div>
                  {nestedClient && (
                    <Link
                      href={`/clients`}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
                    >
                      Directory <MdArrowForward className="text-xs" />
                    </Link>
                  )}
                </div>

                <div className="flex items-start gap-3 mt-3">
                  <span
                    aria-hidden
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sm font-bold tracking-wide text-sky-600"
                  >
                    {clientInitials}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-bold leading-tight text-slate-900">
                      {clientDisplayName}
                    </h3>
                    {companyName && companyName !== clientDisplayName && (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500 font-medium">
                        <MdBadge className="shrink-0 text-sm text-slate-400" />
                        {companyName}
                      </p>
                    )}
                  </div>
                </div>

                <dl className="mt-3.5 space-y-2 text-xs text-slate-500">
                  {clientEmail && (
                  <div className="flex items-center gap-2">
                    <MdMailOutline className="shrink-0 text-sm text-slate-400" />
                    <dd className="truncate font-medium text-slate-700">{clientEmail}</dd>
                  </div>
                  )}
                  {clientPhone && (
                  <div className="flex items-center gap-2">
                    <MdPhone className="shrink-0 text-sm text-slate-400" />
                    <dd className="truncate font-medium text-slate-700">{clientPhone}</dd>
                  </div>
                  )}
                  {licenceExpiry && (
                    <div className="flex items-center gap-2">
                      <MdEventAvailable className="shrink-0 text-sm text-slate-400" />
                      <dd className="truncate font-medium text-slate-700">Licence expires {licenceExpiry}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {nestedClient?._id && (
                <div className="mt-3.5 flex items-center justify-end border-t border-slate-100 pt-2.5">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: #{nestedClient._id.slice(-6)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <TbChecklist className="text-sky-600 text-base" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {t.common.tasks} ({rawTasks.length})
              </h4>
            </div>
            <div className="space-y-2.5">
              {rawTasks.map((task, idx) => (
                <div key={task.id || idx} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">{task.name}</span>
                    <div className="flex items-center gap-2">
                      {task.fixed_date && <span className="text-[11px] text-slate-500 font-medium">📅 {task.fixed_date}</span>}
                      {task.duration_minutes && <span className="text-[11px] text-slate-500 font-medium">⏱️ {task.duration_minutes}m</span>}
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-600 leading-relaxed bg-white rounded border border-slate-100 p-2">
                      {task.description}
                    </p>
                  )}

                  {task.is_photo_req && task.photo && task.photo.length > 0 && (
                    <div className="pt-1 space-y-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <TbCamera /> {t.common.photos}:
                      </span>
                      <div className="space-y-1">
                        {task.photo.map((p, pIdx) => (
                          <div key={p.id || pIdx} className="rounded border border-sky-100 bg-sky-50/70 px-2.5 py-1.5">
                            <p className="text-[11px] font-semibold text-sky-800">{p.name}</p>
                            {p.description && (
                              <p className="text-[10px] text-slate-500 mt-0.5">{p.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <ExtraServicePlanSection plan={plan} loading={loadingTask && !plan} planId={planId} />
        </div>

        <ExtraServiceActionFooter
          request={{
            ...request,
            planId,
            status: displayStatus,
            rawAdditionalTask: taskRecord,
            taskIds: taskRecord
              ? [taskRecord._id]
              : (Array.from(
                  new Set([
                    ...(request.taskId ? [request.taskId] : []),
                    ...rawTasks.map((item) => item.id).filter(Boolean),
                    ...(plan?.pending_additional_tasks || []).map((pt) => pt.id).filter(Boolean),
                  ])
                ) as string[]),
          }}
          onDone={onDone}
          onError={onError}
        />
      </div>
    </div>
  );
}

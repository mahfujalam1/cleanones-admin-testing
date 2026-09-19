"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import { getCleaningPlan, type PlanDetails } from "@/services/actions/cleaningPlans";
import { type ExtraServiceRequest, type ExtraServiceTaskDetail } from "@/services/actions/extraServices";
import { statusColor } from "./ExtraServiceCard";
import {
  additionalTaskStatus,
  useGetAdditionalTaskQuery,
  type AdditionalTask,
} from "@/redux/api/endpoints/additionalTasks.api";
import {
  useGetClientsQuery,
  CLIENT_LOOKUP_ARGS,
  clientLabel,
  type Client,
} from "@/redux/api/endpoints/clients.api";
import { useLazyGetCleaningPlanListQuery } from "@/redux/api/endpoints/cleaningPlans.api";
import { ExtraServicePlanSection } from "./ExtraServicePlanSection";
import { ExtraServiceActionFooter } from "./ExtraServiceActionFooter";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

const TONES = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Inactive: "bg-slate-100 text-slate-600 ring-slate-200",
} as const;

function getClientInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null;

/** `/additional-task` names its fields differently from the extra-service task shape. */
function additionalTaskToDetail(task: AdditionalTask): ExtraServiceTaskDetail {
  return {
    id: task._id,
    name: task.name,
    description: task.description ?? null,
    duration_minutes: task.duration_minutes ?? null,
    is_photo_req: task.is_photo_required,
    photo: (task.photo_requirements ?? []).map((photo) => ({ name: photo.title })),
    total_photos_required: task.photo_requirements?.length,
    is_completed: task.is_completed,
    fixed_date: task.date_time ? task.date_time.slice(0, 10) : null,
  };
}

export function ExtraServiceModal({ request, onClose, onDone, onError }: ExtraServiceModalProps) {
  const t = getDashboardTranslation(getLocale(usePathname()));
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [extraDetails, setExtraDetails] = useState<ExtraServiceRequest | null>(null);

  // The row from the list route is only a summary. Re-read the task on its own endpoint so the
  // modal shows the authoritative record — including an approval someone else just made.
  const listedTask = request.rawAdditionalTask;
  const { data: fetchedTask, isFetching: loadingTask } = useGetAdditionalTaskQuery(listedTask?._id ?? "", {
    skip: !listedTask,
  });
  const taskRecord = fetchedTask ?? listedTask;
  const task = taskRecord;

  const getPlanId = (p: any): string => {
    if (!p) return "";
    if (typeof p === "string") return p;
    if (typeof p === "object") return p._id || p.id || "";
    return String(p);
  };

  const getPlanTitle = (p: any): string => {
    if (!p) return "";
    if (typeof p === "string") return p;
    if (typeof p === "object") return p.title || p.name || p._id || "";
    return String(p);
  };

  const taskPlanObj = typeof taskRecord?.cleaning_plan_id === "object" ? (taskRecord.cleaning_plan_id as any) : null;
  const initialPlanId = getPlanId(request.planId) || getPlanId(taskPlanObj?._id);
  const [resolvedPlanId, setResolvedPlanId] = useState<string>(initialPlanId);

  // Read all clients for full account card information
  const { data: clientsData } = useGetClientsQuery(CLIENT_LOOKUP_ARGS);
  const [fetchCleaningPlans] = useLazyGetCleaningPlanListQuery();

  useEffect(() => {
    let active = true;

    async function loadData() {
      let currentPlanId = getPlanId(request.planId) || getPlanId(taskPlanObj?._id);
      const locationId = typeof request.location_id === "string" ? request.location_id : (request.location_id as any)?._id;

      if (!currentPlanId && locationId) {
        try {
          const page = await fetchCleaningPlans({ location: locationId, limit: 1 }, true).unwrap();
          if (active) currentPlanId = page.result[0]?._id ?? "";
        } catch {
          // No plan for this location; the section below renders its empty state.
        }
      }

      if (active) setResolvedPlanId(currentPlanId);

      if (currentPlanId) {
        setLoadingPlan(true);
        const planRes = await getCleaningPlan(currentPlanId);
        if (active) {
          setLoadingPlan(false);
          if (planRes.success) setPlan(planRes.data);
        }
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [fetchCleaningPlans, request.id, request.planId, request.location_id, request.isCleaningPlanTask, taskPlanObj?._id]);

  // Resolve matching client for the Client Card display
  const targetClientId =
    (typeof request.client_id === "string" ? request.client_id : (request.client_id as any)?._id) ||
    extraDetails?.client_id ||
    extraDetails?.client?.id ||
    request.rawExtraService?.client_id ||
    request.rawExtraService?.client?.id ||
    plan?.client_id ||
    plan?.clients?.[0]?.client_id ||
    (typeof taskPlanObj?.client === "object" ? taskPlanObj.client?._id || taskPlanObj.client?.id : taskPlanObj?.client);

  const targetClientName =
    (typeof request.client_name === "string" ? request.client_name : (request.client_name as any)?.name) ||
    extraDetails?.client_name ||
    extraDetails?.client?.name ||
    request.rawExtraService?.client_name ||
    request.rawExtraService?.client?.name ||
    plan?.clients?.[0]?.company_name ||
    plan?.client_names?.[0] ||
    (typeof taskPlanObj?.client === "object" ? taskPlanObj.client?.name || taskPlanObj.client?.company_name : undefined) ||
    "";

  const clientList = clientsData?.result;
  const matchedClient: Client | undefined = useMemo(() => {
    if (!clientList) return undefined;
    if (targetClientId) {
      const found = clientList.find((c) => c._id === targetClientId);
      if (found) return found;
    }
    if (targetClientName) {
      const norm = targetClientName.trim().toLowerCase();
      const found = clientList.find((c) =>
        (c.name && c.name.trim().toLowerCase() === norm) ||
        (c.company_name && c.company_name.trim().toLowerCase() === norm) ||
        (c.email && c.email.trim().toLowerCase() === norm)
      );
      if (found) return found;
    }
    return undefined;
  }, [clientList, targetClientId, targetClientName]);

  const clientDisplayName =
    (matchedClient && clientLabel(matchedClient)) ||
    targetClientName ||
    "Client";

  const companyName =
    matchedClient?.company_name ||
    plan?.company_name ||
    plan?.clients?.[0]?.company_name ||
    (typeof taskPlanObj?.client === "object" ? taskPlanObj.client?.company_name : "") ||
    "";

  const clientEmail =
    matchedClient?.email ||
    plan?.clients?.[0]?.email ||
    (typeof taskPlanObj?.client === "object" ? taskPlanObj.client?.email : "") ||
    "";

  const clientPhone =
    matchedClient?.phone ||
    plan?.clients?.[0]?.phone ||
    (typeof taskPlanObj?.client === "object" ? taskPlanObj.client?.phone : "") ||
    "";

  const licenceExpiry =
    formatDate(matchedClient?.licence_expiration_date) ||
    (plan?.repeat_until ? formatDate(plan.repeat_until) : null);

  const contractStatus =
    matchedClient?.contract_status ||
    "Active";

  const clientInitials = getClientInitials(clientDisplayName);

  const rawTasks: ExtraServiceTaskDetail[] = (
    taskRecord
      ? [additionalTaskToDetail(taskRecord)]
      : extraDetails?.tasks?.length
        ? extraDetails.tasks
        : request.rawPendingTask
        ? [request.rawPendingTask as any]
        : request.rawExtraService?.tasks?.length
          ? request.rawExtraService.tasks
          : [{ name: request.title, description: request.description }]
  ) as ExtraServiceTaskDetail[];

  const displayTitle = taskRecord?.name || extraDetails?.title || request.title;
  const displayStatus = taskRecord ? additionalTaskStatus(taskRecord) : extraDetails?.status || request.status;
  const displayDescription = taskRecord?.description || extraDetails?.description || request.description;

  const planDisplayName: string =
    extraDetails?.plan_name ||
    plan?.title ||
    getPlanTitle(taskRecord?.cleaning_plan_id) ||
    getPlanTitle(resolvedPlanId) ||
    "";

  const locationDisplayName: string =
    extraDetails?.location_name ||
    (typeof request.location_name === "string" ? request.location_name : (request.location_name as any)?.name) ||
    (typeof taskPlanObj?.location === "object" ? taskPlanObj.location?.name : undefined) ||
    "—";

  const roomDisplayName: string =
    extraDetails?.room_name ||
    (typeof request.room_name === "string" ? request.room_name : (request.room_name as any)?.name) ||
    "";
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
        className={`flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 ${jumpClassName}`}
      >
        {/* Header */}
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

        {/* Content */}
        <div
          className={`flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700 transition-opacity ${loadingTask ? "opacity-60" : "opacity-100"
            }`}
        >
          {/* Top Section: 2-Column Grid (Request Details & Client Information Card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Request Overview Card */}
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
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">{t.extraServices.location} / {t.extraServices.room}</span>
                  <span className="font-medium text-slate-800">
                    {locationDisplayName}
                    {roomDisplayName ? ` · ${roomDisplayName}` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">{t.extraServices.preferredDate}</span>
                  <span className="font-medium text-slate-800">
                    {(taskRecord?.date_time ? taskRecord.date_time.slice(0, 10) : "") ||
                      extraDetails?.preferred_date ||
                      request.preferred_date ||
                      extraDetails?.date_submitted ||
                      "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">{t.common.duration}</span>
                  <span className="font-medium text-slate-800">
                    {taskRecord?.duration_minutes
                      ? `${taskRecord.duration_minutes}m`
                      : extraDetails?.duration || (extraDetails?.duration_minutes ? `${extraDetails.duration_minutes}m` : "—")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Priority</span>
                  <span className="font-medium capitalize text-slate-800">
                    {extraDetails?.priority || request.priority || "Normal"}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Information Card (Matching the Client Card design in screenshot) */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <MdBadge className="text-sky-600 text-base" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Client Information
                    </h4>
                  </div>
                  {matchedClient && (
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
                    {companyName && (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500 font-medium">
                        <MdBadge className="shrink-0 text-sm text-slate-400" />
                        {companyName}
                      </p>
                    )}
                  </div>
                </div>

                <dl className="mt-3.5 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MdMailOutline className="shrink-0 text-sm text-slate-400" />
                    <dd className="truncate font-medium text-slate-700">{clientEmail || "—"}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdPhone className="shrink-0 text-sm text-slate-400" />
                    <dd className="truncate font-medium text-slate-700">{clientPhone || "—"}</dd>
                  </div>
                  {licenceExpiry && (
                    <div className="flex items-center gap-2">
                      <MdEventAvailable className="shrink-0 text-sm text-slate-400" />
                      <dd className="truncate font-medium text-slate-700">Licence expires {licenceExpiry}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                    TONES[contractStatus as keyof typeof TONES] ?? TONES.Active
                  }`}
                >
                  {contractStatus}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {matchedClient?._id ? `ID: #${matchedClient._id.slice(-6)}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Requested Tasks Array */}
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
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <TbCamera /> {t.common.photos}:
                      </span>
                      {task.photo.map((p, pIdx) => (
                        <span key={p.id || pIdx} className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-100">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Associated Cleaning Plan Section */}
          <ExtraServicePlanSection plan={plan} loading={loadingPlan} planId={resolvedPlanId} />
        </div>

        {/* Action Footer */}
        <ExtraServiceActionFooter
          request={{
            ...request,
            planId: getPlanId(taskRecord?.cleaning_plan_id) || resolvedPlanId,
            status: displayStatus,
            rawAdditionalTask: taskRecord,
            // An /additional-task row stands alone: widening this to the plan's other pending
            // tasks would approve every sibling along with the one on screen.
            taskIds: taskRecord
              ? [taskRecord._id]
              : (Array.from(
                  new Set([
                    ...(request.taskId ? [request.taskId] : []),
                    ...rawTasks.map((t) => t.id).filter(Boolean),
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

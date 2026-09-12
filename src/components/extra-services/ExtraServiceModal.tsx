"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MdOutlineClose } from "react-icons/md";
import { TbSparkles, TbChecklist, TbCamera } from "react-icons/tb";
import type { ExtraServiceModalProps } from "./types";
import { getCleaningPlan, type PlanDetails } from "@/services/actions/cleaningPlans";
import { getExtraService, type ExtraServiceRequest, type ExtraServiceTaskDetail } from "@/services/actions/extraServices";
import { getLocationCleaningPlans } from "@/services/actions/locations";
import { statusColor } from "./ExtraServiceCard";
import { ExtraServicePlanSection } from "./ExtraServicePlanSection";
import { ExtraServiceActionFooter } from "./ExtraServiceActionFooter";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

export function ExtraServiceModal({ request, onClose, onDone, onError }: ExtraServiceModalProps) {
  const t = getDashboardTranslation(getLocale(usePathname()));
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [extraDetails, setExtraDetails] = useState<ExtraServiceRequest | null>(null);
  const [resolvedPlanId, setResolvedPlanId] = useState<string | undefined>(request.planId);

  useEffect(() => {
    let active = true;

    async function loadData() {
      let currentPlanId = request.planId;
      let locationId = request.location_id;

      if (!request.isCleaningPlanTask) {
        const res = await getExtraService(request.id);
        if (active && res.success) {
          setExtraDetails(res.data);
          locationId = locationId || res.data.location_id || res.data.location?.id;
          currentPlanId = currentPlanId || res.data.plan_id;
        }
      }

      if (!currentPlanId && locationId) {
        const locPlansRes = await getLocationCleaningPlans(locationId);
        if (active && locPlansRes.success && locPlansRes.data.plans?.length) {
          currentPlanId = locPlansRes.data.plans[0].plan_id;
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
  }, [request.id, request.planId, request.location_id, request.isCleaningPlanTask]);

  const rawTasks: ExtraServiceTaskDetail[] = (
    extraDetails?.tasks?.length
      ? extraDetails.tasks
      : request.rawPendingTask
        ? [request.rawPendingTask as any]
        : request.rawExtraService?.tasks?.length
          ? request.rawExtraService.tasks
          : [{ name: request.title, description: request.description }]
  ) as ExtraServiceTaskDetail[];

  const planDisplayName = extraDetails?.plan_name || plan?.title || resolvedPlanId;

  return (
    <div
      onClick={onClose}
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <TbSparkles className="text-xl" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{extraDetails?.title || request.title}</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColor[(extraDetails?.status || request.status).toLowerCase()] ?? "bg-slate-50 text-slate-600"
                    }`}
                >
                  {(extraDetails?.status || request.status).replaceAll("_", " ")}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700">
          {/* Overview Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.extraServices.description}</h4>
              <p className="text-sm text-slate-800 leading-relaxed mt-0.5 font-medium whitespace-pre-line">
                {extraDetails?.description || request.description || t.extraServices.noRequests}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">{t.extraServices.client}</span>
                <span className="font-medium text-slate-800">{extraDetails?.client_name || request.client_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">{t.extraServices.location} / {t.extraServices.room}</span>
                <span className="font-medium text-slate-800">
                  {extraDetails?.location_name || request.location_name || "—"}
                  {(extraDetails?.room_name || request.room_name) ? ` · ${extraDetails?.room_name || request.room_name}` : ""}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">{t.extraServices.preferredDate}</span>
                <span className="font-medium text-slate-800">
                  {extraDetails?.preferred_date || request.preferred_date || extraDetails?.date_submitted || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">{t.common.duration}</span>
                <span className="font-medium text-slate-800">
                  {extraDetails?.duration || (extraDetails?.duration_minutes ? `${extraDetails.duration_minutes}m` : "—")}
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
            planId: resolvedPlanId,
            status: extraDetails?.status || request.status,
            taskIds: Array.from(
              new Set([
                ...(request.taskId ? [request.taskId] : []),
                ...rawTasks.map((t) => t.id).filter(Boolean),
                ...(plan?.pending_additional_tasks || []).map((pt) => pt.id).filter(Boolean),
              ])
            ) as string[],
          }}
          onDone={onDone}
          onError={onError}
        />
      </div>
    </div>
  );
}

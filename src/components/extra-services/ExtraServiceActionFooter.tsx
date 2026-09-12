"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MdCheck, MdClose } from "react-icons/md";
import type { UnifiedServiceRequest } from "./types";
import { approveAdditionalTask, rejectAdditionalTask } from "@/services/actions/cleaningPlans";
import { rejectExtraService, completeApproveExtraService, approveExtraService } from "@/services/actions/extraServices";
import { getLocale } from "@/lib/locale";

const footerTranslations: Record<
  string,
  {
    close: string;
    specifyReason: string;
    reasonPlaceholder: string;
    cancel: string;
    rejecting: string;
    confirmReject: string;
    rejectRequest: string;
    processing: string;
    acceptAndApprove: string;
    failedApprove: string;
    failedReject: string;
  }
> = {
  en: {
    close: "Close",
    specifyReason: "Specify reason for rejection:",
    reasonPlaceholder: "e.g. Schedule conflicts or outside contractual scope...",
    cancel: "Cancel",
    rejecting: "Rejecting...",
    confirmReject: "Confirm Reject",
    rejectRequest: "Reject Request",
    processing: "Processing...",
    acceptAndApprove: "Accept & Approve",
    failedApprove: "Failed to approve request.",
    failedReject: "Failed to reject request.",
  },
  nl: {
    close: "Sluiten",
    specifyReason: "Geef reden voor afwijzing op:",
    reasonPlaceholder: "bijv. planningsconflict of buiten overeenkomst...",
    cancel: "Annuleren",
    rejecting: "Afwijzen...",
    confirmReject: "Afwijzing bevestigen",
    rejectRequest: "Verzoek afwijzen",
    processing: "Verwerken...",
    acceptAndApprove: "Accepteren & Goedkeuren",
    failedApprove: "Goedkeuren van verzoek mislukt.",
    failedReject: "Afwijzen van verzoek mislukt.",
  },
  pl: {
    close: "Zamknij",
    specifyReason: "Określ powód odrzucenia:",
    reasonPlaceholder: "np. konflikt harmonogramu lub poza zakresem umowy...",
    cancel: "Anuluj",
    rejecting: "Odrzucanie...",
    confirmReject: "Potwierdź odrzucenie",
    rejectRequest: "Odrzuć prośbę",
    processing: "Przetwarzanie...",
    acceptAndApprove: "Zaakceptuj i zatwierdź",
    failedApprove: "Nie udało się zatwierdzić wniosku.",
    failedReject: "Nie udało się odrzucić wniosku.",
  },
  uk: {
    close: "Закрити",
    specifyReason: "Вкажіть причину відхилення:",
    reasonPlaceholder: "напр., конфлікт розкладу або поза межами договору...",
    cancel: "Скасувати",
    rejecting: "Відхилення...",
    confirmReject: "Підтвердити відхилення",
    rejectRequest: "Відхилити запит",
    processing: "Обробка...",
    acceptAndApprove: "Прийняти та затвердити",
    failedApprove: "Не вдалося затвердити запит.",
    failedReject: "Не вдалося відхилити запит.",
  },
  pt: {
    close: "Fechar",
    specifyReason: "Especifique o motivo da rejeição:",
    reasonPlaceholder: "ex.: conflitos de horário ou fora do âmbito contratual...",
    cancel: "Cancelar",
    rejecting: "A rejeitar...",
    confirmReject: "Confirmar rejeição",
    rejectRequest: "Rejeitar pedido",
    processing: "A processar...",
    acceptAndApprove: "Aceitar e Aprovar",
    failedApprove: "Falha ao aprovar o pedido.",
    failedReject: "Falha ao rejeitar o pedido.",
  },
  ar: {
    close: "إغلاق",
    specifyReason: "حدد سبب الرفض:",
    reasonPlaceholder: "مثلاً: تعارض في الجدول أو خارج نطاق العقد...",
    cancel: "إلغاء",
    rejecting: "جارٍ الرفض...",
    confirmReject: "تأكيد الرفض",
    rejectRequest: "رفض الطلب",
    processing: "جارٍ المعالجة...",
    acceptAndApprove: "قبول وموافقة",
    failedApprove: "فشل في الموافقة على الطلب.",
    failedReject: "فشل في رفض الطلب.",
  },
  fr: {
    close: "Fermer",
    specifyReason: "Précisez le motif du refus :",
    reasonPlaceholder: "ex. conflit d'horaire ou hors du cadre contractuel...",
    cancel: "Annuler",
    rejecting: "Refus en cours...",
    confirmReject: "Confirmer le refus",
    rejectRequest: "Rejeter la demande",
    processing: "Traitement en cours...",
    acceptAndApprove: "Accepter & Approuver",
    failedApprove: "Échec de l'approbation de la demande.",
    failedReject: "Échec du refus de la demande.",
  },
  es: {
    close: "Cerrar",
    specifyReason: "Especifique el motivo del rechazo:",
    reasonPlaceholder: "ej. conflicto de horarios o fuera del alcance contractual...",
    cancel: "Cancelar",
    rejecting: "Rechazando...",
    confirmReject: "Confirmar rechazo",
    rejectRequest: "Rechazar solicitud",
    processing: "Procesando...",
    acceptAndApprove: "Aceptar y Aprobar",
    failedApprove: "Error al aprobar la solicitud.",
    failedReject: "Error al rechazar la solicitud.",
  },
};

interface ExtraServiceActionFooterProps {
  request: UnifiedServiceRequest;
  onDone: () => void;
  onError: (msg: string) => void;
  onAssignWorkers?: () => void;
}

export function ExtraServiceActionFooter({
  request,
  onDone,
  onError,
  onAssignWorkers,
}: ExtraServiceActionFooterProps) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = footerTranslations[locale] || footerTranslations.en;

  const [saving, setSaving] = useState(false);
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const currentStatus = (request.status || "").toLowerCase();
  const isActionable = ["pending", "under_review", "awaiting_approval"].includes(currentStatus);

  const handleApprove = async () => {
    setSaving(true);
    const planId = request.planId;
    const taskIds = request.taskIds?.length
      ? request.taskIds
      : request.taskId
      ? [request.taskId]
      : [];

    let approveSuccess = false;

    // Hit manager/cleaning-plans/{plan_id}/additional-tasks/{task_id}/approve
    if (planId && taskIds.length > 0) {
      for (const tId of taskIds) {
        const res = await approveAdditionalTask(planId, tId);
        if (res.success) approveSuccess = true;
      }
    }

    // Also approve extra service if it's an extra service request
    if (request.id && !request.isCleaningPlanTask) {
      const res = await completeApproveExtraService(request.id);
      if (res.success) approveSuccess = true;
      else if (!approveSuccess) {
        const fallbackRes = await approveExtraService(request.id, {});
        if (fallbackRes.success) approveSuccess = true;
      }
    }

    setSaving(false);
    if (!approveSuccess && !planId) {
      return onError(t.failedApprove);
    }
    onDone();
  };

  const handleReject = async () => {
    setSaving(true);
    const reason = rejectionReason.trim() || "Service requested is outside operational scope.";
    const planId = request.planId;
    const taskIds = request.taskIds?.length
      ? request.taskIds
      : request.taskId
      ? [request.taskId]
      : [];

    let rejectSuccess = false;

    // Hit manager/cleaning-plans/{plan_id}/additional-tasks/{task_id}/reject
    if (planId && taskIds.length > 0) {
      for (const tId of taskIds) {
        const res = await rejectAdditionalTask(planId, tId, reason);
        if (res.success) rejectSuccess = true;
      }
    }

    if (request.id && !request.isCleaningPlanTask) {
      const res = await rejectExtraService(request.id, reason);
      if (res.success) rejectSuccess = true;
    }

    setSaving(false);
    if (!rejectSuccess && !planId) {
      return onError(t.failedReject);
    }
    onDone();
  };

  if (!isActionable) {
    return (
      <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-3 shrink-0">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {t.close}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 shrink-0">
      {showRejectPrompt ? (
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50/70 p-3.5">
          <label className="block text-xs font-semibold text-red-800">
            {t.specifyReason}
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t.reasonPlaceholder}
            rows={2}
            className="w-full rounded border border-red-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-red-300"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => setShowRejectPrompt(false)}
              className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleReject()}
              className="rounded bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? t.rejecting : t.confirmReject}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => setShowRejectPrompt(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer"
          >
            <MdClose className="text-base" />
            {t.rejectRequest}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => void handleApprove()}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 transition-all disabled:opacity-50 cursor-pointer"
          >
            <MdCheck className="text-base" />
            {saving ? t.processing : t.acceptAndApprove}
          </button>
        </div>
      )}
    </div>
  );
}

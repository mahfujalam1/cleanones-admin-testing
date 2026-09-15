"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MdCheck, MdClose, MdDeleteOutline } from "react-icons/md";
import type { UnifiedServiceRequest } from "./types";
import { approveAdditionalTask, rejectAdditionalTask } from "@/services/actions/cleaningPlans";
import { rejectExtraService, completeApproveExtraService, approveExtraService } from "@/services/actions/extraServices";
import {
  useApproveAdditionalTaskMutation,
  useDeleteAdditionalTaskMutation,
  useUpdateAdditionalTaskMutation,
} from "@/redux/api/endpoints/additionalTasks.api";
import { ApproveDurationModal } from "./ApproveDurationModal";
import { apiError } from "@/redux/api/apiError";
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
    deleteTask: string;
    confirmDelete: string;
    deletePrompt: string;
    deleting: string;
    failedDelete: string;
    durationTitle: string;
    durationHint: string;
    durationLabel: string;
    durationMinutes: string;
    durationConfirm: string;
    durationSaving: string;
    durationInvalid: string;
    failedDuration: string;
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
    deleteTask: "Delete Task",
    confirmDelete: "Confirm Delete",
    deletePrompt: "Permanently delete this task? It is also removed from its cleaning plan.",
    deleting: "Deleting...",
    failedDelete: "Failed to delete task.",
    durationTitle: "Set task duration",
    durationHint: "Confirm how long this task should take before approving the request.",
    durationLabel: "Duration",
    durationMinutes: "min",
    durationConfirm: "Approve",
    durationSaving: "Saving...",
    durationInvalid: "Enter a duration in whole minutes.",
    failedDuration: "Failed to update the task duration.",
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
    deleteTask: "Taak verwijderen",
    confirmDelete: "Verwijderen bevestigen",
    deletePrompt: "Deze taak definitief verwijderen? Ze wordt ook uit het schoonmaakplan gehaald.",
    deleting: "Verwijderen...",
    failedDelete: "Verwijderen van taak mislukt.",
    durationTitle: "Taakduur instellen",
    durationHint: "Bevestig hoelang deze taak duurt voordat je het verzoek goedkeurt.",
    durationLabel: "Duur",
    durationMinutes: "min",
    durationConfirm: "Goedkeuren",
    durationSaving: "Opslaan...",
    durationInvalid: "Voer een duur in hele minuten in.",
    failedDuration: "Bijwerken van de taakduur mislukt.",
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
    deleteTask: "Usuń zadanie",
    confirmDelete: "Potwierdź usunięcie",
    deletePrompt: "Trwale usunąć to zadanie? Zostanie też usunięte z planu sprzątania.",
    deleting: "Usuwanie...",
    failedDelete: "Nie udało się usunąć zadania.",
    durationTitle: "Ustaw czas zadania",
    durationHint: "Potwierdź czas trwania zadania przed zatwierdzeniem wniosku.",
    durationLabel: "Czas trwania",
    durationMinutes: "min",
    durationConfirm: "Zatwierdź",
    durationSaving: "Zapisywanie...",
    durationInvalid: "Podaj czas trwania w pełnych minutach.",
    failedDuration: "Nie udało się zaktualizować czasu zadania.",
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
    deleteTask: "Видалити завдання",
    confirmDelete: "Підтвердити видалення",
    deletePrompt: "Остаточно видалити це завдання? Його також буде вилучено з плану прибирання.",
    deleting: "Видалення...",
    failedDelete: "Не вдалося видалити завдання.",
    durationTitle: "Встановіть тривалість",
    durationHint: "Підтвердьте тривалість завдання перед затвердженням запиту.",
    durationLabel: "Тривалість",
    durationMinutes: "хв",
    durationConfirm: "Затвердити",
    durationSaving: "Збереження...",
    durationInvalid: "Вкажіть тривалість у цілих хвилинах.",
    failedDuration: "Не вдалося оновити тривалість завдання.",
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
    deleteTask: "Eliminar tarefa",
    confirmDelete: "Confirmar eliminação",
    deletePrompt: "Eliminar permanentemente esta tarefa? Também é removida do plano de limpeza.",
    deleting: "A eliminar...",
    failedDelete: "Falha ao eliminar a tarefa.",
    durationTitle: "Definir duração da tarefa",
    durationHint: "Confirme a duração desta tarefa antes de aprovar o pedido.",
    durationLabel: "Duração",
    durationMinutes: "min",
    durationConfirm: "Aprovar",
    durationSaving: "A guardar...",
    durationInvalid: "Indique a duração em minutos inteiros.",
    failedDuration: "Falha ao atualizar a duração da tarefa.",
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
    deleteTask: "حذف المهمة",
    confirmDelete: "تأكيد الحذف",
    deletePrompt: "حذف هذه المهمة نهائيًا؟ ستتم إزالتها أيضًا من خطة التنظيف.",
    deleting: "جارٍ الحذف...",
    failedDelete: "فشل حذف المهمة.",
    durationTitle: "تحديد مدة المهمة",
    durationHint: "أكد مدة هذه المهمة قبل الموافقة على الطلب.",
    durationLabel: "المدة",
    durationMinutes: "دقيقة",
    durationConfirm: "موافقة",
    durationSaving: "جارٍ الحفظ...",
    durationInvalid: "أدخل المدة بالدقائق الكاملة.",
    failedDuration: "فشل تحديث مدة المهمة.",
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
    deleteTask: "Supprimer la tâche",
    confirmDelete: "Confirmer la suppression",
    deletePrompt: "Supprimer définitivement cette tâche ? Elle est aussi retirée du plan de nettoyage.",
    deleting: "Suppression...",
    failedDelete: "Échec de la suppression de la tâche.",
    durationTitle: "Définir la durée de la tâche",
    durationHint: "Confirmez la durée de cette tâche avant d'approuver la demande.",
    durationLabel: "Durée",
    durationMinutes: "min",
    durationConfirm: "Approuver",
    durationSaving: "Enregistrement...",
    durationInvalid: "Saisissez une durée en minutes entières.",
    failedDuration: "Échec de la mise à jour de la durée de la tâche.",
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
    deleteTask: "Eliminar tarea",
    confirmDelete: "Confirmar eliminación",
    deletePrompt: "¿Eliminar permanentemente esta tarea? También se quita del plan de limpieza.",
    deleting: "Eliminando...",
    failedDelete: "Error al eliminar la tarea.",
    durationTitle: "Definir duración de la tarea",
    durationHint: "Confirme cuánto dura esta tarea antes de aprobar la solicitud.",
    durationLabel: "Duración",
    durationMinutes: "min",
    durationConfirm: "Aprobar",
    durationSaving: "Guardando...",
    durationInvalid: "Introduzca una duración en minutos enteros.",
    failedDuration: "Error al actualizar la duración de la tarea.",
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

  const [approveAdditional] = useApproveAdditionalTaskMutation();
  const [deleteAdditional] = useDeleteAdditionalTaskMutation();
  const [updateAdditional] = useUpdateAdditionalTaskMutation();
  const [saving, setSaving] = useState(false);
  const [showDurationPrompt, setShowDurationPrompt] = useState(false);
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const currentStatus = (request.status || "").toLowerCase();
  const isActionable = ["pending", "under_review", "awaiting_approval"].includes(currentStatus);

  /** Task ids this request approves — an /additional-task row stands alone. */
  const approvalTaskIds = request.taskIds?.length
    ? request.taskIds
    : request.taskId
    ? [request.taskId]
    : [];

  /**
   * Approving runs in two steps: the duration entered in the confirmation modal is written
   * back to the additional task first, then the approval itself. A failed duration update
   * aborts before approving, so the manager can correct the value and retry.
   *
   * Returns `null` on success, or the failure message. When the duration modal is driving
   * this, that message is rendered inside it instead of on the request modal behind it.
   */
  const handleApprove = async (durationMinutes?: number) => {
    setSaving(true);
    const planId = request.planId;
    const taskIds = approvalTaskIds;

    if (durationMinutes !== undefined && taskIds.length > 0) {
      try {
        for (const tId of taskIds) {
          await updateAdditional({ id: tId, duration_minutes: durationMinutes }).unwrap();
        }
      } catch (err) {
        setSaving(false);
        return apiError(err, t.failedDuration);
      }
    }

    let approveSuccess = false;

    // Rows sourced from /additional-task use the decision endpoint, which takes the task id
    // alone. The plan-scoped route below still serves rows read off a plan's pending list.
    if (request.rawAdditionalTask && taskIds.length > 0) {
      for (const tId of taskIds) {
        try {
          await approveAdditional({ id: tId, is_approved: true }).unwrap();
          approveSuccess = true;
        } catch {
          // Keep going; a partial success is still reported below.
        }
      }
    } else if (planId && taskIds.length > 0) {
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
    if (!approveSuccess && (request.rawAdditionalTask || !planId)) {
      // Without the duration modal open there is nowhere else to put this.
      if (durationMinutes === undefined) onError(t.failedApprove);
      return t.failedApprove;
    }
    // The duration modal is dismissed first and the request modal behind it a beat later,
    // so the two closings read as a sequence rather than both vanishing at once.
    setShowDurationPrompt(false);
    if (durationMinutes !== undefined) {
      window.setTimeout(onDone, 160);
    } else {
      onDone();
    }
    return null;
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

    // The decision endpoint is a single boolean, so a rejection reason cannot ride along here.
    if (request.rawAdditionalTask && taskIds.length > 0) {
      for (const tId of taskIds) {
        try {
          await approveAdditional({ id: tId, is_approved: false }).unwrap();
          rejectSuccess = true;
        } catch {
          // Keep going; a partial success is still reported below.
        }
      }
    } else if (planId && taskIds.length > 0) {
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
    if (!rejectSuccess && (request.rawAdditionalTask || !planId)) {
      return onError(t.failedReject);
    }
    onDone();
  };

  /**
   * `/additional-task/delete-additional-task` also pulls the id from the parent plan. The route
   * is documented as client-only, so a manager session can legitimately come back 401 — the
   * server's own wording is surfaced rather than a generic failure.
   */
  const handleDelete = async () => {
    const taskId = request.rawAdditionalTask?._id;
    if (!taskId) return;
    setSaving(true);
    try {
      await deleteAdditional(taskId).unwrap();
      setSaving(false);
      onDone();
    } catch (err) {
      setSaving(false);
      setShowDeletePrompt(false);
      onError(apiError(err, t.failedDelete));
    }
  };

  const deleteButton = request.rawAdditionalTask ? (
    <button
      type="button"
      disabled={saving}
      onClick={() => setShowDeletePrompt(true)}
      className="mr-auto flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50 cursor-pointer"
    >
      <MdDeleteOutline className="text-base" />
      {t.deleteTask}
    </button>
  ) : null;

  const deletePrompt = (
    <div className="space-y-3 rounded-lg border border-red-200 bg-red-50/70 p-3.5">
      <p className="text-xs font-semibold text-red-800">{t.deletePrompt}</p>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => setShowDeletePrompt(false)}
          className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {t.cancel}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleDelete()}
          className="rounded bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? t.deleting : t.confirmDelete}
        </button>
      </div>
    </div>
  );

  if (!isActionable) {
    return (
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 shrink-0">
        {showDeletePrompt ? (
          deletePrompt
        ) : (
          <div className="flex items-center justify-end gap-3">
            {deleteButton}
            <button
              type="button"
              onClick={onDone}
              className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 shrink-0">
      {showDeletePrompt ? (
        deletePrompt
      ) : showRejectPrompt ? (
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
          {deleteButton}
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
            onClick={() => {
              // Nothing to re-time when the request carries no additional task, so the
              // duration step is skipped and the approval runs straight away.
              if (approvalTaskIds.length > 0) setShowDurationPrompt(true);
              else void handleApprove();
            }}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 transition-all disabled:opacity-50 cursor-pointer"
          >
            <MdCheck className="text-base" />
            {saving ? t.processing : t.acceptAndApprove}
          </button>
        </div>
      )}

      {showDurationPrompt && (
        <ApproveDurationModal
          initialMinutes={request.rawAdditionalTask?.duration_minutes}
          copy={{
            title: t.durationTitle,
            hint: t.durationHint,
            label: t.durationLabel,
            minutes: t.durationMinutes,
            cancel: t.cancel,
            confirm: t.durationConfirm,
            saving: t.durationSaving,
            invalid: t.durationInvalid,
          }}
          onCancel={() => setShowDurationPrompt(false)}
          onConfirm={(minutes) => handleApprove(minutes)}
        />
      )}
    </div>
  );
}

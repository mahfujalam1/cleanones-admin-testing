"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { MdCheck, MdClose } from "react-icons/md";
import type { UnifiedServiceRequest } from "./types";
import {
  useApproveAdditionalTaskMutation,
  useUpdateAdditionalTaskMutation,
} from "@/redux/api/endpoints/additionalTasks.api";
import { ApproveDurationModal, type ApproveDecision } from "./ApproveDurationModal";
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
    durationRequired: string;
    failedDuration: string;
    photoRequired: string;
    photoName: string;
    addPhoto: string;
    removePhoto: string;
    photoNeeded: string;
    photoUnnamed: string;
    defaultRejectReason: string;
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
    durationRequired: "Duration is required.",
    failedDuration: "Failed to update the task duration.",
    photoRequired: "Photo required",
    photoName: "Required photo name",
    addPhoto: "+ Add photo",
    removePhoto: "Remove",
    photoNeeded: "Add at least one photo, or turn off photo required.",
    photoUnnamed: "Give every required photo a name, or remove the empty ones.",
    defaultRejectReason: "Not within the scope of the current contract.",
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
    durationRequired: "Duur is verplicht.",
    failedDuration: "Bijwerken van de taakduur mislukt.",
    photoRequired: "Foto vereist",
    photoName: "Naam van vereiste foto",
    addPhoto: "+ Foto toevoegen",
    removePhoto: "Verwijderen",
    photoNeeded: "Voeg minstens één foto toe of schakel foto vereist uit.",
    photoUnnamed: "Geef elke vereiste foto een naam of verwijder de lege.",
    defaultRejectReason: "Valt buiten het bereik van het huidige contract.",
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
    durationRequired: "Czas trwania jest wymagany.",
    failedDuration: "Nie udało się zaktualizować czasu zadania.",
    photoRequired: "Wymagane zdjęcie",
    photoName: "Nazwa wymaganego zdjęcia",
    addPhoto: "+ Dodaj zdjęcie",
    removePhoto: "Usuń",
    photoNeeded: "Dodaj co najmniej jedno zdjęcie lub wyłącz wymagane zdjęcie.",
    photoUnnamed: "Nadaj nazwę każdemu wymaganemu zdjęciu lub usuń puste.",
    defaultRejectReason: "Poza zakresem obowiązującej umowy.",
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
    durationRequired: "Тривалість обов'язкова.",
    failedDuration: "Не вдалося оновити тривалість завдання.",
    photoRequired: "Потрібне фото",
    photoName: "Назва потрібного фото",
    addPhoto: "+ Додати фото",
    removePhoto: "Видалити",
    photoNeeded: "Додайте щонайменше одне фото або вимкніть вимогу фото.",
    photoUnnamed: "Дайте назву кожному фото або видаліть порожні.",
    defaultRejectReason: "Не входить до обсягу чинного договору.",
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
    durationRequired: "A duração é obrigatória.",
    failedDuration: "Falha ao atualizar a duração da tarefa.",
    photoRequired: "Foto obrigatória",
    photoName: "Nome da foto obrigatória",
    addPhoto: "+ Adicionar foto",
    removePhoto: "Remover",
    photoNeeded: "Adicione pelo menos uma foto ou desative a foto obrigatória.",
    photoUnnamed: "Dê um nome a cada foto obrigatória ou remova as vazias.",
    defaultRejectReason: "Fora do âmbito do contrato atual.",
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
    durationRequired: "المدة مطلوبة.",
    failedDuration: "فشل تحديث مدة المهمة.",
    photoRequired: "صورة مطلوبة",
    photoName: "اسم الصورة المطلوبة",
    addPhoto: "+ إضافة صورة",
    removePhoto: "إزالة",
    photoNeeded: "أضف صورة واحدة على الأقل أو أوقف طلب الصور.",
    photoUnnamed: "أعطِ كل صورة مطلوبة اسمًا أو احذف الفارغة.",
    defaultRejectReason: "خارج نطاق العقد الحالي.",
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
    durationRequired: "La durée est obligatoire.",
    failedDuration: "Échec de la mise à jour de la durée de la tâche.",
    photoRequired: "Photo requise",
    photoName: "Nom de la photo requise",
    addPhoto: "+ Ajouter une photo",
    removePhoto: "Supprimer",
    photoNeeded: "Ajoutez au moins une photo ou désactivez la photo requise.",
    photoUnnamed: "Nommez chaque photo requise ou supprimez les vides.",
    defaultRejectReason: "Hors du périmètre du contrat actuel.",
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
    durationRequired: "La duración es obligatoria.",
    failedDuration: "Error al actualizar la duración de la tarea.",
    photoRequired: "Foto obligatoria",
    photoName: "Nombre de la foto obligatoria",
    addPhoto: "+ Añadir foto",
    removePhoto: "Eliminar",
    photoNeeded: "Añada al menos una foto o desactive la foto obligatoria.",
    photoUnnamed: "Dé un nombre a cada foto obligatoria o elimine las vacías.",
    defaultRejectReason: "Fuera del alcance del contrato actual.",
  },
};

interface ExtraServiceActionFooterProps {
  request: UnifiedServiceRequest;
  onDone: () => void;
  onError: (msg: string) => void;
}

export function ExtraServiceActionFooter({
  request,
  onDone,
  onError,
}: ExtraServiceActionFooterProps) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = footerTranslations[locale] || footerTranslations.en;

  const [approveAdditional] = useApproveAdditionalTaskMutation();
  const [updateAdditional] = useUpdateAdditionalTaskMutation();
  const [saving, setSaving] = useState(false);
  const [showDurationPrompt, setShowDurationPrompt] = useState(false);
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const currentStatus = (request.status || "").toLowerCase();
  const isActionable = ["pending", "under_review", "awaiting_approval"].includes(currentStatus);

  
  const approvalTaskIds = request.taskIds?.length
    ? request.taskIds
    : request.taskId
    ? [request.taskId]
    : [];



  const handleApprove = async (decision?: ApproveDecision) => {
    if (!decision) {
      setShowDurationPrompt(true);
      return null;
    }

    setSaving(true);
    const planId = request.planId;
    const taskIds = approvalTaskIds;

    if (decision && taskIds.length > 0) {
      try {
        for (const tId of taskIds) {
          await updateAdditional({
            id: tId,
            duration_minutes: decision.minutes,
            is_photo_required: decision.is_photo_required,
            photo_requirements: decision.photo_requirements,
          }).unwrap();
        }
      } catch (err) {
        setSaving(false);
        return apiError(err, t.failedDuration);
      }
    }

    let approveSuccess = false;

    
    
    for (const tId of taskIds) {
      try {
        await approveAdditional({ id: tId, status: "Approved" }).unwrap();
        approveSuccess = true;
      } catch {
        
      }
    }

    setSaving(false);
    if (!approveSuccess && (request.rawAdditionalTask || !planId)) {
      
      if (!decision) onError(t.failedApprove);
      return t.failedApprove;
    }
    
    
    setShowDurationPrompt(false);
    if (decision) {
      window.setTimeout(onDone, 160);
    } else {
      onDone();
    }
    return null;
  };

  const handleReject = async () => {
    
    
    const reason = rejectionReason.trim();
    if (!reason) {
      onError(t.specifyReason);
      return;
    }
    setSaving(true);
    const planId = request.planId;
    const taskIds = request.taskIds?.length
      ? request.taskIds
      : request.taskId
      ? [request.taskId]
      : [];

    let rejectSuccess = false;

    
    for (const tId of taskIds) {
      try {
        await approveAdditional({ id: tId, status: "Rejected", reject_reason: reason }).unwrap();
        rejectSuccess = true;
      } catch {
        
      }
    }

    setSaving(false);
    if (!rejectSuccess && (request.rawAdditionalTask || !planId)) {
      return onError(t.failedReject);
    }
    onDone();
  };

  if (!isActionable) {
    return (
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 shrink-0">
        <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onDone}
              className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t.close}
            </button>
        </div>
      </div>
    );
  }

  if (showRejectPrompt) {
    return (
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 shrink-0">
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50/70 p-3.5">
          <label htmlFor="reject-reason" className="block text-xs font-semibold text-red-800">
            {t.specifyReason}
          </label>
          <textarea
            id="reject-reason"
            autoFocus
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder={t.reasonPlaceholder}
            rows={3}
            disabled={saving}
            className="w-full rounded border border-red-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-red-300 disabled:bg-slate-50"
          />
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => setRejectionReason(t.defaultRejectReason)}
              className="cursor-pointer text-[11px] font-semibold text-red-700 underline transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {t.defaultRejectReason}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowRejectPrompt(false)}
                className="cursor-pointer rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={saving || !rejectionReason.trim()}
                onClick={() => void handleReject()}
                className="cursor-pointer rounded bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? t.rejecting : t.confirmReject}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 shrink-0">
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
            onClick={() => setShowDurationPrompt(true)}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 transition-all disabled:opacity-50 cursor-pointer"
          >
            <MdCheck className="text-base" />
            {saving ? t.processing : t.acceptAndApprove}
          </button>
      </div>

      {showDurationPrompt && (
        <ApproveDurationModal
          initialMinutes={request.rawAdditionalTask?.duration_minutes}
          initialPhotoRequired={request.rawAdditionalTask?.is_photo_required}
          initialPhotoRequirements={request.rawAdditionalTask?.photo_requirements}
          copy={{
            title: t.durationTitle,
            hint: t.durationHint,
            label: t.durationLabel,
            minutes: t.durationMinutes,
            cancel: t.cancel,
            confirm: t.durationConfirm,
            saving: t.durationSaving,
            invalid: t.durationInvalid,
            required: t.durationRequired,
            photoRequired: t.photoRequired,
            photoName: t.photoName,
            addPhoto: t.addPhoto,
            remove: t.removePhoto,
            photoNeeded: t.photoNeeded,
            photoUnnamed: t.photoUnnamed,
          }}
          onCancel={() => setShowDurationPrompt(false)}
          onConfirm={(decision) => handleApprove(decision)}
        />
      )}
    </div>
  );
}

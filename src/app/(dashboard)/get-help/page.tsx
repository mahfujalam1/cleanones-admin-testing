"use client";

import React, { useState, useMemo } from "react";
import {
  useGetSuggestedQuestionsQuery,
  useCreateSuggestedQuestionMutation,
  useUpdateSuggestedQuestionMutation,
  useDeleteSuggestedQuestionMutation,
} from "@/redux/api/suggestedQuestionsApi";
import type { SuggestedQuestion } from "@/services/actions/suggestedQuestions";
import type { GetHelpFilterState, QuestionModalState, DeleteModalState, GetHelpStats } from "@/components/get-help/types";
import { GetHelpHeader } from "@/components/get-help/GetHelpHeader";
import { GetHelpFilters } from "@/components/get-help/GetHelpFilters";
import { GetHelpFaqBanner } from "@/components/get-help/GetHelpFaqBanner";
import { QuestionCard } from "@/components/get-help/QuestionCard";
import { QuestionFormModal } from "@/components/get-help/QuestionFormModal";
import { DeleteConfirmModal } from "@/components/get-help/DeleteConfirmModal";
import { MdHelpOutline, MdAdd } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

export default function GetHelpPage() {
  const t = getHelpTranslation(getLocale(usePathname()));
  const [filters, setFilters] = useState<GetHelpFilterState>({ search: "", role: "", status: "all" });
  const [formModal, setFormModal] = useState<QuestionModalState>({ isOpen: false, mode: "create" });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ isOpen: false });
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetSuggestedQuestionsQuery(
    { target_role: filters.role || undefined, limit: 100 },
    { refetchOnMountOrArgChange: true }
  );

  const [createQuestion, { isLoading: isCreating }] = useCreateSuggestedQuestionMutation();
  const [updateQuestion, { isLoading: isUpdating }] = useUpdateSuggestedQuestionMutation();
  const [deleteQuestion, { isLoading: isDeleting }] = useDeleteSuggestedQuestionMutation();

  const allQuestions = data?.questions ?? [];

  const stats: GetHelpStats = useMemo(() => ({
    total: allQuestions.length,
    allRoles: allQuestions.filter((q) => q.target_role === "all").length,
    clients: allQuestions.filter((q) => q.target_role === "client").length,
    workers: allQuestions.filter((q) => q.target_role === "worker").length,
    active: allQuestions.filter((q) => q.is_active).length,
  }), [allQuestions]);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((item) => {
      const matchSearch =
        !filters.search.trim() ||
        item.question.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.answer.toLowerCase().includes(filters.search.toLowerCase());

      const matchStatus =
        filters.status === "all" ||
        (filters.status === "active" ? item.is_active : !item.is_active);

      return matchSearch && matchStatus;
    });
  }, [allQuestions, filters.search, filters.status]);

  const handleToggleStatus = async (item: SuggestedQuestion) => {
    try {
      setTogglingId(item.id);
      await updateQuestion({ id: item.id, body: { is_active: !item.is_active } }).unwrap();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleFormSubmit = async (formData: { question: string; answer: string; target_role: string; is_active: boolean }) => {
    try {
      if (formModal.mode === "create") {
        await createQuestion(formData).unwrap();
      } else if (formModal.question) {
        await updateQuestion({ id: formModal.question.id, body: formData }).unwrap();
      }
      setFormModal({ isOpen: false, mode: "create" });
    } catch (err) {
      console.error("Form submit failed:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.question) return;
    try {
      await deleteQuestion(deleteModal.question.id).unwrap();
      setDeleteModal({ isOpen: false });
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <GetHelpFaqBanner />
      <GetHelpHeader stats={stats} onAddClick={() => setFormModal({ isOpen: true, mode: "create" })} />
      <GetHelpFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100/70 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-3">
            <MdHelpOutline className="text-3xl" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t.noQuestions}</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {filters.search ? t.adjustFilters : t.getHelpDesc}
          </p>
          <button
            type="button"
            onClick={() => setFormModal({ isOpen: true, mode: "create" })}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <MdAdd className="text-base" />
            <span>{t.addFirstQuestion}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((item) => (
            <QuestionCard
              key={item.id}
              item={item}
              isUpdating={togglingId === item.id}
              onEdit={(q) => setFormModal({ isOpen: true, mode: "edit", question: q })}
              onDelete={(q) => setDeleteModal({ isOpen: true, question: q })}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      <QuestionFormModal
        isOpen={formModal.isOpen}
        mode={formModal.mode}
        initialData={formModal.question}
        isLoading={isCreating || isUpdating}
        onClose={() => setFormModal({ isOpen: false, mode: "create" })}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        question={deleteModal.question}
        isLoading={isDeleting}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

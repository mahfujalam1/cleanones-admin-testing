"use client";

import React, { useState, useMemo } from "react";
import {
  useGetManageFaqsQuery,
  useAddManageFaqMutation,
  useEditManageFaqMutation,
  useDeleteManageFaqMutation,
} from "@/redux/api/manageFaqApi";
import type { ManageFaq } from "@/services/actions/faqs";
import type { SuggestedQuestion } from "@/services/actions/suggestedQuestions";
import type { GetHelpFilterState, QuestionModalState, DeleteModalState } from "@/components/get-help/types";
import { GetHelpHeader } from "@/components/get-help/GetHelpHeader";
import { GetHelpFilters } from "@/components/get-help/GetHelpFilters";
import { GetHelpFaqBanner } from "@/components/get-help/GetHelpFaqBanner";
import { QuestionCard } from "@/components/get-help/QuestionCard";
import { QuestionFormModal } from "@/components/get-help/QuestionFormModal";
import { DeleteConfirmModal } from "@/components/get-help/DeleteConfirmModal";
import { apiError } from "@/redux/api/apiError";
import { MdHelpOutline, MdAdd } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

/**
 * `/manage/get-faq` returns the whole list at once and names its fields a little
 * differently, so each FAQ is reshaped into what the card and modals already read.
 */
function toCardItem(faq: ManageFaq): SuggestedQuestion {
  return {
    id: faq._id,
    question: faq.question,
    answer: faq.answer,
    created_by_manager_id: "",
    created_at: faq.createdAt ?? faq.created_at ?? "",
    updated_at: faq.updatedAt ?? faq.updated_at ?? "",
  };
}

export default function GetHelpPage() {
  const t = getHelpTranslation(getLocale(usePathname()));
  const [filters, setFilters] = useState<GetHelpFilterState>({ search: "" });
  const [formModal, setFormModal] = useState<QuestionModalState>({ isOpen: false, mode: "create" });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ isOpen: false });
  const [error, setError] = useState("");

  const { data: faqs = [], isLoading, isFetching, error: listError } = useGetManageFaqsQuery();

  const [addFaq, { isLoading: isCreating }] = useAddManageFaqMutation();
  const [editFaq, { isLoading: isUpdating }] = useEditManageFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteManageFaqMutation();

  const questions = useMemo(() => faqs.map(toCardItem), [faqs]);
  const total = questions.length;

  // The route takes no search param, so filtering is done here over the full list.
  const filteredQuestions = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [questions, filters.search]);

  const handleFormSubmit = async (formData: { question: string; answer: string }) => {
    setError("");
    try {
      if (formModal.mode === "create") {
        await addFaq(formData).unwrap();
      } else if (formModal.question) {
        await editFaq({ id: formModal.question.id, body: formData }).unwrap();
      }
      setFormModal({ isOpen: false, mode: "create" });
    } catch (err) {
      setError(apiError(err));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.question) return;
    setError("");
    try {
      await deleteFaq(deleteModal.question.id).unwrap();
      setDeleteModal({ isOpen: false });
    } catch (err) {
      setError(apiError(err));
    }
  };

  const message = error || (listError ? apiError(listError) : "");

  return (
    <div className="space-y-4 pb-12">
      <GetHelpFaqBanner />
      <GetHelpHeader total={total} onAddClick={() => setFormModal({ isOpen: true, mode: "create" })} />
      <GetHelpFilters filters={filters} onChange={setFilters} resultCount={filteredQuestions.length} />

      {message && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{message}</p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-100/70" />
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <MdHelpOutline className="text-3xl" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t.noQuestions}</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            {filters.search ? t.adjustFilters : t.getHelpDesc}
          </p>
          {filters.search ? (
            <button
              type="button"
              onClick={() => setFilters({ search: "" })}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              {t.clear}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFormModal({ isOpen: true, mode: "create" })}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-primary/90"
            >
              <MdAdd className="text-base" />
              <span>{t.addFirstQuestion}</span>
            </button>
          )}
        </div>
      ) : (
        <div className={`space-y-3 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
          {filteredQuestions.map((item) => (
            <QuestionCard
              key={item.id}
              item={item}
              defaultOpen={filteredQuestions.length === 1}
              onEdit={(q) => setFormModal({ isOpen: true, mode: "edit", question: q })}
              onDelete={(q) => setDeleteModal({ isOpen: true, question: q })}
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

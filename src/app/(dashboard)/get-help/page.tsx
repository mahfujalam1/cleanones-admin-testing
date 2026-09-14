"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useGetQuestionSuggestionsQuery,
  useCreateQuestionSuggestionMutation,
  useUpdateQuestionSuggestionMutation,
  useDeleteQuestionSuggestionMutation,
} from "@/redux/api/suggestedQuestionsApi";
import type { QuestionSuggestion, SuggestedQuestion } from "@/services/actions/suggestedQuestions";
import type { GetHelpFilterState, QuestionModalState, DeleteModalState } from "@/components/get-help/types";
import { GetHelpHeader } from "@/components/get-help/GetHelpHeader";
import { GetHelpFilters } from "@/components/get-help/GetHelpFilters";
import { QuestionCard } from "@/components/get-help/QuestionCard";
import { QuestionFormModal } from "@/components/get-help/QuestionFormModal";
import { DeleteConfirmModal } from "@/components/get-help/DeleteConfirmModal";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { apiError } from "@/redux/api/apiError";
import { MdHelpOutline, MdAdd } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

function toCardItem(item: QuestionSuggestion): SuggestedQuestion {
  return {
    id: item._id,
    question: item.question,
    answer: item.answer,
    created_by_manager_id: "",
    created_at: item.createdAt ?? item.created_at ?? "",
    updated_at: item.updatedAt ?? item.updated_at ?? "",
  };
}

export default function GetHelpPage() {
  const t = getHelpTranslation(getLocale(usePathname()));
  const [filters, setFilters] = useState<GetHelpFilterState>({ search: "" });
  const [page, setPage] = useState(1);
  const LIMIT = 8;
  const [formModal, setFormModal] = useState<QuestionModalState>({ isOpen: false, mode: "create" });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ isOpen: false });
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [filters.search]);

  const { data: suggestions = [], isLoading, isFetching, error: listError } = useGetQuestionSuggestionsQuery();

  const [createQuestion, { isLoading: isCreating }] = useCreateQuestionSuggestionMutation();
  const [updateQuestion, { isLoading: isUpdating }] = useUpdateQuestionSuggestionMutation();
  const [deleteQuestion, { isLoading: isDeleting }] = useDeleteQuestionSuggestionMutation();

  const questions = useMemo(() => suggestions.map(toCardItem), [suggestions]);
  const total = questions.length;

  // The route takes no search param, so filtering is done here over the full list.
  const filteredQuestions = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [questions, filters.search]);

  const pagedQuestions = useMemo(() => {
    return filteredQuestions.slice((page - 1) * LIMIT, page * LIMIT);
  }, [filteredQuestions, page]);

  const handleFormSubmit = async (formData: { question: string; answer: string }) => {
    setError("");
    try {
      if (formModal.mode === "create") {
        await createQuestion(formData).unwrap();
      } else if (formModal.question) {
        await updateQuestion({ id: formModal.question.id, body: formData }).unwrap();
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
      await deleteQuestion(deleteModal.question.id).unwrap();
      setDeleteModal({ isOpen: false });
    } catch (err) {
      setError(apiError(err));
    }
  };

  const message = error || (listError ? apiError(listError) : "");

  return (
    <div className="space-y-4 pb-12">
      <GetHelpHeader total={total} onAddClick={() => setFormModal({ isOpen: true, mode: "create" })} />
      <GetHelpFilters filters={filters} onChange={setFilters} resultCount={filteredQuestions.length} />

      {message && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{message}</p>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-100/70" />
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
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-sky-600"
            >
              <MdAdd className="text-base" />
              <span>{t.addFirstQuestion}</span>
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-4 md:grid-cols-2 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
          {pagedQuestions.map((item, index) => (
            <QuestionCard
              key={item.id}
              item={item}
              serialNo={(page - 1) * LIMIT + index + 1}
              onEdit={(q) => setFormModal({ isOpen: true, mode: "edit", question: q })}
              onDelete={(q) => setDeleteModal({ isOpen: true, question: q })}
            />
          ))}
        </div>
      )}

      <BackendPagination
        page={page}
        limit={LIMIT}
        total={filteredQuestions.length}
        onPageChange={setPage}
        itemLabel="questions"
      />

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

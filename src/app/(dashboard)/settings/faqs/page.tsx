"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useGetManageFaqsQuery,
  useAddManageFaqMutation,
  useEditManageFaqMutation,
  useDeleteManageFaqMutation,
} from "@/redux/api/manageFaqApi";
import type { FaqItem } from "@/services/actions/faqs";
import type { FaqModalState, FaqDeleteModalState } from "@/components/faqs/types";
import { FaqHeader } from "@/components/faqs/FaqHeader";
import { FaqCard } from "@/components/faqs/FaqCard";
import { FaqFormModal } from "@/components/faqs/FaqFormModal";
import { FaqDeleteModal } from "@/components/faqs/FaqDeleteModal";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { apiError } from "@/redux/api/apiError";
import { MdSearch, MdLiveHelp, MdAdd, MdClose } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

export default function SettingsFaqsPage() {
  const t = getHelpTranslation(getLocale(usePathname()));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 8;
  const [formModal, setFormModal] = useState<FaqModalState>({ isOpen: false, mode: "create" });
  const [deleteModal, setDeleteModal] = useState<FaqDeleteModalState>({ isOpen: false });
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data: faqs = [], isLoading, isFetching, error: listError } = useGetManageFaqsQuery();

  const [addFaq, { isLoading: isCreating }] = useAddManageFaqMutation();
  const [editFaq, { isLoading: isUpdating }] = useEditManageFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteManageFaqMutation();

  const mappedFaqs: FaqItem[] = useMemo(() => {
    return faqs.map((f, index) => ({
      _id: f._id,
      serial_no: index + 1,
      question: f.question,
      answer: f.answer,
      created_at: f.created_at ?? f.createdAt ?? "",
      updated_at: f.updated_at ?? f.updatedAt ?? "",
    }));
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mappedFaqs;
    return mappedFaqs.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        String(item.serial_no).includes(q)
    );
  }, [mappedFaqs, search]);

  const pagedFaqs = useMemo(() => {
    return filteredFaqs.slice((page - 1) * LIMIT, page * LIMIT);
  }, [filteredFaqs, page]);

  const nextSerialNo = mappedFaqs.length + 1;

  const handleFormSubmit = async (formData: { question: string; answer: string; serial_no: number }) => {
    setError("");
    try {
      if (formModal.mode === "create") {
        await addFaq({ question: formData.question, answer: formData.answer }).unwrap();
      } else if (formModal.faq) {
        await editFaq({
          id: formModal.faq._id,
          body: { question: formData.question, answer: formData.answer },
        }).unwrap();
      }
      setFormModal({ isOpen: false, mode: "create" });
    } catch (err) {
      setError(apiError(err));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.faq) return;
    setError("");
    try {
      await deleteFaq(deleteModal.faq._id).unwrap();
      setDeleteModal({ isOpen: false });
    } catch (err) {
      setError(apiError(err));
    }
  };

  const message = error || (listError ? apiError(listError) : "");

  return (
    <div className="space-y-4 pb-12">
      <FaqHeader
        total={mappedFaqs.length}
        onAddClick={() => setFormModal({ isOpen: true, mode: "create" })}
        backHref="/settings"
      />

      {/* Search bar */}
      <div className="relative w-full">
        <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search FAQs by question, answer, or serial number..."
          className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs outline-none transition-all focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        />
        {search && (
          <button
            type="button"
            aria-label={t.clear}
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <MdClose />
          </button>
        )}
      </div>

      {message && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{message}</p>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-100/70" />
          ))}
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <MdLiveHelp className="text-3xl" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t.noFaqs}</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            {search ? t.noFaqMatch : t.createFaqHint}
          </p>
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
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
              <span>{t.addFirstFaq}</span>
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-4 md:grid-cols-2 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
          {pagedFaqs.map((faq, index) => (
            <FaqCard
              key={faq._id}
              item={faq}
              serialNo={(page - 1) * LIMIT + index + 1}
              onEdit={(item) => setFormModal({ isOpen: true, mode: "edit", faq: item })}
              onDelete={(item) => setDeleteModal({ isOpen: true, faq: item })}
            />
          ))}
        </div>
      )}

      <BackendPagination
        page={page}
        limit={LIMIT}
        total={filteredFaqs.length}
        onPageChange={setPage}
        itemLabel="FAQs"
      />

      <FaqFormModal
        isOpen={formModal.isOpen}
        mode={formModal.mode}
        initialData={formModal.faq}
        nextSerialNo={nextSerialNo}
        isLoading={isCreating || isUpdating}
        onClose={() => setFormModal({ isOpen: false, mode: "create" })}
        onSubmit={handleFormSubmit}
      />

      <FaqDeleteModal
        isOpen={deleteModal.isOpen}
        faq={deleteModal.faq}
        isLoading={isDeleting}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

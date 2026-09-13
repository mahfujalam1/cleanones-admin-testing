"use client";

import React, { useState, useMemo } from "react";
import {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} from "@/redux/api/faqsApi";
import type { FaqModalState, FaqDeleteModalState } from "@/components/faqs/types";
import { FaqHeader } from "@/components/faqs/FaqHeader";
import { FaqCard } from "@/components/faqs/FaqCard";
import { FaqFormModal } from "@/components/faqs/FaqFormModal";
import { FaqDeleteModal } from "@/components/faqs/FaqDeleteModal";
import { MdSearch, MdLiveHelp, MdAdd, MdClose } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getHelpTranslation } from "@/lib/translations";

export default function FaqsManagementPage() {
  const t = getHelpTranslation(getLocale(usePathname()));
  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState<FaqModalState>({ isOpen: false, mode: "create" });
  const [deleteModal, setDeleteModal] = useState<FaqDeleteModalState>({ isOpen: false });

  const { data: faqs = [], isLoading } = useGetFaqsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  const sortedFaqs = useMemo(() => {
    return [...faqs].sort((a, b) => (a.serial_no ?? 0) - (b.serial_no ?? 0));
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedFaqs;
    return sortedFaqs.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        String(item.serial_no).includes(q)
    );
  }, [sortedFaqs, search]);

  const nextSerialNo = useMemo(() => {
    if (!faqs || faqs.length === 0) return 1;
    const maxSerial = Math.max(faqs.length, ...faqs.map((f) => Number(f.serial_no) || 0));
    return maxSerial + 1;
  }, [faqs]);

  const handleFormSubmit = async (formData: { question: string; answer: string; serial_no: number }) => {
    try {
      if (formModal.mode === "create") {
        await createFaq(formData).unwrap();
      } else if (formModal.faq) {
        await updateFaq({ id: formModal.faq._id, body: formData }).unwrap();
      }
      setFormModal({ isOpen: false, mode: "create" });
    } catch (err) {
      console.error("Failed to save FAQ:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.faq) return;
    try {
      await deleteFaq(deleteModal.faq._id).unwrap();
      setDeleteModal({ isOpen: false });
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <FaqHeader
        total={faqs.length}
        onAddClick={() => setFormModal({ isOpen: true, mode: "create" })}
      />

      {/* Search bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchFaq}
            className="w-full rounded-lg bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button
              type="button"
              aria-label={t.clear}
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <MdClose />
            </button>
          )}
        </div>
        {search && (
          <p className="mt-2.5 border-t border-slate-100 pt-2.5 text-xs font-medium text-slate-500">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? "result" : "results"}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-100/70" />
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
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-primary/90"
            >
              <MdAdd className="text-base" />
              <span>{t.addFirstFaq}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <FaqCard
              key={faq._id}
              item={faq}
              defaultOpen={index === 0 && filteredFaqs.length === 1}
              onEdit={(item) => setFormModal({ isOpen: true, mode: "edit", faq: item })}
              onDelete={(item) => setDeleteModal({ isOpen: true, faq: item })}
            />
          ))}
        </div>
      )}

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

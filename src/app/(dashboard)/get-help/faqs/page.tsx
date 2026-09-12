"use client";

import React, { useState, useMemo } from "react";
import {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} from "@/redux/api/faqsApi";
import type { FaqItem } from "@/services/actions/faqs";
import type { FaqModalState, FaqDeleteModalState } from "@/components/faqs/types";
import { FaqHeader } from "@/components/faqs/FaqHeader";
import { FaqCard } from "@/components/faqs/FaqCard";
import { FaqFormModal } from "@/components/faqs/FaqFormModal";
import { FaqDeleteModal } from "@/components/faqs/FaqDeleteModal";
import { MdSearch, MdLiveHelp, MdAdd } from "react-icons/md";

export default function FaqsManagementPage() {
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
    <div className="space-y-6 pb-12">
      <FaqHeader
        total={faqs.length}
        onAddClick={() => setFormModal({ isOpen: true, mode: "create" })}
      />

      {/* Search Input Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs by question, answer, or serial number..."
            className="w-full rounded-xl bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100/70 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3">
            <MdLiveHelp className="text-3xl" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No FAQs found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {search
              ? "No questions matched your search query. Try another keyword."
              : "Start by creating frequently asked questions for your organization."}
          </p>
          <button
            type="button"
            onClick={() => setFormModal({ isOpen: true, mode: "create" })}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <MdAdd className="text-base" />
            <span>Add First FAQ</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFaqs.map((faq) => (
            <FaqCard
              key={faq._id}
              item={faq}
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

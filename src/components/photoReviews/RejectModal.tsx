"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react"; 
import { PhotoReview, RejectFormData, RejectReason } from "./types";

interface RejectModalProps {
    review: PhotoReview | null;
    open: boolean;
    onClose: () => void;
    onConfirm: (data: RejectFormData) => void;
}

const REJECT_REASONS: { value: RejectReason; label: string }[] = [
    { value: "poor_quality", label: "Poor cleaning quality" },
    { value: "incomplete_cleaning", label: "Incomplete cleaning" },
    { value: "wrong_room", label: "Wrong room photographed" },
    { value: "blurry_image", label: "Blurry or unclear images" },
    { value: "missing_areas", label: "Missing required areas" },
    { value: "other", label: "Other" },
];

export function RejectModal({ review, open, onClose, onConfirm }: RejectModalProps) {
    const [form, setForm] = useState<RejectFormData>({
        reason: "",
        managerComment: "",
        saveAsTrainingData: true,
    });
    const dialogRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback(() => {
        setForm({ reason: "", managerComment: "", saveAsTrainingData: true });
        onClose();
    }, [onClose]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) handleClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, handleClose]);

    if (!open) return null;

    const handleBackdrop = (e: React.MouseEvent) => {
        if (e.target === dialogRef.current) handleClose();
    };

    const isValid = form.reason !== "" && form.managerComment.trim() !== "";

    const handleSubmit = () => {
        if (!isValid) return;
        onConfirm(form);
        setForm({ reason: "", managerComment: "", saveAsTrainingData: true });
    };

    return (
        <div
            ref={dialogRef}
            onClick={handleBackdrop}
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-modal-title"
        >
            <div className="bg-white rounded-md w-full max-w-md shadow">
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-0">
                    <div>
                        <h2 id="reject-modal-title" className="text-base font-semibold text-gray-900">
                            Additional Verification Required
                        </h2>
                        {review && (
                            <p className="text-xs font-medium text-cyan-500 mt-0.5">
                                Review {review.id} · {review.room}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Reason select */}
                    <div className="space-y-1.5">
                        <label htmlFor="reject-reason" className="text-sm font-medium text-gray-700">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="reject-reason"
                            value={form.reason}
                            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value as RejectReason | "" }))}
                            className="w-full text-sm px-3 py-2 rounded bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent appearance-none cursor-pointer"
                        >
                            <option value="" disabled>Select a reason...</option>
                            {REJECT_REASONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Comment */}
                    <div className="space-y-1.5">
                        <label htmlFor="reject-comment" className="text-sm font-medium text-gray-700">
                            Manager Comment <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="reject-comment"
                            rows={4}
                            placeholder="Describe what needs to be corrected..."
                            value={form.managerComment}
                            onChange={(e) => setForm((f) => ({ ...f, managerComment: e.target.value }))}
                            className="w-full text-sm px-3 py-2 rounded bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Training data toggle */}
                    <label className="flex items-start gap-3 bg-red-50 p-3 rounded cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.saveAsTrainingData}
                            onChange={(e) => setForm((f) => ({ ...f, saveAsTrainingData: e.target.checked }))}
                            className="mt-0.5 w-4 h-4 accent-red-500 shrink-0"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Save Review As AI Training Data</p>
                            <p className="text-xs text-gray-500 mt-0.5">This outcome helps the AI learn from corrections.</p>
                        </div>
                    </label>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!isValid}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <X className="w-4 h-4" />
                            Reject & Notify Cleaner
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Check } from "lucide-react";
import { ApproveFormData, PhotoReview } from "./types";

interface ApproveModalProps {
    review: PhotoReview | null;
    open: boolean;
    onClose: () => void;
    onConfirm: (data: ApproveFormData) => void;
}

export function ApproveModal({ review, open, onClose, onConfirm }: ApproveModalProps) {
    const [form, setForm] = useState<ApproveFormData>({
        managerComment: "",
        saveAsTrainingData: true,
    });
    const dialogRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback(() => {
        setForm({ managerComment: "", saveAsTrainingData: true });
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

    const handleSubmit = () => {
        onConfirm(form);
        setForm({ managerComment: "", saveAsTrainingData: true });
    };

    return (
        <div
            ref={dialogRef}
            onClick={handleBackdrop}
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-modal-title"
        >
            <div className="bg-white rounded-md w-full max-w-md shadow">
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-0">
                    <div>
                        <h2 id="approve-modal-title" className="text-base font-semibold text-gray-900">
                            Verify Service Quality
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
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">
                            Manager Comment{" "}
                            <span className="font-normal text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Add a comment about this review..."
                            value={form.managerComment}
                            onChange={(e) => setForm((f) => ({ ...f, managerComment: e.target.value }))}
                            className="w-full text-sm px-3 py-2 rounded bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Training data toggle */}
                    <label className="flex items-start gap-3 bg-emerald-50 p-3 rounded cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.saveAsTrainingData}
                            onChange={(e) => setForm((f) => ({ ...f, saveAsTrainingData: e.target.checked }))}
                            className="mt-0.5 w-4 h-4 accent-emerald-500 shrink-0"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Save Review As AI Training Data</p>
                            <p className="text-xs text-gray-500 mt-0.5">This review outcome will improve AI accuracy over time.</p>
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
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded hover:bg-emerald-600 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                            Approve & Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

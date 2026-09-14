"use client";

import React from "react";
import { MdDeleteOutline } from "react-icons/md";

interface DeleteMessageModalProps {
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteMessageModal({
  loading,
  onClose,
  onConfirm,
}: DeleteMessageModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl border border-slate-200 animate-in zoom-in-95">
        <div className="flex items-center gap-3 text-red-600 pb-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <MdDeleteOutline className="text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Delete Message</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to soft-delete this message?
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

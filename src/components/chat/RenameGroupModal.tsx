"use client";

import React, { useState } from "react";
import { MdClose, MdEdit } from "react-icons/md";
import { useRenameGroupChatMutation } from "@/redux/api/endpoints/chat.api";
import { apiError } from "@/redux/api/apiError";

export function RenameGroupModal({
  chatId,
  currentName,
  onClose,
  onRenamed,
}: {
  chatId: string;
  currentName: string;
  onClose: () => void;
  onRenamed?: (newName: string) => void;
}) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState("");
  const [renameChat, { isLoading }] = useRenameGroupChatMutation();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a group name.");
      return;
    }

    try {
      setError("");
      await renameChat({ id: chatId, name: name.trim() }).unwrap();
      onRenamed?.(name.trim());
      onClose();
    } catch (err) {
      setError(apiError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl border border-slate-200 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-primary">
              <MdEdit className="text-base" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Rename Group Chat</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
          >
            <MdClose className="text-lg" />
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSave} className="py-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Downtown Office Cleaning"
              className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Name"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { MdAttachFile, MdSend } from "react-icons/md";

interface ChatMessageInputProps {
  placeholder?: string;
  inputText: string;
  sending: boolean;
  onInputChange: (text: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onAttachFile: (file?: File) => void;
}

export function ChatMessageInput({
  placeholder,
  inputText,
  sending,
  onInputChange,
  onSendMessage,
  onAttachFile,
}: ChatMessageInputProps) {
  return (
    <form onSubmit={onSendMessage} className="border-t border-slate-100 p-3 bg-white">
      <div className="flex items-center gap-2">
        <label
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 cursor-pointer transition-colors"
          title="Attach file or photo"
        >
          <MdAttachFile className="text-lg" />
          <input
            type="file"
            className="hidden"
            onChange={(e) => void onAttachFile(e.target.files?.[0])}
          />
        </label>

        <input
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder || "Type a message..."}
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/60 px-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-xs hover:bg-primary/90 disabled:opacity-40 cursor-pointer transition-colors"
          title="Send message"
        >
          <MdSend className="text-base" />
        </button>
      </div>
    </form>
  );
}

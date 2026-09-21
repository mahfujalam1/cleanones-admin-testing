"use client";

import React, { useEffect, useRef } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";

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
  const ui = getUiTranslation(getLocale(usePathname()));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sending) inputRef.current?.focus();
  }, [sending]);

  const handleSubmit = (e: React.FormEvent) => {
    onSendMessage(e);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3 bg-white">
      <div className="flex items-center gap-2">
        <label
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors ${
            sending
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-slate-50 hover:text-slate-700"
          }`}
          title={ui.attachFile}
        >
          <MdAttachFile className="text-lg" />
          <input
            type="file"
            className="hidden"
            disabled={sending}
            onChange={(e) => {
              void onAttachFile(e.target.files?.[0]);
              
              e.target.value = "";
            }}
          />
        </label>

        <input
          ref={inputRef}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder || ui.typeAMessage}
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/60 px-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />

        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          aria-busy={sending}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-xs transition-colors ${
            sending
              ? "cursor-wait opacity-100"
              : "cursor-pointer hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          }`}
          title={ui.sendMessage}
        >
          {sending ? (
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          ) : (
            <MdSend className="text-base" />
          )}
        </button>
      </div>
    </form>
  );
}

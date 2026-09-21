"use client";

import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdDeleteOutline, MdMoreVert, MdOutlineClose, MdZoomIn } from "react-icons/md";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";
import type { ChatMessage } from "@/redux/api/endpoints/chat.api";
import { formatDateDivider, formatMessageTime } from "./chatUtils";

interface ChatMessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  currentUserId?: string;
  authUserId?: string;
  typingUser?: string;
  /** Sender id -> display name, resolved from the chat's member list. */
  senderNames?: Map<string, string>;
  onRequestDeleteMessage: (msg: ChatMessage) => void;
}

export function ChatMessageList({
  messages,
  loading,
  currentUserId,
  authUserId,
  typingUser,
  senderNames,
  onRequestDeleteMessage,
}: ChatMessageListProps) {
  const ui = getUiTranslation(getLocale(usePathname()));
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);
  /** The photo currently open in the lightbox, or null when it is closed. */
  const [preview, setPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Escape closes the preview, matching every other modal in the dashboard.
  useEffect(() => {
    if (!preview) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [preview]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-5">
      {loading && !messages.length ? (
        <DetailSkeleton blocks={5} />
      ) : messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((message, index) => {
            const senderId =
              typeof message.sender === "object" ? message.sender._id : message.sender;

            const ownMessage =
              message.sender_role === "manager" ||
              (Boolean(currentUserId) && senderId === currentUserId) ||
              (Boolean(authUserId) && senderId === authUserId);

            const senderName =
              (typeof message.sender === "object" && message.sender.full_name) ||
              (senderId && senderNames?.get(senderId)) ||
              (message.sender_role === "manager"
                ? "Manager"
                : message.sender_role === "client"
                ? "Client"
                : "Worker");

            const dateKey = new Date(message.createdAt || "").toDateString();
            const prevDateKey =
              index > 0
                ? new Date(
                    messages[index - 1].createdAt || ""
                  ).toDateString()
                : null;
            const showDateDivider = index === 0 || dateKey !== prevDateKey;

            return (
              <React.Fragment key={message._id || index}>
                {showDateDivider && (
                  <div className="my-3 flex items-center justify-center">
                    <span className="rounded-full bg-slate-200/70 px-3 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-300/40">
                      {formatDateDivider(message.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`group flex ${ownMessage ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                      ownMessage ? "items-end" : "items-start"
                    }`}
                  >
                    {!ownMessage && (
                      <div className="mb-1 flex items-center gap-1.5 px-1">
                        <span className="text-[11px] font-bold text-slate-700">
                          {senderName}
                        </span>
                        <span
                          className={`rounded px-1 text-[9px] font-semibold uppercase ${
                            message.sender_role === "client"
                              ? "bg-blue-100 text-blue-700"
                              : message.sender_role === "worker"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {message.sender_role}
                        </span>
                      </div>
                    )}

                    <div className={`flex items-center gap-1.5 ${ownMessage ? "" : "flex-row-reverse"}`}>
                      {!message.is_deleted && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuMsgId((prev) =>
                                prev === message._id ? null : message._id
                              )
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 cursor-pointer"
                            title="Message actions"
                          >
                            <MdMoreVert className="text-sm" />
                          </button>

                          {activeMenuMsgId === message._id && (
                            <div
                              className={`absolute top-full mt-1 z-30 w-32 rounded-lg bg-white p-1 shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 ${
                                ownMessage ? "right-0" : "left-0"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuMsgId(null);
                                  onRequestDeleteMessage(message);
                                }}
                                className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                              >
                                <MdDeleteOutline className="text-sm" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`relative rounded-2xl px-3.5 py-2.5 text-xs leading-5 shadow-2xs border ${
                          message.is_deleted
                            ? "bg-slate-100 text-slate-400 border-slate-200 italic"
                            : ownMessage
                            ? "rounded-tr-xs bg-primary text-white border-primary"
                            : "rounded-tl-xs bg-white text-slate-800 border-slate-200"
                        }`}
                      >
                        {message.is_deleted ? (
                          <p>This message was deleted</p>
                        ) : (
                          <>
                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mb-2 space-y-1.5">
                                {message.attachments.map((att, aIdx) => (
                                  <div key={aIdx} className="overflow-hidden rounded-lg">
                                    {att.type === "image" ? (
                                      <button
                                        type="button"
                                        onClick={() => setPreview(att.url)}
                                        title={ui.clickToPreview}
                                        className="group/photo relative block cursor-zoom-in overflow-hidden rounded-lg"
                                      >
                                        <img
                                          src={att.url}
                                          alt={ui.photo}
                                          className="max-h-56 max-w-full rounded-lg object-cover transition-transform duration-200 group-hover/photo:scale-[1.02]"
                                        />
                                        {/* Hover hint, so it is clear the photo opens larger. */}
                                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 rounded-lg bg-slate-950/45 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover/photo:opacity-100">
                                          <MdZoomIn className="text-base" />
                                          {ui.clickToPreview}
                                        </span>
                                      </button>
                                    ) : (
                                      <a
                                        href={att.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 underline font-medium text-inherit"
                                      >
                                        <MdAttachFile /> View attachment
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {message.text && (
                              <p className="whitespace-pre-wrap break-words font-normal">
                                {message.text}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <span className="mt-1 px-1 text-[9px] text-slate-400">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {typingUser && (
            <p className="text-xs text-slate-400 italic animate-pulse">
              {typingUser} is typing...
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-center">
          <p className="text-xs text-slate-400">
            No messages yet in this conversation. Start chatting below!
          </p>
        </div>
      )}

      {/* Photo lightbox, portalled so the chat scroll container cannot clip it. */}
      {preview &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={ui.photo}
            onClick={() => setPreview(null)}
            className="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 animate-in fade-in duration-150"
          >
            <button
              type="button"
              onClick={() => setPreview(null)}
              aria-label={ui.close}
              className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <MdOutlineClose className="text-2xl" />
            </button>

            <img
              src={preview}
              alt={ui.photo}
              // The image itself must not close the dialog, so the backdrop click is stopped here.
              onClick={(event) => event.stopPropagation()}
              className="max-h-[88vh] max-w-full rounded-lg object-contain shadow-2xl animate-in zoom-in-95 duration-150"
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

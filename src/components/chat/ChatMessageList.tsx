"use client";

import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdDeleteOutline, MdMoreVert } from "react-icons/md";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";
import type { ChatMessage } from "@/redux/api/endpoints/chat.api";
import { formatDateDivider, formatMessageTime } from "./chatUtils";

interface ChatMessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  currentUserId?: string;
  authUserId?: string;
  typingUser?: string;
  onRequestDeleteMessage: (msg: ChatMessage) => void;
}

export function ChatMessageList({
  messages,
  loading,
  currentUserId,
  authUserId,
  typingUser,
  onRequestDeleteMessage,
}: ChatMessageListProps) {
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
              typeof message.sender === "object" && message.sender.full_name
                ? message.sender.full_name
                : message.sender_role === "manager"
                ? "Manager"
                : message.sender_role === "client"
                ? "Client"
                : "Worker";

            const dateKey = new Date(message.created_at || message.createdAt || "").toDateString();
            const prevDateKey =
              index > 0
                ? new Date(
                    messages[index - 1].created_at || messages[index - 1].createdAt || ""
                  ).toDateString()
                : null;
            const showDateDivider = index === 0 || dateKey !== prevDateKey;

            return (
              <React.Fragment key={message._id || index}>
                {showDateDivider && (
                  <div className="my-3 flex items-center justify-center">
                    <span className="rounded-full bg-slate-200/70 px-3 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-300/40">
                      {formatDateDivider(message.created_at || message.createdAt)}
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

                    <div className="flex items-center gap-1.5">
                      {/* Message Action Trigger */}
                      {ownMessage && !message.is_deleted && (
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
                            <div className="absolute right-0 top-full mt-1 z-30 w-32 rounded-lg bg-white p-1 shadow-lg border border-slate-200 animate-in fade-in zoom-in-95">
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
                                      <img
                                        src={att.url}
                                        alt="Attachment"
                                        className="max-h-56 max-w-full rounded-lg object-cover"
                                      />
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
                      {formatMessageTime(message.created_at || message.createdAt)}
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
    </div>
  );
}

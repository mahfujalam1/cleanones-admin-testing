"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MdAttachFile,
  MdClose,
  MdDelete,
  MdEdit,
  MdGroupAdd,
  MdMoreVert,
  MdSearch,
  MdSend,
} from "react-icons/md";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";
import { useAppSelector } from "@/store/hooks";
import {
  createConversation,
  deleteMessage,
  editMessage,
  getConversationParticipants,
  getConversations,
  getMessages,
  getParticipantProfile,
  markConversationRead,
  sendMessage,
  uploadChatAttachment,
  type ChatMessage,
  type Conversation,
  type ParticipantProfile,
} from "@/services/actions/chat";
import { getClients } from "@/services/actions/clients";
import { getWorkers } from "@/services/actions/workers";

type Tab = "clients" | "workers" | "groups";
type Candidate = { id: string; name: string; type: "client" | "worker" };

function getWebSocketUrl(userId: string): string {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://18.198.109.196:8080";
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  try {
    const url = new URL(apiBase);
    const protocol = isHttps || url.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${url.host}/chat/ws/${encodeURIComponent(userId)}`;
  } catch {
    const wsProto = isHttps || apiBase.startsWith("https") ? "wss:" : "ws:";
    const host = apiBase.replace(/^https?:\/\//, "").split("/")[0];
    return `${wsProto}//${host}/chat/ws/${encodeURIComponent(userId)}`;
  }
}

function formatDateDivider(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

export default function ChatPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const user = useAppSelector((state) => state.auth.user);
  const [tab, setTab] = useState<Tab>("clients");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [participants, setParticipants] = useState<
    Array<{
      user_id: string;
      name: string;
      role: string;
      profile_picture: string;
    }>
  >([]);
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState("");
  const [typingName, setTypingName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const socket = useRef<WebSocket | null>(null);
  const selectedRef = useRef<Conversation | null>(null);
  const tabRef = useRef<Tab>("clients");
  const endRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<number | undefined>(undefined);

  // Keep refs updated to prevent socket reconnection loops
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  const loadList = useCallback(async (active: Tab, search = "") => {
    setLoading(true);
    const type =
      active === "clients"
        ? "Direct clients"
        : active === "workers"
          ? "direct worker"
          : "Group";
    const result = await getConversations({
      page: 1,
      limit: 100,
      type,
      search,
    });
    setLoading(false);
    if (!result.success) return setError(result.error);
    const list = result.data.conversations;
    setConversations(list);
    setSelected(
      (current) =>
        list.find((item) => item.id === current?.id) ?? list[0] ?? null,
    );
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadList(tab, query);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [tab, query, loadList]);

  const loadConversation = useCallback(async (conversation: Conversation) => {
    setSelected(conversation);
    setMessageLoading(true);
    const [messageResult, participantResult, profileResult] = await Promise.all(
      [
        getMessages(conversation.id),
        getConversationParticipants(conversation.id),
        getParticipantProfile(conversation.id),
      ],
    );
    setMessageLoading(false);
    if (messageResult.success) setMessages(messageResult.data.messages);
    else setError(messageResult.error);
    if (participantResult.success)
      setParticipants(participantResult.data.participants);
    if (profileResult.success) setProfile(profileResult.data);
    await markConversationRead(conversation.id);
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(
        JSON.stringify({ type: "read", conversation_id: conversation.id }),
      );
    }
    setConversations((current) =>
      current.map((item) =>
        item.id === conversation.id ? { ...item, unread_count: 0 } : item,
      ),
    );
  }, []);

  // Main WebSocket Connection Effect - Runs ONCE when user.id is available
  useEffect(() => {
    if (!user?.id) return;

    let ws: WebSocket | null = null;
    try {
      const wsUrl = getWebSocketUrl(user.id);
      ws = new WebSocket(wsUrl);
      socket.current = ws;
    } catch (e) {
      console.warn("WebSocket initialization skipped or failed:", e);
      return;
    }

    ws.onerror = (err) => {
      console.warn("WebSocket connection error:", err);
    };

    ws.onopen = () => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const activeSelected = selectedRef.current;

        if (data.type === "new_message") {
          // Update conversation list item
          setConversations((current) =>
            current.map((item) =>
              item.id === data.conversation_id
                ? {
                    ...item,
                    unread_count:
                      activeSelected?.id === data.conversation_id
                        ? 0
                        : (item.unread_count || 0) + 1,
                    last_message: {
                      text: data.message?.content || data.message?.text || "New message",
                      sender_id: data.message?.sender_id,
                      sender_name: data.message?.sender_name,
                      timestamp: data.message?.created_at || new Date().toISOString(),
                    },
                  }
                : item,
            ),
          );

          // If current conversation is active, append to messages list (deduped)
          if (data.conversation_id === activeSelected?.id && data.message) {
            setMessages((current) =>
              current.some((item) => item.id === data.message.id)
                ? current
                : [...current, data.message],
            );
          }
        } else if (
          data.type === "message_edited" &&
          data.conversation_id === activeSelected?.id &&
          data.message
        ) {
          setMessages((current) =>
            current.map((item) =>
              item.id === data.message.id ? data.message : item,
            ),
          );
        } else if (
          data.type === "message_deleted" &&
          data.conversation_id === activeSelected?.id &&
          data.message_id
        ) {
          setMessages((current) =>
            current.filter((item) => item.id !== data.message_id),
          );
        } else if (
          data.type === "typing" &&
          data.conversation_id === activeSelected?.id &&
          data.user_id !== user.id
        ) {
          setTypingName(data.is_typing ? data.name : "");
        } else if (
          ["participants_added", "participant_removed"].includes(data.type) &&
          activeSelected &&
          data.conversation_id === activeSelected.id
        ) {
          void loadConversation(activeSelected);
        } else if (data.type === "new_conversation") {
          void loadList(tabRef.current);
        }
      } catch {}
    };

    const heartbeat = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);

    return () => {
      window.clearInterval(heartbeat);
      ws.close();
    };
  }, [user?.id]); // Depend ONLY on user.id

  useEffect(() => {
    if (selected) void loadConversation(selected);
    else {
      setMessages([]);
      setProfile(null);
      setParticipants([]);
    }
  }, [selected?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typingName]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return conversations.filter((item) =>
      `${item.title} ${item.subtitle} ${item.last_message?.text ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [conversations, query]);

  const submit = async () => {
    if (!selected || !text.trim()) return;
    const content = text.trim();
    setText("");

    // 1. Send via REST API (persists in DB and returns created message)
    const result = await sendMessage(selected.id, { content });
    if (result.success) {
      setMessages((current) =>
        current.some((item) => item.id === result.data.id)
          ? current
          : [...current, result.data],
      );
      // Update last message in conversation list
      setConversations((current) =>
        current.map((item) =>
          item.id === selected.id
            ? {
                ...item,
                last_message: {
                  text: content,
                  sender_id: user?.id || "",
                  sender_name: user?.name || user?.email || "Me",
                  timestamp: new Date().toISOString(),
                },
              }
            : item,
        ),
      );

      // 2. Also send over WebSocket if connected for real-time broadcast
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(
          JSON.stringify({
            type: "send_message",
            conversation_id: selected.id,
            content,
            attachment_url: null,
            attachment_type: null,
          }),
        );
      }
    } else {
      setError(result.error);
    }
  };

  const typing = (value: string) => {
    setText(value);
    if (!selected || socket.current?.readyState !== WebSocket.OPEN) return;
    socket.current.send(
      JSON.stringify({
        type: "typing",
        conversation_id: selected.id,
        is_typing: true,
      }),
    );
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(
      () =>
        socket.current?.send(
          JSON.stringify({
            type: "typing",
            conversation_id: selected.id,
            is_typing: false,
          }),
        ),
      800,
    );
  };

  const attach = async (file?: File) => {
    if (!file || !selected) return;
    const uploaded = await uploadChatAttachment(file);
    if (!uploaded.success) return setError(uploaded.error);
    const sent = await sendMessage(selected.id, {
      content: "",
      attachment_url: uploaded.data.attachment_url,
      attachment_type: uploaded.data.attachment_type,
    });
    if (sent.success) {
      setMessages((current) => [...current, sent.data]);
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(
          JSON.stringify({
            type: "send_message",
            conversation_id: selected.id,
            content: "",
            attachment_url: uploaded.data.attachment_url,
            attachment_type: uploaded.data.attachment_type,
          }),
        );
      }
    } else setError(sent.error);
  };

  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingMessage, setDeletingMessage] = useState<ChatMessage | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeMenuMessageId && !(e.target as HTMLElement).closest(".chat-message-menu")) {
        setActiveMenuMessageId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuMessageId]);

  const openEditModal = (message: ChatMessage) => {
    setEditingMessage(message);
    setEditContent(message.content || "");
    setActionError("");
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editContent.trim()) return;
    setActionError("");
    setActionLoading(true);
    const result = await editMessage(editingMessage.id, editContent.trim());
    setActionLoading(false);
    if (result.success) {
      const updated = result.data;
      setMessages((current) =>
        current.map((item) =>
          item.id === editingMessage.id
            ? { ...item, ...(typeof updated === "object" && updated ? updated : {}), content: editContent.trim() }
            : item,
        ),
      );
      setEditingMessage(null);
      setEditContent("");
    } else setActionError(result.error);
  };

  const openDeleteModal = (message: ChatMessage) => {
    setDeletingMessage(message);
    setActionError("");
  };

  const handleConfirmDelete = async () => {
    if (!deletingMessage) return;
    setActionError("");
    setActionLoading(true);
    const result = await deleteMessage(deletingMessage.id);
    setActionLoading(false);
    if (result.success) {
      setMessages((current) =>
        current.filter((item) => item.id !== deletingMessage.id),
      );
      setDeletingMessage(null);
    } else setActionError(result.error);
  };

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] min-h-[570px] flex-col gap-3">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            {t.chat.title}
          </h1>
          <p className="text-xs text-slate-500">
            {t.chat.activeChats}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex h-9 items-center gap-2 rounded bg-sky-500 px-3 text-xs font-semibold text-white cursor-pointer"
        >
          <MdGroupAdd />
          + {t.chat.title}
        </button>
      </header>
      {error && (
        <p className="rounded bg-red-50 p-2 text-xs text-red-700">{error}</p>
      )}
      <div className="grid min-h-0 flex-1 overflow-hidden rounded border bg-white lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_260px]">
        <aside className="flex min-h-0 flex-col border-r">
          <div className="space-y-2 border-b p-3">
            <div className="grid grid-cols-3 rounded border bg-slate-50 p-0.5">
              {(["clients", "workers", "groups"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`h-7 rounded text-[10px] font-semibold ${tab === item ? "bg-white text-sky-600 shadow-sm" : "text-slate-500"}`}
                >
                  {item === "clients" ? t.nav.clients : item === "workers" ? t.nav.workers : t.chat.activeChats}
                </button>
              ))}
            </div>
            <label className="relative block">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.common.search}
                className="h-9 w-full rounded border bg-slate-50 pl-9 pr-3 text-xs"
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {loading ? (
              <DetailSkeleton blocks={7} />
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`mb-1 w-full rounded border p-3 text-left ${selected?.id === item.id ? "border-sky-200 bg-sky-50" : "border-transparent hover:bg-slate-50"}`}
                >
                  <div className="flex justify-between gap-2">
                    <b className="truncate text-xs">{item.title}</b>
                    {item.unread_count > 0 && (
                      <span className="rounded-full bg-sky-500 px-1.5 text-[9px] text-white">
                        {item.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[10px] text-slate-500">
                    {item.subtitle}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-slate-400">
                    {item.last_message?.text || t.chat.noMessages}
                  </p>
                </button>
              ))
            )}
            {!loading && filtered.length === 0 && (
              <p className="py-12 text-center text-xs text-slate-400">
                {t.common.noDataFound}
              </p>
            )}
          </div>
        </aside>
        <section className="flex min-h-0 flex-col">
          {selected ? (
            <>
              <header className="flex h-16 items-center border-b px-4">
                <div>
                  <b className="text-sm">{selected.title}</b>
                  <p className="text-[10px] text-slate-500">
                    {selected.subtitle}
                  </p>
                </div>
                <span className="ml-auto text-[10px] text-slate-400">
                  {participants.length} participants
                </span>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f8fa] p-5">
                {messageLoading ? (
                  <DetailSkeleton blocks={6} />
                ) : (
                  <div className="space-y-3">
                    {messages.map((message, index) => {
                      const isOwnMessage =
                        Boolean(user) &&
                        (message.sender_id === user?.id ||
                          message.sender_id === user?.email ||
                          (user?.email && message.sender_id?.toLowerCase() === user.email.toLowerCase()) ||
                          (user?.name && message.sender_name?.toLowerCase() === user.name.toLowerCase()));

                      const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const messageDateKey = new Date(message.created_at).toDateString();
                      const prevMessageDateKey =
                        index > 0 ? new Date(messages[index - 1].created_at).toDateString() : null;
                      const showDateDivider = index === 0 || messageDateKey !== prevMessageDateKey;

                      return (
                        <React.Fragment key={message.id}>
                          {showDateDivider && (
                            <div className="my-4 flex items-center justify-center">
                              <span className="rounded-full bg-slate-200/80 px-3 py-1 text-[10px] font-semibold text-slate-600 shadow-2xs border border-slate-300/40">
                                {formatDateDivider(message.created_at)}
                              </span>
                            </div>
                          )}
                          <div
                            className={`group flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`flex flex-col max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                              {!isOwnMessage && (
                                <small className="mb-1 text-[11px] font-semibold text-slate-600">
                                  {message.sender_name}
                                </small>
                              )}
                              <div className="flex items-center gap-1.5">
                                {isOwnMessage && (
                                  <div className="relative chat-message-menu">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuMessageId((prev) => (prev === message.id ? null : message.id));
                                      }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
                                      title="More options"
                                    >
                                      <MdMoreVert className="text-base" />
                                    </button>
                                    {activeMenuMessageId === message.id && (
                                      <div className="absolute right-0 top-full mt-1 z-30 w-32 rounded-lg bg-white p-1 shadow-lg border border-slate-200 animate-in fade-in zoom-in-95">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveMenuMessageId(null);
                                            openEditModal(message);
                                          }}
                                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                                        >
                                          <MdEdit className="text-slate-500 text-sm" />
                                          <span>Edit</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveMenuMessageId(null);
                                            openDeleteModal(message);
                                          }}
                                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                        >
                                          <MdDelete className="text-red-500 text-sm" />
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div
                                  className={`relative rounded-2xl px-3.5 py-2.5 text-xs shadow-sm border ${
                                    isOwnMessage
                                      ? "rounded-tr-xs bg-sky-500 text-white border-sky-500"
                                      : "rounded-tl-xs bg-white text-slate-800 border-slate-200"
                                  }`}
                                >
                                  {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
                                  {message.attachment_url &&
                                    (message.attachment_type === "image" ? (
                                      <img
                                        src={message.attachment_url}
                                        alt="Attachment"
                                        className="mt-2 max-h-52 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <a
                                        href={message.attachment_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 block underline font-medium"
                                      >
                                        Open attachment
                                      </a>
                                    ))}
                                </div>
                              </div>
                              <span className="mt-1 text-[10px] text-slate-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                {formattedTime}
                              </span>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    {typingName && (
                      <p className="text-xs text-slate-400">
                        {typingName} is typing...
                      </p>
                    )}
                    <div ref={endRef} />
                  </div>
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
                className="border-t p-3"
              >
                <div className="flex gap-2">
                  <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded border text-slate-500">
                    <MdAttachFile />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => void attach(e.target.files?.[0])}
                    />
                  </label>
                  <input
                    value={text}
                    onChange={(e) => typing(e.target.value)}
                    placeholder={`Message ${selected.title}...`}
                    className="h-9 min-w-0 flex-1 rounded border bg-slate-50 px-3 text-xs"
                  />
                  <button
                    disabled={!text.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded bg-sky-500 text-white disabled:opacity-40"
                  >
                    <MdSend />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
              {t.chat.noMessages}
            </div>
          )}
        </section>
        <aside className="hidden overflow-y-auto border-l p-4 xl:block">
          <h3 className="text-xs font-bold uppercase text-slate-400">
            {t.chat.activeChats} ({participants.length})
          </h3>
          <div className="mt-3 space-y-2">
            {participants.map((item) => (
              <button
                key={item.user_id}
                onClick={async () => {
                  if (!selected) return;
                  const result = await getParticipantProfile(
                    selected.id,
                    item.user_id,
                  );
                  if (result.success) setProfile(result.data);
                }}
                className="flex w-full items-center gap-2 rounded border p-2 text-left"
              >
                <img
                  src={item.profile_picture || "/avatar-placeholder.svg"}
                  className="h-8 w-8 rounded-full"
                  alt={item.name}
                />
                <span>
                  <b className="block text-xs">{item.name}</b>
                  <small className="text-[9px] capitalize text-slate-400">
                    {item.role}
                  </small>
                </span>
              </button>
            ))}
          </div>
          {profile && (
            <div className="mt-5 border-t pt-4">
              <img
                src={profile.profile_picture || "/avatar-placeholder.svg"}
                className="mx-auto h-14 w-14 rounded-full"
                alt={profile.name}
              />
              <h4 className="mt-2 text-center text-sm font-semibold">
                {profile.name}
              </h4>
              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <p>{profile.role_label}</p>
                <p>{profile.email}</p>
                <p>{profile.phone}</p>
                <p>{profile.current_location_name}</p>
                <p>{profile.client_name}</p>
                <p>{profile.account_status}</p>
              </div>
            </div>
          )}
        </aside>
      </div>
      {showCreate && (
        <CreateChatModal
          onClose={() => setShowCreate(false)}
          onCreated={(conversation) => {
            setShowCreate(false);
            setTab(conversation.type === "direct" ? "workers" : "groups");
            setConversations((current) => [conversation, ...current]);
            setSelected(conversation);
          }}
        />
      )}

      {/* Edit Message Modal */}
      {editingMessage && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Edit Message</h3>
              <button
                onClick={() => { setEditingMessage(null); setActionError(""); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
              >
                <MdClose className="text-lg" />
              </button>
            </div>
            {actionError && (
              <p className="mt-3 rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {actionError}
              </p>
            )}
            <div className="py-4 space-y-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Message Content
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setEditingMessage(null); setActionError(""); }}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSaveEdit()}
                disabled={!editContent.trim() || actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMessage && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 pb-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <MdDelete className="text-xl" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete Message</h3>
                <p className="text-xs text-slate-500">Are you sure you want to delete this message?</p>
              </div>
            </div>
            {actionError && (
              <p className="my-2 rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {actionError}
              </p>
            )}
            {deletingMessage.content && (
              <div className="my-3 rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs text-slate-600 italic truncate">
                &ldquo;{deletingMessage.content}&rdquo;
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setDeletingMessage(null); setActionError(""); }}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateChatModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (value: Conversation) => void;
}) {
  const [type, setType] = useState<"direct" | "group">("direct");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    void Promise.all([getClients(1, 100), getWorkers({ limit: 100 })]).then(
      ([clients, workers]) => {
        setCandidates([
          ...(clients.success
            ? clients.data.clients.map(
                (item): Candidate => ({
                  id: item.id,
                  name: item.primary_contact_name || item.company_name,
                  type: "client",
                }),
              )
            : []),
          ...(workers.success
            ? workers.data.workers.map(
                (item): Candidate => ({
                  id: item.worker_id,
                  name: item.full_name,
                  type: "worker",
                }),
              )
            : []),
        ]);
      },
    );
  }, []);
  const create = async () => {
    if (!selectedIds.length) return;
    const result = await createConversation({
      type,
      target_user_id: type === "direct" ? selectedIds[0] : undefined,
      participant_ids: selectedIds,
      title:
        title ||
        (type === "group"
          ? "New Group"
          : candidates.find((item) => item.id === selectedIds[0])?.name ||
            "Direct chat"),
      subtitle:
        type === "group" ? "Group conversation" : "Private conversation",
    });
    if (result.success) onCreated(result.data);
    else setError(result.error);
  };
  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded bg-white shadow">
        <header className="flex justify-between border-b p-4">
          <b>New conversation</b>
          <button onClick={onClose}>
            <MdClose />
          </button>
        </header>
        <div className="space-y-3 p-4">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as "direct" | "group");
              setSelectedIds([]);
            }}
            className="h-10 w-full rounded border px-3 text-sm"
          >
            <option value="direct">Direct chat</option>
            <option value="group">Group chat</option>
          </select>
          {type === "group" && (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Group title"
              className="h-10 w-full rounded border px-3 text-sm"
            />
          )}
          <div className="max-h-64 overflow-y-auto rounded border p-2">
            {candidates.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 border-b p-2 text-sm"
              >
                <input
                  type={type === "direct" ? "radio" : "checkbox"}
                  checked={selectedIds.includes(item.id)}
                  onChange={() =>
                    setSelectedIds((current) =>
                      type === "direct"
                        ? [item.id]
                        : current.includes(item.id)
                          ? current.filter((id) => id !== item.id)
                          : [...current, item.id],
                    )
                  }
                />
                <span>{item.name}</span>
                <small className="ml-auto capitalize text-slate-400">
                  {item.type}
                </small>
              </label>
            ))}
          </div>
          <button
            onClick={() => void create()}
            disabled={!selectedIds.length}
            className="h-10 w-full rounded bg-sky-500 text-sm font-semibold text-white disabled:opacity-40"
          >
            Create conversation
          </button>
        </div>
      </div>
    </div>
  );
}

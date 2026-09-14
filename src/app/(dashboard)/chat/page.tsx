"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdInfoOutline } from "react-icons/md";
import type { Socket } from "socket.io-client";
import { useAppSelector } from "@/redux/hooks";
import { decodeJwt } from "@/lib/auth/jwt";
import { tokenStore } from "@/lib/auth/tokenStore";
import {
  useGetMyChatsQuery,
  useGetChatMessagesQuery,
  useDeleteChatMessageMutation,
  type ChatItem,
  type ChatMessage,
  type ChatAttachment,
} from "@/redux/api/endpoints/chat.api";
import {
  getChatSocket,
  joinChatGroup,
  leaveChatGroup,
  sendGroupMessage,
  deleteGroupMessage,
  sendTypingIndicator,
  sendStopTypingIndicator,
} from "@/lib/socket/chatSocket";
import { RenameGroupModal } from "@/components/chat/RenameGroupModal";
import { ChatMembersPanel } from "@/components/chat/ChatMembersPanel";
import { ChatSidebar, type ChatTab } from "@/components/chat/ChatSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import { DeleteMessageModal } from "@/components/chat/DeleteMessageModal";
import { uploadConversationFiles, deleteUploadedFiles } from "@/services/actions/files";

export default function ChatPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<ChatTab>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [sending, setSending] = useState(false);
  const [onlineProfileIds, setOnlineProfileIds] = useState<Set<string>>(new Set());
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Modals & Action States
  const [renamingChat, setRenamingChat] = useState<ChatItem | null>(null);
  const [deletingMsg, setDeletingMsg] = useState<ChatMessage | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const selectedIdRef = useRef<string | null>(selectedId);
  selectedIdRef.current = selectedId;
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Determine Current User ID from Token or Store
  const currentUserId = useMemo(() => {
    if (user?.id) return user.id;
    const token = tokenStore.get();
    if (token) {
      const decoded = decodeJwt(token);
      return decoded?.userId || decoded?.id || "";
    }
    return "";
  }, [user]);

  // 2. Fetch User's Chat List
  const {
    data: chatsData,
    isLoading: loadingChats,
    refetch: refetchChats,
  } = useGetMyChatsQuery(undefined, {
    pollingInterval: 15000,
    refetchOnMountOrArgChange: true,
  });

  const rawChats: ChatItem[] = chatsData?.result ?? [];

  // Auto-select first chat if none selected
  useEffect(() => {
    if (!selectedId && rawChats.length > 0) {
      setSelectedId(rawChats[0]._id);
    }
  }, [rawChats, selectedId]);

  const selectedChat = useMemo(
    () => rawChats.find((c: ChatItem) => c._id === selectedId) || null,
    [rawChats, selectedId]
  );

  // 3. Fetch Messages for Active Chat
  const { data: messagesData, isFetching: loadingMessages } = useGetChatMessagesQuery(
    { chatId: selectedId! },
    {
      skip: !selectedId,
      refetchOnMountOrArgChange: true,
    }
  );

  const initialMessages: ChatMessage[] = messagesData?.result ?? [];

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    } else if (!loadingMessages) {
      setMessages([]);
    }
  }, [initialMessages, loadingMessages, selectedId]);

  // 4. Socket.IO Lifecycle
  useEffect(() => {
    let activeSocket: Socket | null = null;

    void getChatSocket().then((sock) => {
      if (!sock) return;
      activeSocket = sock;
      socketRef.current = sock;

      // Online status tracking
      sock.on("onlineUser", (payload: { onlineUsers?: string[] } | string[]) => {
        const users = Array.isArray(payload) ? payload : payload?.onlineUsers || [];
        setOnlineProfileIds(new Set(users));
      });

      // Join chat room if already selected
      if (selectedIdRef.current) {
        joinChatGroup(sock, selectedIdRef.current);
      }

      // Incoming messages
      sock.on("group:new-message", (newMsg: ChatMessage) => {
        const chatId = typeof newMsg.chat === "object" ? (newMsg.chat as { _id: string })._id : newMsg.chat;
        if (chatId === selectedIdRef.current) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
        }
        void refetchChats();
      });

      // Message deleted
      sock.on("group:message-deleted", (payload: { _id: string; chat: string }) => {
        if (payload.chat === selectedIdRef.current) {
          setMessages((prev) =>
            prev.map((m) => (m._id === payload._id ? { ...m, is_deleted: true } : m))
          );
        }
      });

      // Typing indicators
      sock.on("group:typing", (payload: { groupId: string; userId: string; name?: string }) => {
        if (payload.groupId === selectedIdRef.current && payload.userId !== currentUserId) {
          setTypingUser(payload.name || "Someone");
        }
      });

      sock.on("group:stop-typing", (payload: { groupId: string; userId: string }) => {
        if (payload.groupId === selectedIdRef.current) {
          setTypingUser("");
        }
      });

      // Group renamed
      sock.on("group:renamed", () => {
        void refetchChats();
      });

      // New worker or client chat created
      sock.on("worker-chat:created", () => {
        void refetchChats();
      });
      sock.on("client-chat:created", () => {
        void refetchChats();
      });
    });

    return () => {
      if (activeSocket) {
        activeSocket.off("onlineUser");
        activeSocket.off("group:new-message");
        activeSocket.off("group:message-deleted");
        activeSocket.off("group:typing");
        activeSocket.off("group:stop-typing");
        activeSocket.off("group:renamed");
        activeSocket.off("worker-chat:created");
        activeSocket.off("client-chat:created");
      }
    };
  }, [currentUserId, refetchChats]);

  // Handle switching active chat room in Socket.IO
  const handleSelectChat = (chat: ChatItem) => {
    if (selectedId === chat._id) return;
    if (socketRef.current && selectedId) {
      leaveChatGroup(socketRef.current, selectedId);
    }
    setSelectedId(chat._id);
    setTypingUser("");
    if (socketRef.current) {
      joinChatGroup(socketRef.current, chat._id);
    }
  };

  const tabCounts = useMemo(
    () => ({
      all: rawChats.length,
      group: rawChats.filter((c: ChatItem) => c.type === "group").length,
      client: rawChats.filter((c: ChatItem) => c.type === "client").length,
      worker: rawChats.filter((c: ChatItem) => c.type === "worker").length,
    }),
    [rawChats]
  );

  const handleTabChange = (tab: ChatTab) => {
    setActiveTab(tab);
    const tabChats = tab === "all" ? rawChats : rawChats.filter((c: ChatItem) => c.type === tab);
    if (tabChats.length > 0 && (!selectedId || !tabChats.some((c: ChatItem) => c._id === selectedId))) {
      handleSelectChat(tabChats[0]);
    }
  };

  // 5. Search & Tab Filtering
  const filteredChats = useMemo(() => {
    let list = rawChats;
    if (activeTab !== "all") {
      list = list.filter((chat: ChatItem) => chat.type === activeTab);
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((chat: ChatItem) => {
      const displayName = (chat.display_name || chat.name || "").toLowerCase();
      const lastMsg = (chat.last_message?.text || "").toLowerCase();
      return displayName.includes(q) || lastMsg.includes(q);
    });
  }, [rawChats, activeTab, query]);

  // 6. Typing handler
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!socketRef.current || !selectedId) return;

    sendTypingIndicator(socketRef.current, selectedId, "Manager");

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (socketRef.current && selectedId) {
        sendStopTypingIndicator(socketRef.current, selectedId);
      }
    }, 2000);
  };

  // 7. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || !selectedId || sending) return;

    setInputText("");
    setSending(true);

    if (socketRef.current) {
      sendStopTypingIndicator(socketRef.current, selectedId);
    }

    try {
      const response = await sendGroupMessage(socketRef.current, {
        groupId: selectedId,
        text: textToSend,
      });

      if (response.success && response.data) {
        const savedMsg = response.data;
        setMessages((prev) => {
          if (prev.some((m) => m._id === savedMsg._id)) return prev;
          return [...prev, savedMsg];
        });
        void refetchChats();
      } else {
        console.warn("Error sending message:", response.message);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  // 8. Attach file
  const handleAttachFile = async (file?: File) => {
    if (!file || !selectedId || sending) return;

    const isImg = file.type.startsWith("image/");
    const isPdf = file.type.includes("pdf");
    const formData = new FormData();
    if (isPdf) {
      formData.append("conversation_pdf", file);
    } else {
      formData.append("conversation_image", file);
    }

    setSending(true);
    try {
      const uploadRes = await uploadConversationFiles(formData);
      if (!uploadRes.success) {
        console.error("Failed to upload conversation file:", uploadRes.error);
        return;
      }

      const uploadedUrl = isPdf
        ? uploadRes.data.pdfs[0] || uploadRes.data.images[0]
        : uploadRes.data.images[0] || uploadRes.data.pdfs[0];

      if (!uploadedUrl) {
        console.error("No URL returned from file upload");
        return;
      }

      const attType: "image" | "pdf" | "file" = isImg ? "image" : isPdf ? "pdf" : "file";
      const attachment: ChatAttachment = { url: uploadedUrl, type: attType };

      const response = await sendGroupMessage(socketRef.current, {
        groupId: selectedId,
        text: `Sent an attachment: ${file.name}`,
        attachments: [attachment],
      });
      if (response.success && response.data) {
        setMessages((prev) => [...prev, response.data!]);
        void refetchChats();
      }
    } catch (err) {
      console.error("Error attaching file:", err);
    } finally {
      setSending(false);
    }
  };

  // 9. Soft-delete message (Manager has override permission)
  const [deleteChatMsgMutation] = useDeleteChatMessageMutation();

  const handleConfirmDelete = async () => {
    if (!deletingMsg) return;
    setActionLoading(true);
    try {
      if (socketRef.current && socketRef.current.connected) {
        await deleteGroupMessage(socketRef.current, deletingMsg._id);
      } else {
        await deleteChatMsgMutation(deletingMsg._id).unwrap();
      }
      setMessages((prev) =>
        prev.map((m) => (m._id === deletingMsg._id ? { ...m, is_deleted: true } : m))
      );

      // Clean up uploaded files from storage if present
      if (deletingMsg.attachments && deletingMsg.attachments.length > 0) {
        const urls = deletingMsg.attachments.map((a) => a.url).filter(Boolean);
        if (urls.length > 0) {
          void deleteUploadedFiles(urls).catch(() => {});
        }
      }

      setDeletingMsg(null);
    } catch (err) {
      console.error("Failed to delete message:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Check if chat is online
  const isChatOnline = useCallback(
    (chat: ChatItem) => {
      if (chat.type === "worker") {
        return Boolean(chat.workers?.[0]?._id && onlineProfileIds.has(chat.workers[0]._id));
      }
      if (chat.type === "client") {
        return Boolean(chat.client?._id && onlineProfileIds.has(chat.client._id));
      }
      return (
        Boolean(chat.client?._id && onlineProfileIds.has(chat.client._id)) ||
        (chat.workers ?? []).some((w) => onlineProfileIds.has(w._id))
      );
    },
    [onlineProfileIds]
  );

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] min-h-[580px] flex-col gap-3">
      {/* Page Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Conversations & Team Chat</h1>
          <p className="text-xs text-slate-500">
            Realtime messaging with clients, cleaning teams, and managers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedChat && (
            <button
              type="button"
              onClick={() => setShowRightPanel((prev) => !prev)}
              className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors cursor-pointer ${
                showRightPanel
                  ? "border-primary bg-sky-50 text-primary"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <MdInfoOutline className="text-base" />
              <span className="hidden sm:inline">Details</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="grid min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)_270px]">
        {/* Left Sidebar: Tabs, Search & Chat List */}
        <ChatSidebar
          activeTab={activeTab}
          tabCounts={tabCounts}
          query={query}
          chats={filteredChats}
          selectedId={selectedId}
          loading={loadingChats}
          onTabChange={handleTabChange}
          onQueryChange={setQuery}
          onSelectChat={handleSelectChat}
          isChatOnline={isChatOnline}
        />

        {/* Center Pane: Active Chat Messages & Composer */}
        <section className="flex min-h-0 flex-col bg-white">
          {selectedChat ? (
            <>
              {/* Active Chat Header */}
              <ChatHeader
                chat={selectedChat}
                isOnline={isChatOnline(selectedChat)}
                onRename={() => setRenamingChat(selectedChat)}
              />

              {/* Messages Scroll Area */}
              <ChatMessageList
                messages={messages}
                loading={loadingMessages}
                currentUserId={currentUserId}
                authUserId={user?.id}
                typingUser={typingUser}
                onRequestDeleteMessage={setDeletingMsg}
              />

              {/* Message Input Bar */}
              <ChatMessageInput
                placeholder={`Message ${selectedChat.display_name || selectedChat.name || ""}...`}
                inputText={inputText}
                sending={sending}
                onInputChange={handleInputChange}
                onSendMessage={handleSendMessage}
                onAttachFile={handleAttachFile}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
              Select a conversation from the left to start messaging.
            </div>
          )}
        </section>

        {/* Right Sidebar: Chat Details & Participants */}
        {showRightPanel && selectedChat && (
          <aside className="hidden min-h-0 overflow-y-auto border-l border-slate-200/90 bg-white xl:block">
            <ChatMembersPanel chat={selectedChat} onlineProfileIds={onlineProfileIds} />
          </aside>
        )}
      </div>

      {/* Rename Group Modal */}
      {renamingChat && (
        <RenameGroupModal
          chatId={renamingChat._id}
          currentName={renamingChat.display_name || renamingChat.name || ""}
          onClose={() => setRenamingChat(null)}
          onRenamed={() => void refetchChats()}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingMsg && (
        <DeleteMessageModal
          loading={actionLoading}
          onClose={() => setDeletingMsg(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      )}
    </div>
  );
}

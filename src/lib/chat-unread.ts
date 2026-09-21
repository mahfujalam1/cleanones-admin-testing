"use client";

import { useCallback, useEffect, useState } from "react";
import { useGetMyChatsQuery, type ChatItem } from "@/redux/api/endpoints/chat.api";

const STORAGE_KEY = "cleanones_chat_seen";
const SEEN_EVENT = "cleanones:chat-seen";

type SeenMap = Record<string, string>;

const readSeen = (): SeenMap => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as SeenMap) : {};
  } catch {
    return {};
  }
};

const lastActivityAt = (chat: ChatItem) =>
  chat.last_message_at || chat.last_message?.createdAt || "";

export const markChatSeen = (chatId: string, at?: string) => {
  if (typeof window === "undefined" || !chatId) return;
  try {
    const seen = readSeen();
    const stamp = at || new Date().toISOString();
    if (seen[chatId] === stamp) return;
    seen[chatId] = stamp;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  } catch {
  }
  window.dispatchEvent(new CustomEvent(SEEN_EVENT));
};

export const countUnseenChats = (chats: ChatItem[], seen: SeenMap) =>
  chats.reduce((total, chat) => {
    const activity = lastActivityAt(chat);
    if (!activity) return total;
    const mark = seen[chat._id];
    return !mark || new Date(activity) > new Date(mark) ? total + 1 : total;
  }, 0);

export function useUnseenChatCount() {
  const { data } = useGetMyChatsQuery({ page: 1, limit: 50 }, { pollingInterval: 60_000 });
  const [seen, setSeen] = useState<SeenMap>({});

  const refresh = useCallback(() => setSeen(readSeen()), []);

  useEffect(() => {
    refresh();
    window.addEventListener(SEEN_EVENT, refresh);

    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SEEN_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return countUnseenChats(data?.result ?? [], seen);
}

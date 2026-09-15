"use client";

import { useCallback, useEffect, useState } from "react";
import { useGetMyChatsQuery, type ChatItem } from "@/redux/api/endpoints/chat.api";

/**
 * The chat API returns no unread counter, so "seen" is tracked in this browser: for every
 * conversation we keep the timestamp of the newest message that was on screen. A conversation
 * counts as unseen while its `last_message_at` is newer than that mark.
 *
 * Consequence worth knowing: the mark is per browser, so opening a chat on a phone does not
 * clear the badge on a desktop. Swap this for the server's own counter the moment the API
 * exposes one — only `useUnseenChatCount` and `markChatSeen` would need to change.
 */
const STORAGE_KEY = "cleanones_chat_seen";
const SEEN_EVENT = "cleanones:chat-seen";

type SeenMap = Record<string, string>;

const readSeen = (): SeenMap => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as SeenMap) : {};
  } catch {
    // Private windows and blocked site data both throw here.
    return {};
  }
};

const lastActivityAt = (chat: ChatItem) =>
  chat.last_message_at || chat.last_message?.createdAt || "";

/** Records that everything currently in `chatId` has been read. */
export const markChatSeen = (chatId: string, at?: string) => {
  if (typeof window === "undefined" || !chatId) return;
  try {
    const seen = readSeen();
    const stamp = at || new Date().toISOString();
    if (seen[chatId] === stamp) return;
    seen[chatId] = stamp;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  } catch {
    // Nothing to persist to — the badge just stays until the list refetches.
  }
  window.dispatchEvent(new CustomEvent(SEEN_EVENT));
};

/** Conversations holding messages this browser has not displayed yet. */
export const countUnseenChats = (chats: ChatItem[], seen: SeenMap) =>
  chats.reduce((total, chat) => {
    const activity = lastActivityAt(chat);
    if (!activity) return total;
    const mark = seen[chat._id];
    return !mark || new Date(activity) > new Date(mark) ? total + 1 : total;
  }, 0);

/**
 * How many conversations have unread messages. Polls because chat delivery runs over a socket
 * the sidebar does not hold open — a minute is frequent enough for a badge and cheap enough to
 * leave running on every page.
 */
export function useUnseenChatCount() {
  const { data } = useGetMyChatsQuery({ page: 1, limit: 50 }, { pollingInterval: 60_000 });
  const [seen, setSeen] = useState<SeenMap>({});

  const refresh = useCallback(() => setSeen(readSeen()), []);

  useEffect(() => {
    refresh();
    window.addEventListener(SEEN_EVENT, refresh);
    // `storage` fires when another tab opens a conversation.
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SEEN_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return countUnseenChats(data?.result ?? [], seen);
}

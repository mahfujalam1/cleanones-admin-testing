import { authenticated, type ActionResult } from "./auth";
export type ChatParticipant = {
  user_id: string;
  name: string;
  role: string;
  profile_picture: string;
};
export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_avatar: string;
  content: string;
  attachment_url: string;
  attachment_type: string;
  status: string;
  read_by: Array<{ user_id: string; read_at: string }>;
  created_at: string;
  updated_at: string;
};
export type Conversation = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  shift_id: string;
  cleaning_plan_id: string;
  participants: ChatParticipant[];
  last_message: {
    text: string;
    sender_id: string;
    sender_name: string;
    timestamp: string;
  } | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
};
export type ParticipantProfile = {
  user_id: string;
  name: string;
  role: string;
  role_label: string;
  email: string;
  phone: string;
  current_location_name: string;
  client_name: string;
  account_status: string;
  is_online: boolean;
  profile_picture: string;
};
const json = (body: unknown) => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const list = (path: string, page = 1, limit = 100) =>
  authenticated<{
    total_count: number;
    page: number;
    limit: number;
    has_more: boolean;
    conversations: Conversation[];
  }>(`${path}?page=${page}&limit=${limit}`, { method: "GET" });
export async function getConversations(
  input: { page?: number; limit?: number; type?: string; search?: string } = {},
) {
  const query = new URLSearchParams({
    page: String(input.page ?? 1),
    limit: String(input.limit ?? 20),
  });
  if (input.type && input.type !== "all") query.set("type", input.type);
  if (input.search) query.set("search", input.search);
  return authenticated<{
    total_count: number;
    page: number;
    limit: number;
    has_more: boolean;
    conversations: Conversation[];
  }>(`/manager/chat/conversations?${query}`, { method: "GET" });
}
export async function getClientConversations(page = 1, limit = 100) {
  return list("/manager/chat/conversations/clients", page, limit);
}
export async function getEmployeeConversations(page = 1, limit = 100) {
  return list("/manager/chat/conversations/employees", page, limit);
}
export async function createConversation(input: {
  type: string;
  target_user_id?: string;
  participant_ids: string[];
  shift_id?: string;
  cleaning_plan_id?: string;
  title: string;
  subtitle: string;
}) {
  return authenticated<Conversation>("/manager/chat/conversations", {
    method: "POST",
    ...json(input),
  });
}
export async function getConversation(id: string) {
  return authenticated<Conversation>(
    `/manager/chat/conversations/${encodeURIComponent(id)}`,
    { method: "GET" },
  );
}
export async function getConversationParticipants(id: string) {
  return authenticated<{
    conversation_id: string;
    conversation_title: string;
    total_participants: number;
    participants: Array<
      ChatParticipant & {
        email: string;
        phone: string;
        position: string;
        company_name: string;
        is_online: boolean;
      }
    >;
  }>(`/manager/chat/conversations/${encodeURIComponent(id)}/participants`, {
    method: "GET",
  });
}
export async function addConversationParticipants(
  id: string,
  userIds: string[],
) {
  return authenticated<unknown>(
    `/manager/chat/conversations/${encodeURIComponent(id)}/participants`,
    { method: "POST", ...json({ user_ids: userIds }) },
  );
}
export async function removeConversationParticipant(
  id: string,
  userId: string,
) {
  return authenticated<unknown>(
    `/manager/chat/conversations/${encodeURIComponent(id)}/participants/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
}
export async function getParticipantProfile(id: string, userId?: string) {
  return authenticated<ParticipantProfile>(
    `/manager/chat/conversations/${encodeURIComponent(id)}/participant-profile${userId ? `?target_user_id=${encodeURIComponent(userId)}` : ""}`,
    { method: "GET" },
  );
}
export async function getMessages(id: string, page = 1, limit = 100) {
  return authenticated<{
    total_count: number;
    page: number;
    limit: number;
    has_more: boolean;
    messages: ChatMessage[];
  }>(
    `/manager/chat/conversations/${encodeURIComponent(id)}/messages?page=${page}&limit=${limit}`,
    { method: "GET" },
  );
}
export async function sendMessage(
  id: string,
  input: {
    content: string;
    attachment_url?: string | null;
    attachment_type?: string | null;
  },
) {
  return authenticated<ChatMessage>(
    `/manager/chat/conversations/${encodeURIComponent(id)}/messages`,
    { method: "POST", ...json(input) },
  );
}
export async function editMessage(id: string, content: string) {
  return authenticated<ChatMessage>(
    `/manager/chat/messages/${encodeURIComponent(id)}`,
    { method: "PATCH", ...json({ content }) },
  );
}
export async function deleteMessage(id: string) {
  return authenticated<string>(
    `/manager/chat/messages/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
export async function markConversationRead(id: string) {
  return authenticated<string>(
    `/manager/chat/conversations/${encodeURIComponent(id)}/read`,
    { method: "POST" },
  );
}
export async function uploadChatAttachment(file: File) {
  const body = new FormData();
  body.append("file", file);
  return authenticated<{
    attachment_url: string;
    attachment_type: string;
    filename: string;
    file_name: string;
  }>("/manager/chat/upload-attachment", { method: "POST", body });
}

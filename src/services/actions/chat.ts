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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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

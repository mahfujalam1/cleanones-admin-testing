import { baseApi } from "../baseApi";
import { tagTypes } from "../../tagTypes";

export type ChatType = "group" | "direct" | "worker" | "client";

export type ChatAttachment = {
  url: string;
  type: "image" | "video" | "pdf" | "file";
};

export type ChatSender = {
  _id: string;
  full_name: string;
  profile_photo?: string | null;
  email?: string;
};

export type ChatMessage = {
  _id: string;
  chat: string;
  sender: string | ChatSender;
  sender_role: "client" | "worker" | "manager";
  text?: string;
  attachments?: ChatAttachment[];
  seen?: boolean;
  is_deleted?: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatItem = {
  _id: string;
  type: ChatType;
  cleaning_plan?: string | null;
  name?: string | null;
  display_name?: string | null;
  client?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    company_name?: string;
    primary_contact_name?: string;
    user?: {
      /** The auth user id - this is what `ChatMessage.sender` refers to. */
      _id?: string;
      full_name?: string;
      profile_photo?: string | null;
    };
  } | null;
  workers?: Array<{
    _id: string;
    name?: string;
    worker_type?: string;
    email?: string;
    phone?: string;
    user?: {
      /** The auth user id - this is what `ChatMessage.sender` refers to. */
      _id?: string;
      full_name?: string;
      profile_photo?: string | null;
    };
  }>;
  participant_key?: string | null;
  last_message?: {
    _id: string;
    text?: string;
    sender?: {
      full_name?: string;
      profile_photo?: string | null;
      email?: string;
    };
    createdAt?: string;
  } | null;
  last_message_at?: string | null;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ChatMembersResponse = {
  client?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    company_name?: string;
    primary_contact_name?: string;
    user?: { _id?: string; full_name?: string; profile_photo?: string | null };
  } | null;
  workers?: Array<{
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    worker_type?: string;
    user?: { _id?: string; full_name?: string; profile_photo?: string | null };
  }>;
  managers?: "all" | string;
  display_name?: string | null;
};

export type MyChatsResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  result: ChatItem[];
};

export type ChatMessagesResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  result: ChatMessage[];
};

export const chatApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMyChats: builder.query<MyChatsResponse, { page?: number; limit?: number } | void>({
      query: (params) => {
        const query = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(params?.limit ?? 50),
        });
        return `/chat/my-chats?${query.toString()}`;
      },
      providesTags: (result) => [
        { type: tagTypes.chat, id: "LIST" },
        ...(result?.result ?? []).map((c) => ({ type: tagTypes.chat, id: c._id })),
      ],
    }),

    getChatMembers: builder.query<ChatMembersResponse, string>({
      query: (id) => `/chat/${encodeURIComponent(id)}/members`,
      providesTags: (_result, _error, id) => [{ type: tagTypes.chat, id: `members-${id}` }],
    }),

    renameGroupChat: builder.mutation<ChatItem, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/chat/${encodeURIComponent(id)}/rename`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: tagTypes.chat, id },
        { type: tagTypes.chat, id: "LIST" },
      ],
    }),

    getChatMessages: builder.query<ChatMessagesResponse, { chatId: string; page?: number; limit?: number }>({
      query: ({ chatId, page = 1, limit = 50 }) =>
        `/chat-message/${encodeURIComponent(chatId)}?page=${page}&limit=${limit}`,
      providesTags: (_result, _error, { chatId }) => [{ type: tagTypes.chat, id: `messages-${chatId}` }],
    }),

    deleteChatMessage: builder.mutation<ChatMessage, string>({
      query: (id) => ({
        url: `/chat-message/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: tagTypes.chat, id: "LIST" }],
    }),
  }),
});

export const {
  useGetMyChatsQuery,
  useGetChatMembersQuery,
  useRenameGroupChatMutation,
  useGetChatMessagesQuery,
  useDeleteChatMessageMutation,
} = chatApi;

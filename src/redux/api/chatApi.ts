import { baseApi } from "./baseApi";
import type {
  Conversation,
  ChatMessage,
  ChatParticipant,
  ParticipantProfile,
} from "@/services/actions/chat";

export const chatApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getConversations: builder.query<
      { total_count: number; page: number; limit: number; has_more: boolean; conversations: Conversation[] },
      { page?: number; limit?: number; type?: string; search?: string } | void
    >({
      query: (params) => {
        const q = new URLSearchParams({
          page: String(params?.page ?? 1),
          limit: String(params?.limit ?? 20),
        });
        if (params?.type && params.type !== "all") q.set("type", params.type);
        if (params?.search) q.set("search", params.search);
        return `/manager/chat/conversations?${q.toString()}`;
      },
      providesTags: ["chat" as never],
    }),
    getClientConversations: builder.query<
      { total_count: number; page: number; limit: number; has_more: boolean; conversations: Conversation[] },
      { page?: number; limit?: number } | void
    >({
      query: (params) => `/manager/chat/conversations/clients?page=${params?.page ?? 1}&limit=${params?.limit ?? 100}`,
      providesTags: ["chat" as never],
    }),
    getEmployeeConversations: builder.query<
      { total_count: number; page: number; limit: number; has_more: boolean; conversations: Conversation[] },
      { page?: number; limit?: number } | void
    >({
      query: (params) => `/manager/chat/conversations/employees?page=${params?.page ?? 1}&limit=${params?.limit ?? 100}`,
      providesTags: ["chat" as never],
    }),
    getConversation: builder.query<Conversation, string>({
      query: (id) => `/manager/chat/conversations/${encodeURIComponent(id)}`,
      providesTags: (_res, _err, id) => [{ type: "chat" as never, id }],
    }),
    getConversationParticipants: builder.query<
      { conversation_id: string; conversation_title: string; total_participants: number; participants: Array<ChatParticipant & { email: string; phone: string; position: string; company_name: string; is_online: boolean }> },
      string
    >({
      query: (id) => `/manager/chat/conversations/${encodeURIComponent(id)}/participants`,
      providesTags: (_res, _err, id) => [{ type: "chat" as never, id: `participants-${id}` }],
    }),
    getParticipantProfile: builder.query<ParticipantProfile, { id: string; userId?: string }>({
      query: ({ id, userId }) => `/manager/chat/conversations/${encodeURIComponent(id)}/participant-profile${userId ? `?target_user_id=${encodeURIComponent(userId)}` : ""}`,
      providesTags: ["chat" as never],
    }),
    getMessages: builder.query<
      { total_count: number; page: number; limit: number; has_more: boolean; messages: ChatMessage[] },
      { id: string; page?: number; limit?: number }
    >({
      query: ({ id, page = 1, limit = 100 }) => `/manager/chat/conversations/${encodeURIComponent(id)}/messages?page=${page}&limit=${limit}`,
      providesTags: (_res, _err, { id }) => [{ type: "chat" as never, id: `messages-${id}` }],
    }),
    createConversation: builder.mutation<
      Conversation,
      { type: string; target_user_id?: string; participant_ids: string[]; shift_id?: string; cleaning_plan_id?: string; title: string; subtitle: string }
    >({
      query: (body) => ({
        url: "/manager/chat/conversations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["chat" as never],
    }),
    addConversationParticipants: builder.mutation<unknown, { id: string; userIds: string[] }>({
      query: ({ id, userIds }) => ({
        url: `/manager/chat/conversations/${encodeURIComponent(id)}/participants`,
        method: "POST",
        body: { user_ids: userIds },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "chat" as never, id: `participants-${id}` }],
    }),
    removeConversationParticipant: builder.mutation<unknown, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `/manager/chat/conversations/${encodeURIComponent(id)}/participants/${encodeURIComponent(userId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "chat" as never, id: `participants-${id}` }],
    }),
    sendMessage: builder.mutation<ChatMessage, { id: string; content: string; attachment_url?: string | null; attachment_type?: string | null }>({
      query: ({ id, ...body }) => ({
        url: `/manager/chat/conversations/${encodeURIComponent(id)}/messages`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "chat" as never, id: `messages-${id}` },
        "chat" as never,
      ],
    }),
    editMessage: builder.mutation<ChatMessage, { id: string; content: string }>({
      query: ({ id, content }) => ({
        url: `/manager/chat/messages/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: ["chat" as never],
    }),
    deleteMessage: builder.mutation<string, string>({
      query: (id) => ({
        url: `/manager/chat/messages/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["chat" as never],
    }),
    markConversationRead: builder.mutation<string, string>({
      query: (id) => ({
        url: `/manager/chat/conversations/${encodeURIComponent(id)}/read`,
        method: "POST",
      }),
      invalidatesTags: ["chat" as never],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetClientConversationsQuery,
  useGetEmployeeConversationsQuery,
  useGetConversationQuery,
  useGetConversationParticipantsQuery,
  useGetParticipantProfileQuery,
  useGetMessagesQuery,
  useCreateConversationMutation,
  useAddConversationParticipantsMutation,
  useRemoveConversationParticipantMutation,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useMarkConversationReadMutation,
} = chatApi;

import { baseApi } from "../baseApi";
import { tagTypes } from "../../tagTypes";

export type NotificationEntityData = {
  entity?: string;
  action?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
  route?: string;
  client_id?: string;
  worker_id?: string;
};

export type NotificationItem = {
  _id: string;
  receiver: string;
  type: string;
  title: string;
  message: string;
  data?: NotificationEntityData;
  isRead: boolean;
  isSeen?: boolean;
  readAt?: string | null;
  seenAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  unreadCount: number;
};

export type NotificationsResponse = {
  meta: NotificationMeta;
  result: NotificationItem[];
};

export type NotificationsQueryParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sort?: string;
  fields?: string;
};

export type SeeNotificationsResponse = {
  acknowledged: boolean;
  matchedCount: number;
  modifiedCount: number;
};

export const notificationsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, NotificationsQueryParams | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.set("page", String(params.page));
        if (params?.limit) q.set("limit", String(params.limit));
        if (params?.searchTerm) q.set("searchTerm", params.searchTerm);
        if (params?.sort) q.set("sort", params.sort);
        if (params?.fields) q.set("fields", params.fields);
        const queryStr = q.toString();
        return `/notification/get-notifications${queryStr ? `?${queryStr}` : ""}`;
      },
      providesTags: (result) => [
        { type: tagTypes.notifications, id: "LIST" },
        ...(result?.result ?? []).map((item) => ({ type: tagTypes.notifications, id: item._id })),
      ],
    }),

    seeNotifications: builder.mutation<SeeNotificationsResponse, void>({
      query: () => ({
        url: "/notification/see-notifications",
        method: "PATCH",
      }),
      invalidatesTags: [{ type: tagTypes.notifications, id: "LIST" }],
    }),

    deleteNotification: builder.mutation<NotificationItem, string>({
      query: (id) => ({
        url: `/notification/delete-notification/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: tagTypes.notifications, id: "LIST" }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useSeeNotificationsMutation,
  useDeleteNotificationMutation,
} = notificationsApi;

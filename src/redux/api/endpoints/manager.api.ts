import { baseApi } from "../baseApi";
import { listQuery, type ListParams, type Paginated } from "../types";
import { tagTypes } from "../../tagTypes";

export type ManagerUser = {
  _id: string;
  email: string;
  phone: string;
  isBlocked: boolean;
  isActive?: boolean;
  profile?: string | null;
  profile_picture?: string | null;
  profile_photo?: string | null;
  profile_image?: string | null;
  profilePhoto?: string | null;
  profileImage?: string | null;
  profilePicture?: string | null;
  photo?: string | null;
  avatar?: string | null;
  image?: string | null;
};

export type CompanyManager = {
  _id: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  profile?: string | null;
  profile_picture?: string | null;
  profile_photo?: string | null;
  profile_image?: string | null;
  profilePhoto?: string | null;
  profileImage?: string | null;
  profilePicture?: string | null;
  photo?: string | null;
  avatar?: string | null;
  image?: string | null;
  isActive?: boolean;
  user?: ManagerUser;
  createdAt?: string;
  updatedAt?: string;
};

export function managerPhoto(mgr?: CompanyManager | null): string | undefined {
  if (!mgr) return undefined;
  const raw =
    mgr.profile_picture ||
    mgr.profile_photo ||
    mgr.profile_image ||
    mgr.profilePhoto ||
    mgr.profileImage ||
    mgr.profilePicture ||
    mgr.photo ||
    mgr.profile ||
    mgr.avatar ||
    mgr.image ||
    mgr.user?.profile_picture ||
    mgr.user?.profile_photo ||
    mgr.user?.profile_image ||
    mgr.user?.profilePhoto ||
    mgr.user?.profileImage ||
    mgr.user?.profilePicture ||
    mgr.user?.photo ||
    mgr.user?.profile ||
    mgr.user?.avatar ||
    mgr.user?.image;
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

export type CreateManagerRequest = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  password: string;
  confirmPassword: string;
};

export type UpdateManagerRequest = {
  id: string;
  name?: string;
  phone?: string;
  address?: string;
};

export type ManagerListParams = ListParams & {
  sort?: string;
};

export const managerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllManagers: builder.query<Paginated<CompanyManager>, ManagerListParams | void>({
      query: (params) => {
        const qs = params ? listQuery(params) : "";
        return `/manager/all-managers${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result?.result
          ? [
              ...result.result.map(({ _id }) => ({ type: tagTypes.manager, id: _id })),
              { type: tagTypes.manager, id: "LIST" },
            ]
          : [{ type: tagTypes.manager, id: "LIST" }],
    }),

    getSingleManager: builder.query<CompanyManager, string>({
      query: (id) => `/manager/single-manager/${id}`,
      providesTags: (_res, _err, id) => [{ type: tagTypes.manager, id }],
    }),

    createManager: builder.mutation<CompanyManager, CreateManagerRequest>({
      query: (body) => ({
        url: "/manager/create-manager",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: tagTypes.manager, id: "LIST" }],
    }),

    updateManager: builder.mutation<CompanyManager, UpdateManagerRequest>({
      query: ({ id, ...body }) => ({
        url: `/manager/update-manager/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: tagTypes.manager, id },
        { type: tagTypes.manager, id: "LIST" },
      ],
    }),

    blockManager: builder.mutation<CompanyManager, string>({
      query: (id) => ({
        url: `/manager/block-manager/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: tagTypes.manager, id },
        { type: tagTypes.manager, id: "LIST" },
      ],
    }),

    unblockManager: builder.mutation<CompanyManager, string>({
      query: (id) => ({
        url: `/manager/unblock-manager/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: tagTypes.manager, id },
        { type: tagTypes.manager, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllManagersQuery,
  useGetSingleManagerQuery,
  useCreateManagerMutation,
  useUpdateManagerMutation,
  useBlockManagerMutation,
  useUnblockManagerMutation,
} = managerApi;

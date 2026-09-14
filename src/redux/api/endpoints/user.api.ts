import { baseApi } from "../baseApi";
import { tagTypes } from "../../tagTypes";
import type { UserProfile, UpdateProfileInput } from "@/services/actions/profile";

export const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, void>({
      query: () => "/user/get-my-profile",
      providesTags: [{ type: tagTypes.profile, id: "ME" }],
    }),
    updateUserProfile: builder.mutation<UserProfile, UpdateProfileInput>({
      query: (body) => ({
        url: "/user/update-profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: tagTypes.profile, id: "ME" }],
    }),
  }),
});

export const { useGetUserProfileQuery, useUpdateUserProfileMutation } = userApi;

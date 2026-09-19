import { baseApi } from "../baseApi";
import { tagTypes } from "../../tagTypes";

export type UserProfile = {
  id?: string;
  _id?: string;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  profile_image?: string;
  profile_photo?: string;
  address?: string;
  dateOfBirth?: string;
  website?: string;
  is_active?: boolean;
  is_verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type UpdateProfileInput = {
  name?: string;
  full_name?: string;
  phone?: string;
  profile_image?: string;
  profile_photo?: string;
  profile_image_file?: File | null;
  address?: string;
  dateOfBirth?: string;
  website?: string;
};

function normaliseProfile(raw: UserProfile | null | undefined): UserProfile {
  const data = raw ?? {};
  return {
    ...data,
    id: data._id || data.id,
    name: data.name || data.full_name,
    full_name: data.name || data.full_name,
    profile_image: data.profile_image || data.profile_photo,
    profile_photo: data.profile_image || data.profile_photo,
  };
}

function profileFields(input: UpdateProfileInput): Record<string, string> {
  const fields: Record<string, string> = {};
  if (input.name !== undefined || input.full_name !== undefined) {
    fields.name = (input.name || input.full_name || "").trim();
  }
  if (input.phone !== undefined) fields.phone = input.phone.trim();
  if (input.address !== undefined) fields.address = input.address.trim();
  if (input.dateOfBirth !== undefined) fields.dateOfBirth = input.dateOfBirth;
  if (input.website !== undefined) fields.website = input.website.trim();
  if (input.profile_image !== undefined || input.profile_photo !== undefined) {
    fields.profile_image = input.profile_image || input.profile_photo || "";
  }
  return fields;
}

function updateProfileRequest(input: UpdateProfileInput) {
  const fields = profileFields(input);
  const file = input.profile_image_file;

  if (!file) {
    return {
      url: "/user/update-profile",
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: fields,
    };
  }

  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (key === "profile_image") continue;
    form.append(key, value);
  }
  form.append("profile_image", file, file.name);
  return { url: "/user/update-profile", method: "PATCH", body: form };
}

export const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, void>({
      query: () => "/user/get-my-profile",
      transformResponse: normaliseProfile,
      providesTags: [{ type: tagTypes.profile, id: "ME" }],
    }),

    updateUserProfile: builder.mutation<UserProfile, UpdateProfileInput>({
      query: updateProfileRequest,
      transformResponse: normaliseProfile,
      invalidatesTags: [{ type: tagTypes.profile, id: "ME" }],
    }),

    uploadProfilePhoto: builder.mutation<
      { profile_photo: string },
      { file: File; currentPhotoUrl?: string }
    >({
      async queryFn({ file, currentPhotoUrl }, _api, _options, fetchWithBQ) {
        const updated = await fetchWithBQ(updateProfileRequest({ profile_image_file: file }));
        if (updated.error) return { error: updated.error };

        const profile = normaliseProfile(updated.data as UserProfile);
        let uploaded = profile.profile_image || profile.profile_photo || "";

        if (!uploaded) {
          const refreshed = await fetchWithBQ("/user/get-my-profile");
          if (!refreshed.error) {
            const reread = normaliseProfile(refreshed.data as UserProfile);
            uploaded = reread.profile_image || reread.profile_photo || "";
          }
        }

        if (!uploaded) {
          return {
            error: {
              status: 502,
              data: { message: "The server did not return the stored image URL" },
            },
          };
        }

        if (currentPhotoUrl?.startsWith("http") && currentPhotoUrl !== uploaded) {
          await fetchWithBQ({
            url: "/file/delete-files",
            method: "POST",
            body: { files: [currentPhotoUrl] },
          });
        }

        return { data: { profile_photo: uploaded } };
      },
      invalidatesTags: [{ type: tagTypes.profile, id: "ME" }],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUploadProfilePhotoMutation,
} = userApi;

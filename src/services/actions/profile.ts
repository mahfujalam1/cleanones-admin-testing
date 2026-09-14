import { authenticated, type ActionResult } from "./auth";
import { uploadConversationFiles, deleteUploadedFiles } from "./files";

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
  address?: string;
  dateOfBirth?: string;
  website?: string;
};

/**
 * GET /user/get-my-profile
 * Retrieves authenticated user profile.
 */
export async function getMyProfile(): Promise<ActionResult<UserProfile>> {
  const result = await authenticated<any>("/user/get-my-profile", {
    method: "GET",
  });

  if (result.success) {
    const data = (result.data as any)?.data ?? result.data;
    if (data && typeof data === "object") {
      return {
        success: true,
        data: {
          ...data,
          id: data._id || data.id,
          name: data.name || data.full_name,
          full_name: data.name || data.full_name,
          profile_image: data.profile_image || data.profile_photo,
          profile_photo: data.profile_image || data.profile_photo,
        },
      };
    }
  }

  return result;
}

/**
 * PATCH /user/update-profile
 * Accepts { name, phone, profile_image, address, dateOfBirth }.
 */
export async function updateUserProfile(
  input: UpdateProfileInput
): Promise<ActionResult<UserProfile>> {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined || input.full_name !== undefined) {
    payload.name = (input.name || input.full_name || "").trim();
  }
  if (input.phone !== undefined) payload.phone = input.phone.trim();
  if (input.address !== undefined) payload.address = input.address.trim();
  if (input.dateOfBirth !== undefined) payload.dateOfBirth = input.dateOfBirth;
  if (input.profile_image !== undefined || input.profile_photo !== undefined) {
    payload.profile_image = input.profile_image || input.profile_photo;
  }
  if (input.website !== undefined) payload.website = input.website.trim();

  const result = await authenticated<any>("/user/update-profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (result.success) {
    const data = (result.data as any)?.data ?? result.data;
    return {
      success: true,
      data: {
        ...data,
        id: data?._id || data?.id,
        name: data?.name || data?.full_name,
        full_name: data?.name || data?.full_name,
        profile_image: data?.profile_image || data?.profile_photo,
        profile_photo: data?.profile_image || data?.profile_photo,
      },
    };
  }

  return result;
}

/**
 * Uploads a profile image via /file/upload-conversation-files,
 * and updates the user profile with the returned image URL via /user/update-profile.
 */
export async function uploadProfilePhoto(
  file: File,
  currentPhotoUrl?: string
): Promise<ActionResult<{ profile_photo: string }>> {
  const formData = new FormData();
  formData.append("conversation_image", file);

  const uploadResult = await uploadConversationFiles(formData);
  if (!uploadResult.success) {
    return {
      success: false,
      error: uploadResult.error || "Failed to upload image file",
      status: uploadResult.status,
    };
  }

  const uploadedUrl = uploadResult.data.images[0];
  if (!uploadedUrl) {
    return {
      success: false,
      error: "No image URL returned from upload",
    };
  }

  // Update profile with the new image URL
  const updateResult = await updateUserProfile({ profile_image: uploadedUrl });
  if (!updateResult.success) {
    return {
      success: false,
      error: updateResult.error || "Failed to update profile with new photo",
      status: updateResult.status,
    };
  }

  // If there was an old photo on CDN, delete in background
  if (currentPhotoUrl && currentPhotoUrl.startsWith("http") && currentPhotoUrl !== uploadedUrl) {
    void deleteUploadedFiles([currentPhotoUrl]).catch(() => {});
  }

  return {
    success: true,
    data: { profile_photo: uploadedUrl },
  };
}

// Backward-compatible exports
export type ProfileDetails = UserProfile;
export const getProfile = getMyProfile;
export const updateProfileDetails = updateUserProfile;
export const updateProfilePhoto = (photo: File) => uploadProfilePhoto(photo);

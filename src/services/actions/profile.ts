import { authenticated, type ActionResult } from "./auth";
import { deleteUploadedFiles } from "./files";

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
  /** Raw image file — sent as multipart so the API stores it directly. */
  profile_image_file?: File | null;
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
/** Normalises whatever shape the API returns into a `UserProfile`. */
function normaliseProfile(raw: any): UserProfile {
  const data = raw?.data ?? raw;
  return {
    ...data,
    id: data?._id || data?.id,
    name: data?.name || data?.full_name,
    full_name: data?.name || data?.full_name,
    profile_image: data?.profile_image || data?.profile_photo,
    profile_photo: data?.profile_image || data?.profile_photo,
  };
}

/** Collects the editable fields into a plain object, skipping anything untouched. */
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

/**
 * PATCH /user/update-profile
 * Sends JSON for text-only edits, and multipart (`profile_image` file part) when a
 * new photo is attached, so the picture is uploaded straight through this endpoint.
 */
export async function updateUserProfile(
  input: UpdateProfileInput
): Promise<ActionResult<UserProfile>> {
  const fields = profileFields(input);
  const file = input.profile_image_file;

  let body: BodyInit;
  let headers: Record<string, string> | undefined;

  if (file) {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (key === "profile_image") continue; // the file part replaces the URL
      form.append(key, value);
    }
    form.append("profile_image", file, file.name);
    body = form;
  } else {
    headers = { "Content-Type": "application/json" };
    body = JSON.stringify(fields);
  }

  const result = await authenticated<any>("/user/update-profile", {
    method: "PATCH",
    ...(headers ? { headers } : {}),
    body,
  });

  if (result.success) {
    return { success: true, data: normaliseProfile(result.data) };
  }

  return result;
}

/**
 * Sends the picture as the `profile_image` part of PATCH /user/update-profile. That single
 * request both stores the file and updates the user, so no separate file-upload endpoint
 * is involved.
 */
export async function uploadProfilePhoto(
  file: File,
  currentPhotoUrl?: string
): Promise<ActionResult<{ profile_photo: string }>> {
  const result = await updateUserProfile({ profile_image_file: file });
  if (!result.success) {
    return { success: false, error: result.error, status: result.status };
  }

  let uploaded = result.data.profile_image || result.data.profile_photo || "";

  // Some responses echo the user without the stored URL; read it back rather than
  // leaving the avatar on its local preview.
  if (!uploaded) {
    const refreshed = await getMyProfile();
    if (refreshed.success) {
      uploaded = refreshed.data.profile_image || refreshed.data.profile_photo || "";
    }
  }

  if (!uploaded) {
    return { success: false, error: "The server did not return the stored image URL" };
  }

  cleanUpOldPhoto(currentPhotoUrl, uploaded);

  return { success: true, data: { profile_photo: uploaded } };
}

/** Removes the replaced photo from the CDN, best effort. */
function cleanUpOldPhoto(currentPhotoUrl: string | undefined, nextUrl: string) {
  if (currentPhotoUrl && currentPhotoUrl.startsWith("http") && currentPhotoUrl !== nextUrl) {
    void deleteUploadedFiles([currentPhotoUrl]).catch(() => {});
  }
}

// Backward-compatible exports
export type ProfileDetails = UserProfile;
export const getProfile = getMyProfile;
export const updateProfileDetails = updateUserProfile;
export const updateProfilePhoto = (photo: File) => uploadProfilePhoto(photo);

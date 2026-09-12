import { authenticated, type ActionResult } from "./auth";

export type ProfileDetails = { full_name?: string | null; profile_photo?: string | null; name?: string | null };
export async function getProfile(): Promise<ActionResult<ProfileDetails | string>> { return authenticated<ProfileDetails | string>("/profile/", { method: "GET" }); }
export async function createProfile(formData: FormData) { return authenticated<ProfileDetails | string>("/profile/", { method: "POST", body: formData }); }
export async function updateProfileDetails(formData: FormData) { return authenticated<ProfileDetails | string>("/profile/", { method: "PATCH", body: formData }); }
export type ProfilePhotoResult = { message?: string; profile_photo?: string };
/** PATCH /profile/ takes multipart form data; both fields are optional, so the photo can
 *  be replaced on its own without touching the name. */
export async function updateProfilePhoto(photo: File, fullName?: string) {
    const data = new FormData();
    data.append("profile_photo", photo);
    if (fullName) data.append("full_name", fullName);
    return authenticated<ProfilePhotoResult>("/profile/", { method: "PATCH", body: data });
}

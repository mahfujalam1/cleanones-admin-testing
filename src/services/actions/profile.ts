"use server";

import { authenticated, type ActionResult } from "./auth";

export type ProfileDetails = { full_name?: string | null; profile_photo?: string | null; name?: string | null };
export async function getProfile(): Promise<ActionResult<ProfileDetails | string>> { return authenticated<ProfileDetails | string>("/profile/", { method: "GET" }); }
export async function createProfile(formData: FormData) { return authenticated<ProfileDetails | string>("/profile/", { method: "POST", body: formData }); }
export async function updateProfileDetails(formData: FormData) { return authenticated<ProfileDetails | string>("/profile/", { method: "PATCH", body: formData }); }

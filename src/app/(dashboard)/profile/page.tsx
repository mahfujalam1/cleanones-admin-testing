"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  MdCheckCircle,
  MdEmail,
  MdLanguage,
  MdLocationOn,
  MdOutlinePerson,
  MdPhone,
  MdPhotoCamera,
  MdSave,
  MdShield,
  MdVerifiedUser,
} from "react-icons/md";
import { getManagerProfile, updateManagerProfile, type ManagerProfile } from "@/services/actions/manager";
import { updateProfilePhoto } from "@/services/actions/profile";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/auth.slice";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);

  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    website: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Keeps the header avatar and the topbar in step after a photo or name change.
  const syncUser = useCallback((source: { id: string; full_name?: string; name?: string; email: string; role?: string; profile_photo?: string }) => {
    const nextUser = {
      id: source.id,
      name: source.full_name || source.name || "User",
      email: source.email,
      role: (source.role?.toUpperCase() === "SUPER_ADMIN" ? "SUPER_ADMIN" : "MANAGER") as "SUPER_ADMIN" | "MANAGER",
      profilePhoto: source.profile_photo,
    };
    dispatch(setUser(nextUser));
    try {
      localStorage.setItem("cleanones-dashboard-user", JSON.stringify(nextUser));
    } catch { }
  }, [dispatch]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Choose an image file for the profile photo." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Profile photo must be smaller than 5MB." });
      return;
    }

    // Show the picked image straight away, then swap in the stored URL once it uploads.
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setUploadingPhoto(true);
    setMessage(null);

    const result = await updateProfilePhoto(file);
    setUploadingPhoto(false);

    if (!result.success) {
      URL.revokeObjectURL(preview);
      setPhotoPreview("");
      setMessage({ type: "error", text: result.error || "Failed to upload profile photo" });
      return;
    }

    const uploaded = typeof result.data === "object" && result.data ? result.data.profile_photo : "";
    if (uploaded) {
      setProfile((current) => (current ? { ...current, profile_photo: uploaded } : current));
      if (profile) syncUser({ ...profile, profile_photo: uploaded });
      URL.revokeObjectURL(preview);
      setPhotoPreview("");
    } else {
      // No URL came back, so re-read the profile rather than guess.
      const refreshed = await getManagerProfile();
      if (refreshed.success && refreshed.data) {
        setProfile(refreshed.data);
        syncUser(refreshed.data);
        URL.revokeObjectURL(preview);
        setPhotoPreview("");
      }
    }
    setMessage({ type: "success", text: "Profile photo updated successfully!" });
  };

  useEffect(() => {
    let isMounted = true;

    void getManagerProfile().then((result) => {
      if (!isMounted) return;
      setLoading(false);
      if (result.success && result.data) {
        setProfile(result.data);
        setFormData({
          full_name: result.data.full_name || result.data.name || "",
          phone: result.data.phone || "",
          address: result.data.address || "",
          website: result.data.website || "",
        });

        syncUser(result.data);
      } else if (!result.success) {
        setMessage({ type: "error", text: result.error || "Failed to load profile information" });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [syncUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      setMessage({ type: "error", text: "Full name is required" });
      return;
    }

    setSaving(true);
    setMessage(null);

    const result = await updateManagerProfile({
      full_name: formData.full_name,
      phone: formData.phone,
      address: formData.address,
      website: formData.website,
      is_active: profile?.is_active ?? true,
    });

    setSaving(false);

    if (!result.success) {
      setMessage({ type: "error", text: result.error || "Failed to update profile" });
      return;
    }

    setProfile(result.data);
    setFormData({
      full_name: result.data.full_name || result.data.name || "",
      phone: result.data.phone || "",
      address: result.data.address || "",
      website: result.data.website || "",
    });

    syncUser(result.data);

    setMessage({ type: "success", text: "Profile information updated successfully!" });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4">
        <DetailSkeleton blocks={6} />
      </div>
    );
  }

  const roleTitle = (profile?.role || authUser?.role || "Manager")
    .toString()
    .replace(/_/g, " ")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Profile Header Banner */}
      <div className="dashboard-card overflow-hidden p-0">
        <div className="h-32 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] px-6 pt-6" />
        <div className="relative px-6 pb-6 pt-0">
          <div className="-mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="relative h-24 w-24 shrink-0">
                <div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
                  {/* contain, not cover: a portrait or landscape upload keeps its whole
                      frame instead of having its edges cropped away by the circle. */}
                  <img
                    src={photoPreview || profile?.profile_photo || authUser?.profilePhoto || "/avatar-placeholder.svg"}
                    alt={profile?.full_name || "Profile Photo"}
                    className="h-full w-full object-contain object-center"
                  />
                </div>
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/45">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  </div>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => void handlePhotoChange(event)}
                />
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => photoInputRef.current?.click()}
                  title="Change profile photo"
                  aria-label="Change profile photo"
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#0ea5e9] text-white shadow transition-colors hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  <MdPhotoCamera className="text-base" />
                </button>
              </div>
              <div className="mt-16">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {profile?.full_name || profile?.name || authUser?.name || "Admin User"}
                </h1>
                <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <MdEmail className="text-slate-400" />
                  {profile?.email || authUser?.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 border border-sky-200">
                <MdShield className="text-sm" />
                {roleTitle}
              </span>
              {profile?.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <MdVerifiedUser className="text-sm" />
                  Verified
                </span>
              )}
              {profile?.is_active && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <MdCheckCircle className="text-sm" />
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Alert */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-lg border p-4 text-sm font-medium ${message.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-800"
            }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Details (Left 2 cols) */}
        <div className="dashboard-card space-y-5 p-6 md:col-span-2">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 border-b border-gray-100 pb-3">
            <MdOutlinePerson className="text-xl text-[#0ea5e9]" />
            Personal Information
          </h2>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Full Name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                className="h-10 w-full rounded border border-gray-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]"
                placeholder="Enter full name"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Email Address</span>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  placeholder="Enter email address"
                  className="h-10 w-full rounded border border-gray-200 bg-gray-50 px-3.5 pl-9 text-sm text-slate-500 shadow-sm outline-none cursor-not-allowed"
                />
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <span className="mt-1 block text-[11px] text-slate-400">Email address cannot be changed directly</span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Phone Number</span>
              <div className="relative">
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="h-10 w-full rounded border border-gray-200 bg-white px-3.5 pl-9 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]"
                  placeholder="Enter phone number"
                />
                <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Address</span>
              <div className="relative">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  className="h-10 w-full rounded border border-gray-200 bg-white px-3.5 pl-9 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]"
                  placeholder="Street address, city, country"
                />
                <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Website</span>
              <div className="relative">
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  className="h-10 w-full rounded border border-gray-200 bg-white px-3.5 pl-9 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9]"
                  placeholder="www.example.com"
                />
                <MdLanguage className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded bg-[#0ea5e9] px-5 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-[#0284c7] disabled:opacity-60 cursor-pointer"
            >
              <MdSave className="text-lg" />
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </div>
        </div>

        {/* Sidebar Info Card (Right 1 col) */}
        <div className="space-y-6">
          <div className="dashboard-card space-y-4 p-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-gray-100 pb-2">
              Account Overview
            </h3>

            <div className="space-y-3 text-xs">


              <div>
                <span className="block text-slate-400">Role</span>
                <span className="font-semibold text-slate-800">{roleTitle}</span>
              </div>



              {profile?.created_at && (
                <div>
                  <span className="block text-slate-400">Account Created</span>
                  <span className="text-slate-700">{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              )}

              {profile?.updated_at && (
                <div>
                  <span className="block text-slate-400">Last Profile Update</span>
                  <span className="text-slate-700">{new Date(profile.updated_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

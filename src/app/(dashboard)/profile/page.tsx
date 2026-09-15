"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  MdCheckCircle,
  MdEmail,
  MdEvent,
  MdOutlinePerson,
  MdPhone,
  MdPhotoCamera,
  MdSave,
  MdShield,
  MdUpdate,
  MdVerifiedUser,
} from "react-icons/md";
import { DatePicker, todayIso } from "@/components/ui/date-picker";
import {
  getMyProfile,
  updateUserProfile,
  uploadProfilePhoto,
  type UserProfile,
} from "@/services/actions/profile";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toDashboardRole } from "@/lib/auth/session";
import { setUser } from "@/redux/slices/auth.slice";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    dateOfBirth: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  // `syncUser` dispatches `setUser`, so reading `authUser` from the closure would give the
  // callback a new identity on every dispatch and re-run the effect below forever. The ref
  // keeps the latest values readable while the callback identity stays stable.
  const authUserRef = useRef(authUser);
  useEffect(() => {
    authUserRef.current = authUser;
  }, [authUser]);

  // Keeps the header avatar and the topbar in step after a photo or name change.
  const syncUser = useCallback(
    (source: { id?: string; _id?: string; full_name?: string; name?: string; email?: string; role?: string; profile_photo?: string; profile_image?: string }) => {
      const current = authUserRef.current;
      const nextUser = {
        id: source.id || source._id || current?.id || "",
        name: source.name || source.full_name || current?.name || "User",
        email: source.email || current?.email || "",
        role: toDashboardRole(source.role) ?? current?.role ?? "MANAGER",
        profilePhoto: source.profile_image || source.profile_photo || current?.profilePhoto,
      };
      dispatch(setUser(nextUser));
      try {
        localStorage.setItem("cleanones-dashboard-user", JSON.stringify(nextUser));
      } catch {}
    },
    [dispatch]
  );

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Choose an image file for the profile photo." });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setMessage({ type: "error", text: "Profile photo must be smaller than 50MB." });
      return;
    }

    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    setUploadingPhoto(true);
    setMessage(null);

    const result = await uploadProfilePhoto(
      file,
      profile?.profile_image || profile?.profile_photo || authUser?.profilePhoto
    );
    setUploadingPhoto(false);

    if (!result.success) {
      URL.revokeObjectURL(preview);
      setPhotoPreview("");
      setMessage({ type: "error", text: result.error || "Failed to upload profile photo" });
      return;
    }

    const uploaded = result.data?.profile_photo || "";
    if (uploaded) {
      setProfile((current) =>
        current ? { ...current, profile_image: uploaded, profile_photo: uploaded } : current
      );
      if (profile) {
        syncUser({ ...profile, profile_image: uploaded, profile_photo: uploaded });
      } else {
        syncUser({ profile_image: uploaded, profile_photo: uploaded });
      }
      URL.revokeObjectURL(preview);
      setPhotoPreview("");
    } else {
      const refreshed = await getMyProfile();
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

    void getMyProfile().then((result) => {
      if (!isMounted) return;
      setLoading(false);
      if (result.success && result.data) {
        const d = result.data;
        setProfile(d);
        setFormData({
          full_name: (d.name || d.full_name || "") as string,
          phone: (d.phone || "") as string,
          dateOfBirth: d.dateOfBirth ? String(d.dateOfBirth).slice(0, 10) : "",
        });

        syncUser(d);
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

    const result = await updateUserProfile({
      name: formData.full_name,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth || undefined,
    });

    setSaving(false);

    if (!result.success) {
      setMessage({ type: "error", text: result.error || "Failed to update profile" });
      return;
    }

    const updated = result.data;
    setProfile(updated);
    setFormData({
      full_name: (updated.name || updated.full_name || "") as string,
      phone: (updated.phone || "") as string,
      dateOfBirth: updated.dateOfBirth ? String(updated.dateOfBirth).slice(0, 10) : "",
    });

    syncUser(updated);

    setMessage({ type: "success", text: "Profile information updated successfully!" });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4">
        <DetailSkeleton blocks={6} />
      </div>
    );
  }

  const isDirty = profile
    ? formData.full_name !== (profile.name || profile.full_name || "") ||
      formData.phone !== (profile.phone || "") ||
      formData.dateOfBirth !== (profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : "")
    : false;

  const roleTitle = (profile?.role || authUser?.role || "Manager")
    .toString()
    .replace(/_/g, " ")
    .toUpperCase();

  const currentAvatar =
    photoPreview ||
    profile?.profile_image ||
    profile?.profile_photo ||
    authUser?.profilePhoto ||
    "/avatar-placeholder.svg";

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Identity Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="relative h-20 w-20 shrink-0">
            <div className="h-full w-full overflow-hidden rounded-full border border-slate-200 bg-slate-50">
              <img
                src={currentAvatar}
                alt={profile?.name || profile?.full_name || "Profile Photo"}
                className="h-full w-full object-cover object-center"
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
              className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-sm transition-colors hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MdPhotoCamera className="text-sm" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold leading-tight text-slate-900">
              {profile?.name || profile?.full_name || authUser?.name || "Admin User"}
            </h1>
            <p className="mt-0.5 flex items-center justify-center gap-1.5 text-xs text-slate-500 sm:justify-start">
              <MdEmail className="text-sm text-slate-400" />
              <span className="truncate">{profile?.email || authUser?.email}</span>
            </p>

            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                <MdShield className="text-xs" />
                {roleTitle}
              </span>
              {profile?.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <MdVerifiedUser className="text-xs" />
                  Verified
                </span>
              )}
              {profile?.is_active && (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <MdCheckCircle className="text-xs" />
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
          className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="shrink-0 cursor-pointer rounded px-2 py-1 text-xs font-semibold underline opacity-80 transition-opacity hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Details (Left 2 cols) */}
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs md:col-span-2">
          <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
            <MdOutlinePerson className="text-lg text-primary" />
            Personal Information
          </h2>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Enter full name"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Email Address</span>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={profile?.email || authUser?.email || ""}
                  placeholder="Enter email address"
                  className="h-11 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3.5 pl-10 text-sm text-slate-500 outline-none"
                />
                <MdEmail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-slate-400" />
              </div>
              <span className="mt-1 block text-[11px] text-slate-400">Email address cannot be changed directly</span>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">Phone Number</span>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 pl-10 text-sm text-slate-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter phone number"
                  />
                  <MdPhone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-slate-400" />
                </div>
              </label>

              <div>
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">Date of Birth</span>
                <DatePicker
                  value={formData.dateOfBirth}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, dateOfBirth: value }))}
                  placeholder="Select date of birth"
                  // Nobody was born tomorrow.
                  max={todayIso()}
                  clearable
                />
              </div>
            </div>

          </div>

          <div className="flex flex-wrap items-center border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#0284c7] focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdSave className="text-lg" />
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </button>
            {!isDirty && !saving && (
              <span className="ml-3 text-xs text-slate-400">No changes to save</span>
            )}
          </div>
        </div>

        {/* Sidebar Info Card (Right 1 col) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
              Account Overview
            </h3>

            <dl className="mt-3 divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="flex items-center gap-1.5 text-slate-400">
                  <MdShield className="text-sm" /> Role
                </dt>
                <dd className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">{roleTitle}</dd>
              </div>

              {(profile?.created_at || (profile as any)?.createdAt) && (
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="flex items-center gap-1.5 text-slate-400">
                    <MdEvent className="text-sm" /> Account created
                  </dt>
                  <dd className="text-right font-medium text-slate-700">
                    {new Date(String(profile?.created_at || (profile as any)?.createdAt)).toLocaleDateString()}
                  </dd>
                </div>
              )}

              {(profile?.updated_at || (profile as any)?.updatedAt) && (
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="flex items-center gap-1.5 text-slate-400">
                    <MdUpdate className="text-sm" /> Last update
                  </dt>
                  <dd className="text-right font-medium text-slate-700">
                    {new Date(String(profile?.updated_at || (profile as any)?.updatedAt)).toLocaleDateString()}{" "}
                    <span className="text-slate-400">
                      {new Date(String(profile?.updated_at || (profile as any)?.updatedAt)).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </form>
    </div>
  );
}

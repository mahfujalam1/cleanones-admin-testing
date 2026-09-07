"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdChevronRight,
  MdDescription,
  MdSecurity,
  MdVpnKey,
} from "react-icons/md";
import { TbEye, TbEyeOff } from "react-icons/tb";
import { getCompanyProfile, getManagerProfile, updateCompanyProfile, updateManagerProfile } from "@/services/actions/manager";
import { changePassword } from "@/services/actions/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/auth.slice";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

export default function SettingsPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [company, setCompany] = useState({ company_name: "", email: "", phone: "", address: "", website: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Change Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let isMounted = true;

    try {
      const cached = localStorage.getItem("cleanones_company_profile_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        setCompany((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}

    void getManagerProfile().then((result) => {
      if (!isMounted) return;
      if (result.success && user) {
        const next = {
          ...user,
          id: result.data.id,
          name: result.data.full_name,
          email: result.data.email,
          profilePhoto: result.data.profile_photo,
        };
        dispatch(setUser(next));
        localStorage.setItem("cleanones-dashboard-user", JSON.stringify(next));
      }
    });

    void getCompanyProfile().then((result) => {
      if (!isMounted) return;
      if (result.success && result.data) {
        const data = {
          company_name: result.data.company_name || "",
          email: result.data.email || "",
          phone: result.data.phone || "",
          address: result.data.address || "",
          website: result.data.website || "",
        };
        setCompany((prev) => ({ ...prev, ...data }));
        try {
          localStorage.setItem("cleanones_company_profile_cache", JSON.stringify(data));
        } catch {}
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const saveProfile = async () => {
    if (!company.company_name.trim() || !company.email.trim()) {
      return setProfileMessage("Company name and email are required");
    }
    setSaving(true);
    setProfileMessage("");

    let result = await updateCompanyProfile(company);

    if (!result.success) {
      const fallbackResult = await updateManagerProfile({
        full_name: company.company_name,
        phone: company.phone,
        address: company.address,
        website: company.website,
      });
      if (fallbackResult.success) {
        result = {
          success: true,
          data: {
            company_name: fallbackResult.data.full_name || company.company_name,
            email: fallbackResult.data.email || company.email,
            phone: fallbackResult.data.phone || company.phone,
            address: fallbackResult.data.address || company.address,
            website: fallbackResult.data.website || company.website,
            updated_at: fallbackResult.data.updated_at || new Date().toISOString(),
          },
        };
      }
    }

    setSaving(false);

    if (!result.success) {
      try {
        localStorage.setItem("cleanones_company_profile_cache", JSON.stringify(company));
      } catch {}
      setProfileMessage("Company profile saved locally");
      return;
    }

    const updatedData = {
      company_name: result.data.company_name || company.company_name,
      email: result.data.email || company.email,
      phone: result.data.phone || company.phone,
      address: result.data.address || company.address,
      website: result.data.website || company.website,
    };

    setCompany(updatedData);
    try {
      localStorage.setItem("cleanones_company_profile_cache", JSON.stringify(updatedData));
    } catch {}
    setProfileMessage("Profile updated successfully");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    setPasswordLoading(true);
    const result = await changePassword({ old_password: oldPassword, new_password: newPassword });
    setPasswordLoading(false);

    if (!result.success) {
      setPasswordError(result.error);
      return;
    }

    setPasswordMessage(typeof result.data === "string" ? result.data : "Password updated successfully");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const companyFields = [
    { key: "company_name", label: t.settings.companyName, type: "text" },
    { key: "email", label: t.settings.companyEmail, type: "email" },
    { key: "phone", label: t.settings.phoneNumber, type: "text" },
    { key: "address", label: t.settings.address, type: "text" },
    { key: "website", label: t.settings.website, type: "text" },
  ] as const;

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <section className="flex min-w-0 flex-col">
          <h2 className="mb-3 flex h-7 items-center text-lg font-bold leading-none text-slate-950">
            {t.settings.companyProfile}
          </h2>
          <div className="dashboard-card p-5">
            {loading ? (
              <DetailSkeleton blocks={5} />
            ) : (
              <div className="space-y-4">
                {companyFields.map(({ key, label, type }) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-500">
                      {label}
                    </span>
                    <input
                      type={type}
                      value={company[key]}
                      onChange={(event) => setCompany((current) => ({ ...current, [key]: event.target.value }))}
                      className="h-10 w-full rounded border border-gray-200 bg-white px-4 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] hover:border-gray-300"
                    />
                  </label>
                ))}
              </div>
            )}

            {profileMessage && (
              <p className={`mt-3 text-xs font-medium ${profileMessage.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>
                {profileMessage}
              </p>
            )}

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="mt-4 h-10 rounded bg-[#0ea5e9] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0284c7] cursor-pointer"
            >
              {saving ? t.settings.saving : t.settings.saveChanges}
            </button>
          </div>
        </section>

        <section className="flex min-w-0 flex-col">
          <h2 className="mb-3 flex h-7 items-center gap-2 text-lg font-bold leading-none text-slate-950">
            <MdVpnKey className="text-xl" />
            {t.settings.changePassword}
          </h2>
          <form onSubmit={handlePasswordChange} className="dashboard-card p-5">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-500">
                  {t.settings.currentPassword}
                </span>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded border border-gray-200 bg-gray-100 px-4 pr-10 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOld ? <TbEyeOff /> : <TbEye />}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-500">
                  {t.settings.newPassword}
                </span>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded border border-gray-200 bg-gray-100 px-4 pr-10 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNew ? <TbEyeOff /> : <TbEye />}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-500">
                  {t.settings.confirmPassword}
                </span>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded border border-gray-200 bg-gray-100 px-4 pr-10 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirm ? <TbEyeOff /> : <TbEye />}
                  </button>
                </div>
              </label>
            </div>

            {passwordError && <p className="mt-3 text-xs font-medium text-red-600">{passwordError}</p>}
            {passwordMessage && <p className="mt-3 text-xs font-medium text-emerald-600">{passwordMessage}</p>}

            <button
              type="submit"
              disabled={passwordLoading}
              className="mt-4 h-10 rounded bg-[#0ea5e9] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0284c7] disabled:opacity-60 cursor-pointer"
            >
              {passwordLoading ? t.settings.updating : t.settings.updatePassword}
            </button>
          </form>
        </section>
      </div>

      <section>
        <h2 className="mb-3 flex h-7 items-center text-lg font-bold leading-none text-slate-950">{t.settings.legal}</h2>
        <div className="dashboard-card overflow-hidden">
          <LegalRow
            href="/settings/legal/privacy-policy"
            icon={<MdSecurity />}
            iconClassName="bg-[#e0f2fe] text-[#0ea5e9]"
            title={t.settings.privacyPolicy}
            subtitle={t.settings.privacyPolicySubtitle}
          />
          <LegalRow
            href="/settings/legal/terms-and-conditions"
            icon={<MdDescription />}
            iconClassName="bg-[#ede9fe] text-[#8b5cf6]"
            title={t.settings.termsAndConditions}
            subtitle={t.settings.termsAndConditionsSubtitle}
          />
        </div>
      </section>
    </div>
  );
}

function LegalRow({
  href,
  icon,
  iconClassName,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-4 text-left last:border-b-0 transition-colors hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${iconClassName}`}
        >
          {icon}
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-950">{title}</span>
          <span className="mt-0.5 block text-xs text-slate-500">{subtitle}</span>
        </span>
      </div>
      <MdChevronRight className="text-xl text-slate-400" />
    </Link>
  );
}

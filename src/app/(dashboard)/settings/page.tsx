"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MdChevronRight,
  MdDescription,
  MdOutlineRemoveRedEye,
  MdSecurity,
  MdVpnKey,
} from "react-icons/md";
import { getCompanyProfile, getManagerProfile, updateCompanyProfile } from "@/services/actions/manager";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/auth.slice";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [company, setCompany] = useState({ company_name: "", email: "", phone: "", address: "", website: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getManagerProfile().then((result) => { if (result.success && user) { const next = { ...user, id: result.data.id, name: result.data.full_name, email: result.data.email, profilePhoto: result.data.profile_photo }; dispatch(setUser(next)); localStorage.setItem("cleanones-dashboard-user", JSON.stringify(next)); } });
    void getCompanyProfile().then((result) => { if (result.success) setCompany({ company_name: result.data.company_name, email: result.data.email, phone: result.data.phone, address: result.data.address, website: result.data.website }); setLoading(false); });
  }, [dispatch]);

  const saveProfile = async () => {
    if (!company.company_name.trim() || !company.email.trim()) return setProfileMessage("Company name and email are required");
    setSaving(true); setProfileMessage(""); const result = await updateCompanyProfile(company); setSaving(false);
    if (!result.success) return setProfileMessage(result.error);
    setCompany({ company_name: result.data.company_name, email: result.data.email, phone: result.data.phone, address: result.data.address, website: result.data.website });
    setProfileMessage("Profile updated successfully");
  };
  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <section className="flex min-w-0 flex-col">
          <h2 className="mb-3 flex h-7 items-center text-lg font-bold leading-none text-slate-950">
            Company Profile
          </h2>
          <div className="dashboard-card p-5">
            {loading ? <DetailSkeleton blocks={5} /> :
            <div className="space-y-4">
              {([['company_name', 'Company Name'], ['email', 'Company Email'], ['phone', 'Phone Number'], ['address', 'Address'], ['website', 'Website']] as const).map(([key, label]) => <label key={key} className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    {label}
                  </span>
                  <input
                    type={key === 'email' ? 'email' : 'text'}
                    value={company[key]}
                    onChange={(event) => setCompany((current) => ({ ...current, [key]: event.target.value }))}
                    className="h-10 w-full rounded border border-gray-200 bg-gray-100 px-4 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
                  />
                </label>)}
            </div>}

            {profileMessage && <p className={`mt-3 text-xs font-medium ${profileMessage.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>{profileMessage}</p>}

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="mt-4 h-10 rounded bg-[#0ea5e9] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </section>

        <section className="flex min-w-0 flex-col">
          <h2 className="mb-3 flex h-7 items-center gap-2 text-lg font-bold leading-none text-slate-950">
            <MdVpnKey className="text-xl" />
            Change Password
          </h2>
          <div className="dashboard-card p-5">
            <div className="space-y-4">
              {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                <label key={label} className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    {label}
                  </span>
                  <div className="relative">
                    <input
                      type="password"
                      className="h-10 w-full rounded border border-gray-200 bg-gray-100 px-4 pr-10 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
                    />
                    <MdOutlineRemoveRedEye className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                  </div>
                </label>
              ))}
            </div>

            <button
              type="button"
              className="mt-4 h-10 rounded bg-[#0ea5e9] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
            >
              Update Password
            </button>
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-3 flex h-7 items-center text-lg font-bold leading-none text-slate-950">Legal</h2>
        <div className="dashboard-card overflow-hidden">
          <LegalRow
            href="/settings/legal/privacy-policy"
            icon={<MdSecurity />}
            iconClassName="bg-[#e0f2fe] text-[#0ea5e9]"
            title="Privacy Policy"
            subtitle="How we collect and protect your data"
          />
          <LegalRow
            href="/settings/legal/terms-and-conditions"
            icon={<MdDescription />}
            iconClassName="bg-[#ede9fe] text-[#8b5cf6]"
            title="Terms & Conditions"
            subtitle="Rules and guidelines for platform use"
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

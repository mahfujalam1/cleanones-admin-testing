"use client";

import React from "react";
import {
  MdChevronRight,
  MdDescription,
  MdOutlineRemoveRedEye,
  MdSecurity,
  MdVpnKey,
} from "react-icons/md";

const companyFields = [
  { label: "Bedrijfsnaam", value: "CleanOnes BV" },
  { label: "Bedrijfs e-mail", value: "admin@cleanones.nl" },
  { label: "Telefoonnummer", value: "+31 20 000 0000" },
  { label: "Adres", value: "Keizersgracht 123, Amsterdam, Nederland" },
  { label: "Website", value: "www.cleanones.nl" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <section className="flex min-w-0 flex-col">
          <h2 className="mb-3 flex h-7 items-center text-lg font-bold leading-none text-slate-950">
            Company Profile
          </h2>
          <div className="dashboard-card p-5">
            <div className="space-y-4">
              {companyFields.map((field) => (
                <label key={field.label} className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    {field.label}
                  </span>
                  <input
                    defaultValue={field.value}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-4 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
                  />
                </label>
              ))}
            </div>

            <button
              type="button"
              className="mt-4 h-10 rounded-lg bg-[#0ea5e9] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
            >
              Save Changes
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
                      className="h-10 w-full rounded-lg border border-gray-200 bg-gray-100 px-4 pr-10 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
                    />
                    <MdOutlineRemoveRedEye className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
                  </div>
                </label>
              ))}
            </div>

            <button
              type="button"
              className="mt-4 h-10 rounded-lg bg-[#0ea5e9] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
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
            icon={<MdSecurity />}
            iconClassName="bg-[#e0f2fe] text-[#0ea5e9]"
            title="Privacy Policy"
            subtitle="How we collect and protect your data"
          />
          <LegalRow
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
  icon,
  iconClassName,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
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
    </button>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdChevronRight,
  MdClose,
  MdDescription,
  MdInfoOutline,
  MdLiveHelp,
  MdSecurity,
  MdVpnKey,
} from "react-icons/md";
import { TbEye, TbEyeOff } from "react-icons/tb";
import { useChangePasswordMutation } from "@/redux/api/endpoints/auth.api";
import { apiError } from "@/redux/api/apiError";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { getLocale, localizePath } from "@/lib/locale";
import { getDashboardTranslation, getUiTranslation } from "@/lib/translations";
import { useModalJump } from "@/hooks/useModalJump";

export default function SettingsPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);
  const ui = getUiTranslation(locale);

  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changePassword, { isLoading: passwordLoading }] = useChangePasswordMutation();
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { triggerJump, jumpClassName } = useModalJump();

  const resetPasswordForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordMessage("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    resetPasswordForm();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (oldPassword.trim() || newPassword.trim() || confirmPassword.trim()) {
        triggerJump();
      } else {
        closePasswordModal();
      }
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
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
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    try {
      const message = await changePassword({
        oldPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      }).unwrap();
      setPasswordMessage(message || "Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        closePasswordModal();
      }, 1500);
    } catch (cause) {
      setPasswordError(apiError(cause));
    }
  };

  return (
    <div className="space-y-6 pb-10">
      
      <section>
        <h2 className="mb-3 flex h-7 items-center text-lg font-bold leading-none text-slate-950">
          {ui.accountSecurity}
        </h2>
        <div className="dashboard-card overflow-hidden">
          <SettingsRow
            icon={<MdVpnKey />}
            iconClassName="bg-[#e0f2fe] text-[#0ea5e9]"
            title={t.settings.changePassword}
            subtitle={ui.changePasswordSubtitle}
            onClick={() => {
              resetPasswordForm();
              setIsPasswordModalOpen(true);
            }}
          />
        </div>
      </section>

      
      <section>
        <h2 className="mb-3 flex h-7 items-center text-lg font-bold leading-none text-slate-950">
          {t.settings.legal}
        </h2>
        <div className="dashboard-card overflow-hidden">
          <SettingsRow
            href="/settings/legal/privacy-policy"
            icon={<MdSecurity />}
            iconClassName="bg-[#e0f2fe] text-[#0ea5e9]"
            title={t.settings.privacyPolicy}
            subtitle={t.settings.privacyPolicySubtitle}
          />
          <SettingsRow
            href="/settings/legal/terms-and-conditions"
            icon={<MdDescription />}
            iconClassName="bg-[#ede9fe] text-[#8b5cf6]"
            title={t.settings.termsAndConditions}
            subtitle={t.settings.termsAndConditionsSubtitle}
          />
          <SettingsRow
            href="/settings/legal/about-us"
            icon={<MdInfoOutline />}
            iconClassName="bg-[#dcfce7] text-[#16a34a]"
            title={ui.aboutUs}
            subtitle={ui.aboutUsRowSubtitle}
          />
          <SettingsRow
            href="/settings/faqs"
            icon={<MdLiveHelp />}
            iconClassName="bg-[#fef3c7] text-[#d97706]"
            title={ui.faqTitle}
            subtitle={ui.faqSubtitle}
          />
        </div>
      </section>

      
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={handleOverlayClick}
        >
          <div
            className={`w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 ${jumpClassName}`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 text-lg">
                  <MdVpnKey />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-950">{t.settings.changePassword}</h3>
                  <p className="text-xs text-slate-500">Update your account credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  {t.settings.currentPassword}
                </span>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 pr-10 text-sm text-slate-800 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500"
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
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  {t.settings.newPassword}
                </span>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 pr-10 text-sm text-slate-800 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500"
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
                <span className="mb-1.5 block text-xs font-medium text-slate-700">
                  {t.settings.confirmPassword}
                </span>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 pr-10 text-sm text-slate-800 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500"
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

              {passwordError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
                  {passwordError}
                </div>
              )}
              {passwordMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-700">
                  {passwordMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="h-10 rounded-lg bg-sky-500 px-5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-sky-600 disabled:opacity-60 cursor-pointer"
                >
                  {passwordLoading ? t.settings.updating : t.settings.updatePassword}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsRow({
  href,
  onClick,
  icon,
  iconClassName,
  title,
  subtitle,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const locale = getLocale(pathname);

  const content = (
    <>
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
    </>
  );

  if (href) {
    return (
      <Link
        href={localizePath(href, locale)}
        className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-4 text-left last:border-b-0 transition-colors hover:bg-gray-50"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-4 text-left last:border-b-0 transition-colors hover:bg-gray-50 cursor-pointer"
    >
      {content}
    </button>
  );
}

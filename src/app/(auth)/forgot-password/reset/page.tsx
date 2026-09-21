"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TextField } from "@/components/shared/Field";
import { useResetPasswordMutation } from "@/redux/api/endpoints/auth.api";
import { apiError } from "@/redux/api/apiError";
import { passwordReset } from "@/lib/auth/passwordReset";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { getLocale, localizePath } from "@/lib/locale";
import { getAuthTranslation } from "@/lib/translations";

const REDIRECT_DELAY_MS = 1500;

export default function ResetPasswordPage() {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const t = getAuthTranslation(locale);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t.passwordLength);
      return;
    }

    
    const email = passwordReset.email();
    if (!email || !passwordReset.isVerified()) {
      setError(t.sessionExpired);
      return;
    }

    try {
      const message = await resetPassword({ email, password, confirmPassword }).unwrap();
      setSuccess(message || t.resetSuccess);
      passwordReset.clear();
      setTimeout(() => router.push(localizePath("/login", locale)), REDIRECT_DELAY_MS);
    } catch (cause) {
      setError(apiError(cause));
    }
  };

  return (
    <div className="w-full max-w-md space-y-5 rounded border border-slate-200 bg-white p-6 sm:p-8">
      <div className="flex select-none flex-col items-center">
        <div className="mb-4 flex items-center justify-center">
          <img src="/cleanones.png" className="h-auto w-24 object-contain" alt="CleanOnes" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{t.setPasswordTitle}</h2>
        <p className="mt-1 text-center text-xs text-slate-500">{t.setPasswordDescription}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label={t.newPassword}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setError("");
          }}
          required
        />
        <TextField
          label={t.confirmPassword}
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            setError("");
          }}
          required
        />

        {error && (
          <p role="alert" className="text-center text-xs font-medium text-red-500">
            {error}
          </p>
        )}
        {success && <p className="text-center text-xs font-medium text-emerald-600">{success}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="h-10 w-full cursor-pointer rounded bg-primary text-sm font-semibold text-white shadow-sm hover:bg-[#0284c7] disabled:opacity-60"
        >
          {isLoading ? t.resetting : t.resetPassword}
        </button>
      </form>
    </div>
  );
}

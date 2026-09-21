"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TbEye, TbEyeOff } from "react-icons/tb";
import { useAppSelector } from "@/redux/hooks";
import { useLoginMutation } from "@/redux/api/endpoints/auth.api";
import { apiError } from "@/redux/api/apiError";
import { getFirstAllowedRoute, getStoredManagerAccess } from "@/lib/access-control";
import type { DashboardRole } from "@/lib/auth/session";
import { getLocale, localizePath } from "@/lib/locale";
import { getAuthTranslation } from "@/lib/translations";

function landingRoute(role: DashboardRole) {
  if (role !== "MANAGER") return "/";
  return getFirstAllowedRoute(getStoredManagerAccess()) ?? "/unauthorized";
}

export default function LoginPage() {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const t = getAuthTranslation(locale);

  const { isAuthenticated, initialized, user } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialized && isAuthenticated && user) {
      router.replace(localizePath(landingRoute(user.role), locale));
    }
  }, [initialized, isAuthenticated, user, locale, router]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const session = await login({ email, password, remember_me: rememberMe }).unwrap();
      if (!session.user) {
        setError(t.subtitle);
        return;
      }

      window.location.replace(localizePath(landingRoute(session.user.role), locale));
    } catch (cause) {
      setError(apiError(cause, t.subtitle));
    }
  };

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      <div className="p-7 sm:p-10">
        <div className="mb-9 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center">
            <img src="/cleanones.png" className="h-auto w-28 object-contain" alt="CleanOnes" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t.welcome}</h2>
          <p className="mt-1.5 text-sm text-slate-500">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="email">
              {t.email}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-[15px] text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="password">
              {t.password}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-4 pr-11 text-[15px] text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
                aria-label={t.password}
              >
                {showPassword ? <TbEyeOff className="text-lg" /> : <TbEye className="text-lg" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-primary"
              />
              {t.rememberMe}
            </label>
            <Link
              href={localizePath("/forgot-password", locale)}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t.forgotPassword}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full cursor-pointer rounded-lg bg-primary text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-[#0284c7] hover:shadow disabled:opacity-60"
          >
            {isLoading ? t.signingIn : t.signIn}
          </button>

          {error && (
            <p
              role="alert"
              className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            >
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

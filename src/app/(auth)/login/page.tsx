"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/auth.slice';
import { getLocale, localizePath } from '@/lib/locale';
import { getFirstAllowedRoute, getStoredManagerAccess, type DashboardRole } from '@/lib/access-control';
import { loginUser } from '@/services/actions/auth';
import { TbEye, TbEyeOff } from 'react-icons/tb';

export default function LoginPage() {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const dispatch = useAppDispatch();
  const { isAuthenticated, initialized, user } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      const destination = user?.role === 'MANAGER'
        ? getFirstAllowedRoute(getStoredManagerAccess()) ?? '/unauthorized'
        : '/';
      router.replace(localizePath(destination, locale));
    }
  }, [initialized, isAuthenticated, user, locale, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginUser({ email, password, remember_me: rememberMe });
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    const normalizedRole = result.data.role.toUpperCase().replaceAll('-', '_');
    const apiRole = (normalizedRole === 'ADMIN' || normalizedRole === 'SUPERADMIN' ? 'SUPER_ADMIN' : normalizedRole) as DashboardRole;
    if (apiRole !== 'MANAGER' && apiRole !== 'SUPER_ADMIN') { setError('Your account does not have dashboard access.'); return; }
    const user = { id: email, name: result.data.name, email, role: apiRole };
    localStorage.setItem('cleanones-dashboard-user', JSON.stringify(user));
    dispatch(setUser(user));
    const destination = apiRole === 'MANAGER'
      ? getFirstAllowedRoute(getStoredManagerAccess()) ?? '/unauthorized'
      : '/';
    router.replace(localizePath(destination, locale));
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      <div className="p-5 sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center justify-center">
            <img src="/cleanones.png" className="h-auto w-24 object-contain" alt="CleanOnes" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-1 text-xs text-slate-500">Sign in to your CleanOnes Dashboard</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded border border-slate-200 bg-white pl-3 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-0.5 rounded transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <TbEyeOff className="text-lg" /> : <TbEye className="text-lg" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-primary" /> Remember me
            </label>
            <Link href={localizePath('/forgot-password', locale)} className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="h-10 w-full cursor-pointer rounded bg-primary text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0284c7] hover:shadow disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          {error && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/auth.slice';
import { getLocale, localizePath } from '@/lib/locale';
import { getFirstAllowedRoute, getManagerByEmail, getStoredManagerAccess, type DashboardRole } from '@/lib/access-control';

export default function LoginPage() {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const dispatch = useAppDispatch();
  const { isAuthenticated, initialized, user } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<DashboardRole>('MANAGER');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialized && isAuthenticated) {
      const destination = user?.role === 'MANAGER'
        ? getFirstAllowedRoute(getStoredManagerAccess()) ?? '/unauthorized'
        : '/';
      router.replace(localizePath(destination, locale));
    }
  }, [initialized, isAuthenticated, user, locale, router]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const manager = role === 'MANAGER' ? getManagerByEmail(email) : null;
    if (manager?.status === 'BLOCKED') {
      setError('This manager account has been blocked by the Super Admin.');
      return;
    }
    localStorage.setItem('token', `cleanones-dashboard-${Date.now()}`);
    const user = role === 'SUPER_ADMIN'
      ? { id: 'sa-1', name: 'CleanOnes Admin', email, role: 'SUPER_ADMIN' as const }
      : { id: manager!.id, name: manager!.name, email: manager!.email, role: 'MANAGER' as const };
    localStorage.setItem('cleanones-dashboard-user', JSON.stringify(user));
    dispatch(setUser(user));
    const destination = role === 'MANAGER'
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
          <div className="grid grid-cols-2 gap-2 rounded bg-slate-100 p-1">
            {([['MANAGER', 'Manager'], ['SUPER_ADMIN', 'Super Admin']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setRole(value)} className={`h-9 rounded text-xs font-semibold transition ${role === value ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                {label}
              </button>
            ))}
          </div>
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
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-primary" /> Remember me
            </label>
            <Link href={localizePath('/forgot-password', locale)} className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="h-10 w-full cursor-pointer rounded bg-primary text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0284c7] hover:shadow">
            Sign In
          </button>
          {error && <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don&apos;t have an account? <span className="font-medium text-primary">Contact your cleaning company.</span>
        </div>
      </div>
    </div>
  );
}

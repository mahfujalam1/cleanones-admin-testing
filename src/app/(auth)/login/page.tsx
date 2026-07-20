"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/auth.slice';
import { getLocale, localizePath } from '@/lib/locale';

export default function LoginPage() {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const dispatch = useAppDispatch();
  const { isAuthenticated, initialized } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (initialized && isAuthenticated) router.replace(localizePath('/', locale));
  }, [initialized, isAuthenticated, locale, router]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('token', `cleanones-dashboard-${Date.now()}`);
    dispatch(setUser({ id: '1', name: 'Kaz Putters', email, role: 'Manager' }));
    router.replace(localizePath('/', locale));
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      <div className="p-5 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center justify-center">
            <img src="/cleanones.png" className="h-auto w-24 object-contain" alt="CleanOnes" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-1 text-xs text-slate-500">Sign in to your Manager Dashboard</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
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
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
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

          <button type="submit" className="h-10 w-full cursor-pointer rounded-md bg-primary text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0284c7] hover:shadow-md">
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don&apos;t have an account? <span className="font-medium text-primary">Contact your cleaning company.</span>
        </div>
      </div>
    </div>
  );
}

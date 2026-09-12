"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { forgotPassword } from '@/services/actions/auth';
import { getLocale, localizePath } from '@/lib/locale';
import { getAuthTranslation } from '@/lib/translations';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const locale = getLocale(usePathname());
  const t = getAuthTranslation(locale);

  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError(t.emailRequired);
    setError('');
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (!result.success) return setError(result.error);
    sessionStorage.setItem('cleanones-reset-email', email);
    router.push(localizePath('/forgot-password/otp', locale));
  };

  return (
    <div className="w-full max-w-md space-y-5 rounded border border-slate-200 bg-white p-6 sm:p-8">
      <div className="flex select-none flex-col items-center">
        <div className="mb-4 flex items-center justify-center">
          <img src="/cleanones.png" className="h-auto w-24 object-contain" alt="CleanOnes" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{t.forgotTitle}</h2>
        <p className="mt-1 text-center text-xs text-slate-500">{t.forgotDescription}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800">{t.email}</label>
          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@company.com" className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10" required />
          {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
        <button type="submit" disabled={loading} className="h-10 w-full cursor-pointer rounded bg-primary text-sm font-semibold text-white shadow-sm hover:bg-[#0284c7] disabled:opacity-60">{loading ? t.sending : t.sendOtp}</button>
      </form>

      <p className="text-center text-[11px] text-slate-400">{t.rememberQuestion} <Link href={localizePath('/login', locale)} className="font-semibold text-primary hover:underline">{t.signIn}</Link></p>
    </div>
  );
}

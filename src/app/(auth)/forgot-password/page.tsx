"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Email is required');
    router.push('/forgot-password/otp');
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06)] sm:p-10">
      <div className="flex select-none flex-col items-center">
        <div className="mb-4 flex items-center justify-center">
          <img src="/cleanones.png" className="h-auto w-24 object-contain" alt="CleanOnes" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Forgot password?</h2>
        <p className="mt-1 text-center text-xs text-slate-500">Enter your email address and we will send you a 6-digit OTP code to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800">Email Address</label>
          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@company.com" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10" required />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
        <button type="submit" className="h-10 w-full cursor-pointer rounded-md bg-primary text-sm font-semibold text-white shadow-sm hover:bg-[#0284c7]">Send OTP</button>
      </form>

      <p className="text-center text-[11px] text-slate-400">Remember your password? <Link href="/login" className="font-semibold text-primary hover:underline">Sign In</Link></p>
    </div>
  );
}

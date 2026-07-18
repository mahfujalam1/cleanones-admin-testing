"use client";

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const change = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp]; next[index] = value.slice(-1); setOtp(next); setError('');
    if (value && index < 5) refs.current[index + 1]?.focus();
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length !== 6) return setError('Please enter the complete 6-digit code');
    router.push('/forgot-password/reset');
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06)] sm:p-10">
      <div className="flex select-none flex-col items-center">
        <div className="mb-4 flex items-center justify-center"><img src="/cleanones.png" className="h-auto w-24 object-contain" alt="CleanOnes" /></div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Enter OTP Code</h2>
        <p className="mt-1 text-center text-xs text-slate-500">We sent a verification code to your email. Type the 6-digit code below.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {otp.map((digit, index) => <input key={index} ref={(el) => { refs.current[index] = el; }} value={digit} onChange={(e) => change(e.target.value, index)} onKeyDown={(e) => { if (e.key === 'Backspace' && !digit && index > 0) refs.current[index - 1]?.focus(); }} inputMode="numeric" maxLength={1} className="h-12 w-11 rounded-md border border-slate-200 bg-white text-center text-lg font-bold text-slate-800 outline-none transition-colors focus:border-primary" required />)}
        </div>
        {error && <p className="text-center text-xs font-medium text-red-500">{error}</p>}
        <button type="submit" className="h-10 w-full cursor-pointer rounded-md bg-primary text-sm font-semibold text-white shadow-sm hover:bg-[#0284c7]">Verify Code</button>
      </form>
      <p className="text-center text-[11px] text-slate-400">Didn&apos;t receive the code? <button type="button" className="font-semibold text-primary hover:underline">Resend Code</button></p>
    </div>
  );
}

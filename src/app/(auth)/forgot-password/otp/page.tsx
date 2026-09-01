"use client";

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { resendOtp } from '@/services/actions/auth';
import { getLocale, localizePath } from '@/lib/locale';

export default function OTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const locale = getLocale(usePathname());

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('cleanones-reset-email');
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const change = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp]; next[index] = value.slice(-1); setOtp(next); setError(''); setInfo('');
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return setError('Please enter the complete 6-digit code');
    sessionStorage.setItem('cleanones-reset-otp', code);
    router.push(localizePath('/forgot-password/reset', locale));
  };

  const handleResend = async () => {
    if (!email) {
      const stored = sessionStorage.getItem('cleanones-reset-email');
      if (!stored) return setError('Please start the reset process again');
    }
    setError(''); setInfo(''); setResending(true);
    const targetEmail = email || sessionStorage.getItem('cleanones-reset-email') || '';
    const result = await resendOtp(targetEmail);
    setResending(false);
    if (result.success) {
      setInfo(typeof result.data === 'string' ? result.data : 'OTP code resent to your email.');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="w-full max-w-md space-y-5 rounded border border-slate-200 bg-white p-6 sm:p-8">
      <div className="flex select-none flex-col items-center">
        <div className="mb-4 flex items-center justify-center"><img src="/cleanones.png" className="h-auto w-24 object-contain" alt="CleanOnes" /></div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Enter OTP Code</h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          We sent a verification code to {email ? <span className="font-semibold text-slate-700">{email}</span> : 'your email'}. Type the 6-digit code below.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {otp.map((digit, index) => <input key={index} ref={(el) => { refs.current[index] = el; }} value={digit} onChange={(e) => change(e.target.value, index)} onKeyDown={(e) => { if (e.key === 'Backspace' && !digit && index > 0) refs.current[index - 1]?.focus(); }} inputMode="numeric" maxLength={1} className="h-12 w-11 rounded border border-slate-200 bg-white text-center text-lg font-bold text-slate-800 outline-none transition-colors focus:border-primary" required />)}
        </div>
        {error && <p className="text-center text-xs font-medium text-red-500">{error}</p>}
        {info && <p className="text-center text-xs font-medium text-emerald-600">{info}</p>}
        <button type="submit" className="h-10 w-full cursor-pointer rounded bg-primary text-sm font-semibold text-white shadow-sm hover:bg-[#0284c7]">Verify Code</button>
      </form>
      <p className="text-center text-[11px] text-slate-400">Didn&apos;t receive the code? <button type="button" onClick={handleResend} disabled={resending} className="font-semibold text-primary hover:underline disabled:opacity-60">{resending ? 'Sending...' : 'Resend Code'}</button></p>
    </div>
  );
}

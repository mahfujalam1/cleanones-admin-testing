"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { resetPassword } from '@/services/actions/auth';
import { getLocale, localizePath } from '@/lib/locale';
import { TbEye, TbEyeOff } from 'react-icons/tb';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const locale = getLocale(usePathname());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    if (!password || !confirmPassword) return setError('Please fill in all fields');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters long');
    
    const email = sessionStorage.getItem('cleanones-reset-email');
    const otpCode = sessionStorage.getItem('cleanones-reset-otp');
    if (!email || !otpCode) return setError('Reset session expired. Please request a new OTP code.');
    
    setLoading(true);
    const result = await resetPassword({ email, otp_code: otpCode, new_password: password });
    setLoading(false);
    
    if (!result.success) return setError(result.error);

    setSuccessMsg(typeof result.data === 'string' ? result.data : 'Password reset successfully!');
    sessionStorage.removeItem('cleanones-reset-email');
    sessionStorage.removeItem('cleanones-reset-otp');

    setTimeout(() => {
      router.push(localizePath('/login', locale));
    }, 1500);
  };

  const fieldClass = "h-10 w-full rounded border border-slate-200 bg-white pl-3 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10";
  
  return (
    <div className="w-full max-w-md space-y-5 rounded border border-slate-200 bg-white p-6 sm:p-8">
      <div className="flex select-none flex-col items-center">
        <div className="mb-4 flex items-center justify-center"><img src="/cleanones.png" className="h-auto w-24 object-contain" alt="CleanOnes" /></div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Set New Password</h2>
        <p className="mt-1 text-center text-xs text-slate-500">Choose a secure password. Make sure it is at least 6 characters long.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800">New Password</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" className={fieldClass} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPassword ? <TbEyeOff /> : <TbEye />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-800">Confirm New Password</label>
          <div className="relative">
            <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} placeholder="••••••••" className={fieldClass} required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showConfirmPassword ? <TbEyeOff /> : <TbEye />}
            </button>
          </div>
        </div>
        {error && <p className="text-center text-xs font-medium text-red-500">{error}</p>}
        {successMsg && <p className="text-center text-xs font-medium text-emerald-600">{successMsg}</p>}
        <button type="submit" disabled={loading} className="h-10 w-full cursor-pointer rounded bg-primary text-sm font-semibold text-white shadow-sm hover:bg-[#0284c7] disabled:opacity-60">{loading ? 'Resetting...' : 'Reset Password'}</button>
      </form>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return setError('Please fill in all fields');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters long');
    router.push('/login');
  };

  const fieldClass = "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10";
  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06)] sm:p-10">
      <div className="flex select-none flex-col items-center">
        <div className="mb-4 flex items-center justify-center"><img src="/cleanones.png" className="h-auto w-24 object-contain" alt="CleanOnes" /></div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Set New Password</h2>
        <p className="mt-1 text-center text-xs text-slate-500">Choose a secure password. Make sure it is at least 6 characters long.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-800">New Password</label><input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" className={fieldClass} required /></div>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-800">Confirm New Password</label><input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} placeholder="••••••••" className={fieldClass} required /></div>
        {error && <p className="text-center text-xs font-medium text-red-500">{error}</p>}
        <button type="submit" className="h-10 w-full cursor-pointer rounded-md bg-primary text-sm font-semibold text-white shadow-sm hover:bg-[#0284c7]">Reset Password</button>
      </form>
    </div>
  );
}

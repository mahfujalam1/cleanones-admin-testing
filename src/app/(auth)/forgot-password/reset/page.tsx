"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdLockOutline, MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    router.push('/login');
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded shadow p-8 sm:p-10 relative">
      <div className="w-14 h-14 bg-[#e0f2fe] rounded-2xl flex items-center justify-center mb-6">
        <MdLockOutline className="text-2xl text-[#0ea5e9]" />
      </div>

      <h2 className="text-[28px] font-bold text-gray-900 mb-3 tracking-tight">Set new password</h2>
      <p className="text-[15px] text-gray-500 mb-8">Your new password must be different to previously used passwords.</p>

      <form onSubmit={handleReset} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400 pointer-events-none z-10 flex items-center justify-center">
              <MdLockOutline className="text-[20px]" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-12 w-full rounded border border-gray-200 bg-white px-4 py-2 pl-12 pr-12 text-[15px] text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/20 focus-visible:border-[#0ea5e9]"
              required
            />
            <button 
              type="button"
              className="absolute right-4 text-gray-400 hover:text-gray-600 cursor-pointer z-10 flex items-center justify-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <MdVisibilityOff className="text-[20px]" /> : <MdVisibility className="text-[20px]" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400 pointer-events-none z-10 flex items-center justify-center">
              <MdLockOutline className="text-[20px]" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex h-12 w-full rounded border border-gray-200 bg-white px-4 py-2 pl-12 pr-12 text-[15px] text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/20 focus-visible:border-[#0ea5e9]"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full h-12 mt-4 text-[15px] rounded bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow hover:shadow-md transition-all font-bold cursor-pointer"
        >
          Reset Password
        </button>
      </form>
      
      <div className="mt-8 text-center text-[14px]">
        <Link href="/login" className="text-[#0ea5e9] font-semibold hover:underline flex items-center justify-center gap-1.5">
          <MdArrowBack className="text-lg" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}

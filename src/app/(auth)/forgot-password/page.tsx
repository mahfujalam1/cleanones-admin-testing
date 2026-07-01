"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdOutlineMailOutline, MdArrowBack } from 'react-icons/md';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/forgot-password/otp');
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded shadow  p-8 sm:p-10 relative">
      <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8 font-medium">
        <MdArrowBack className="text-lg" />
        Back to Sign In
      </Link>

      <div className="w-14 h-14 bg-[#e0f2fe] rounded-2xl flex items-center justify-center mb-6">
        <MdOutlineMailOutline className="text-2xl text-[#0ea5e9]" />
      </div>

      <h2 className="text-[28px] font-bold text-gray-900 mb-3 tracking-tight">Forgot password?</h2>
      <p className="text-[15px] text-gray-500 mb-8">Enter your email and we&apos;ll send you a reset link.</p>

      <form onSubmit={handleSendLink} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
          <div className="relative flex items-center mt-1">
            <div className="absolute left-4 text-gray-400 pointer-events-none z-10 flex items-center justify-center">
              <MdOutlineMailOutline className="text-[20px]" />
            </div>
            <input
              type="email"
              placeholder="name@cleanones.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-12 w-full rounded border border-gray-200 bg-white px-4 py-2 pl-12 pr-12 text-[15px] text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/20 focus-visible:border-[#0ea5e9]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-12 text-[15px] rounded bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow hover:shadow-md transition-all font-bold cursor-pointer"
        >
          Send Otp
        </button>
      </form>
    </div>
  );
}

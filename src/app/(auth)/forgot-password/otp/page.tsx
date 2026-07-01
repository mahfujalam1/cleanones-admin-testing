"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdLockOutline } from 'react-icons/md';

export default function OTPPage() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // one char only

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // auto-advance
    if (value !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/forgot-password/reset');
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded shadow p-8 sm:p-10 relative">
      <Link href="/forgot-password" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8 font-medium">
        <MdArrowBack className="text-lg" />
        Back
      </Link>
      
      <div className="w-14 h-14 bg-[#e0f2fe] rounded-2xl flex items-center justify-center mb-6">
        <MdLockOutline className="text-2xl text-[#0ea5e9]" />
      </div>

      <h2 className="text-[28px] font-bold text-gray-900 mb-3 tracking-tight">Check your email</h2>
      <p className="text-[15px] text-gray-500 mb-8">We sent a reset code to your email. Enter it below to verify.</p>

      <form onSubmit={handleVerify} className="space-y-8">
        <div className="flex justify-between gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-16 h-16 text-center text-3xl font-bold rounded border border-gray-200 bg-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/20 focus-visible:border-[#0ea5e9]"
              required
            />
          ))}
        </div>

        <button 
          type="submit" 
          className="w-full h-12 text-[15px] rounded bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow hover:shadow-md transition-all font-bold cursor-pointer"
        >
          Verify Code
        </button>
      </form>
      
      <div className="mt-8 text-center text-[14px] text-gray-500">
        Didn't receive the email? <button className="text-[#0ea5e9] font-semibold hover:underline ml-1">Click to resend</button>
      </div>
    </div>
  );
}

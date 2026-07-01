"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MdOutlineMailOutline, MdLockOutline, MdVisibility, MdVisibilityOff, MdAutoAwesome } from 'react-icons/md';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fillDemoCredentials = () => {
    setEmail('kaz.putters@cleanones.nl');
    setPassword('Demo@2026');
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would use NextAuth or similar
    // For now, redirect to dashboard manually (we can just use window.location or next/navigation router)
    window.location.href = '/';
  };

  return (
    <Card className="w-full max-w-[420px] rounded-md shadow border-0 overflow-hidden">
      <CardContent className="p-8 sm:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-sm text-gray-500">Sign in to your manager account.</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-[#f0fdfa] border border-[#ccfbf1] rounded-lg p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-[#0ea5e9] text-white flex items-center justify-center shrink-0">
            <MdAutoAwesome />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-0.5">Fill in demo credentials</h4>
            <p className="text-[11px] text-gray-500">kaz.putters@cleanones.nl - Demo@2026</p>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="text-[10px] h-7 px-3 bg-[#0ea5e9] hover:bg-[#0284c7] rounded"
            onClick={fillDemoCredentials}
          >
            Click to fill
          </Button>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Email Address</label>
            <Input
              type="email" 
              placeholder="name@company.com" 
              icon={<MdOutlineMailOutline className="text-lg" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Password</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-gray-400 pointer-events-none z-10">
                <MdLockOutline className="text-lg" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 pl-10 pr-10 text-sm text-gray-900 shadow transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-[#0ea5e9] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full h-11 text-sm rounded bg-[#0ea5e9] hover:bg-[#0284c7] shadow hover:shadow-md transition-all font-semibold">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account? <Link href="/register" className="text-[#0ea5e9] font-medium hover:underline">Sign Up</Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Local UI Components
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

function Button({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  const variantClasses = {
    default: '',
    ghost: 'bg-transparent hover:bg-gray-100',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
  };
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'h-11 px-5 text-base',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function Card({
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardContent({
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}


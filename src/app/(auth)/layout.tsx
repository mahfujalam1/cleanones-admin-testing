import React from 'react';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6 py-10">
      
      <div className="absolute right-5 top-5">
        <LanguageSwitcher />
      </div>
      {children}
    </main>
  );
}

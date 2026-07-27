"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { getLocale, localizePath } from '@/lib/locale';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import { SignOutConfirmation } from '@/components/dashboard/SignOutConfirmation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const { isAuthenticated, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (initialized && !isAuthenticated) router.replace(localizePath('/login', locale));
  }, [initialized, isAuthenticated, locale, router]);

  if (!initialized || !isAuthenticated) {
    return <div className="flex h-dvh items-center justify-center bg-white"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary" /></div>;
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#f4f5f7]">
      <Topbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain bg-[#f4f5f7] p-3 sm:p-4 lg:p-5">
          <div className="w-full min-w-0 lg:px-8">{children}</div>
        </main>
      </div>
      <SignOutConfirmation />
    </div>
  );
}

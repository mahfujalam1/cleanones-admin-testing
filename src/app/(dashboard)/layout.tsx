"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { getLocale, localizePath, stripLocale } from '@/lib/locale';
import { getFirstAllowedRoute, getStoredManagerAccess, managerIsBlocked, routeIsAllowed } from '@/lib/access-control';
import Sidebar from '@/components/dashboard/sidebar';
import Topbar from '@/components/dashboard/topbar';
import { SignOutConfirmation } from '@/components/dashboard/SignOutConfirmation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const routePath = stripLocale(pathname);
  const { isAuthenticated, initialized, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (initialized && !isAuthenticated) router.replace(localizePath('/login', locale));
  }, [initialized, isAuthenticated, locale, router]);

  useEffect(() => {
    if (!initialized || !isAuthenticated || !user) return;
    if (user.role === 'MANAGER' && managerIsBlocked(user.id) && routePath !== '/blocked') {
      router.replace(localizePath('/blocked', locale));
      return;
    }
    if (user.role === 'MANAGER' && routePath !== '/unauthorized' && !routeIsAllowed(routePath, getStoredManagerAccess())) {
      const firstAllowedRoute = getFirstAllowedRoute(getStoredManagerAccess());
      router.replace(localizePath(firstAllowedRoute ?? '/unauthorized', locale));
    }
    if (user.role !== 'SUPER_ADMIN' && routePath.startsWith('/manager-access')) {
      router.replace(localizePath('/unauthorized', locale));
    }
  }, [initialized, isAuthenticated, user, routePath, locale, router]);

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

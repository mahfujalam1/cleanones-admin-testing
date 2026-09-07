"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getLocale, localizePath, stripLocale } from '@/lib/locale';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebar, closeMobileSidebar, setSignOutModalOpen } from '@/store/slices/ui.slice';
import {
  MdDashboard, MdCalendarToday, MdAccessTime, MdPeople,
  MdBusinessCenter, MdLocationOn,
  MdPhotoCamera, MdWarning, MdAssessment, MdNotifications, MdSettings,
  MdChevronLeft, MdChevronRight, MdLogout, MdChatBubbleOutline
} from 'react-icons/md';
import { MdMeetingRoom, MdChecklist, MdAdminPanelSettings } from 'react-icons/md';
import { dashboardApi } from '@/redux/api/dashboardApi';
import { shiftMonitoringApi } from '@/redux/api/shiftMonitoringApi';
import { reportsApi } from '@/redux/api/reportsApi';
import { getDashboardTranslation } from '@/lib/translations';
import { getStoredManagerAccess, routeIsAllowed } from '@/lib/access-control';

export default function Sidebar() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const routePath = stripLocale(pathname);
  const t = getDashboardTranslation(locale);

  const prefetchDashboard = dashboardApi.usePrefetch('getDashboardOverview');
  const prefetchShiftMonitoring = shiftMonitoringApi.usePrefetch('getLiveStatus');
  const prefetchNotifications = dashboardApi.usePrefetch('getNotifications');
  const prefetchReports = reportsApi.usePrefetch('getQualityControlReport');

  const handleLinkHover = (href: string) => {
    if (href === '/') prefetchDashboard();
    else if (href === '/shift-monitoring') prefetchShiftMonitoring({});
    else if (href === '/notifications') prefetchNotifications({ page: 1, limit: 20 });
    else if (href === '/reports') prefetchReports('month');
  };

  const mainLinks = [
    { name: t.nav.dashboard, href: '/', icon: MdDashboard },
    { name: t.nav.roster, href: '/roster', icon: MdCalendarToday },
    { name: t.nav.shiftMonitoring, href: '/shift-monitoring', icon: MdAccessTime },
    { name: t.nav.workers, href: '/users', icon: MdPeople },
    { name: t.nav.clients, href: '/clients', icon: MdBusinessCenter },
    { name: t.nav.chat, href: '/chat', icon: MdChatBubbleOutline },
    { name: t.nav.locations, href: '/locations', icon: MdLocationOn },
    { name: t.nav.rooms, href: '/rooms', icon: MdMeetingRoom },
    { name: t.nav.cleaningPlans, href: '/cleaning-plans', icon: MdChecklist },
    { name: t.nav.extraServices, href: '/extra-services', icon: MdBusinessCenter },
  ];

  const qcLinks = [
    { name: t.nav.photoReviews, href: '/photo-reviews', icon: MdPhotoCamera },
    { name: t.nav.escalations, href: '/escalations', icon: MdWarning },
    { name: t.nav.reports, href: '/reports', icon: MdAssessment },
    { name: t.nav.notifications, href: '/notifications', icon: MdNotifications },
    { name: t.nav.settings, href: '/settings', icon: MdSettings },
  ];

  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const mobileSidebarOpen = useAppSelector((state) => state.ui.mobileSidebarOpen);
  const user = useAppSelector((state) => state.auth.user);
  const collapsed = !sidebarOpen;
  const allowedRoutes = user?.role === 'SUPER_ADMIN' ? null : getStoredManagerAccess();
  const visibleMainLinks = allowedRoutes ? mainLinks.filter((link) => routeIsAllowed(link.href, allowedRoutes)) : mainLinks;
  const visibleQcLinks = allowedRoutes ? qcLinks.filter((link) => routeIsAllowed(link.href, allowedRoutes)) : qcLinks;

  return (
    <>
      {/* Mobile/tablet backdrop */}
      <button
        type="button"
        aria-label="Close navigation"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-500 ease-out lg:hidden ${mobileSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => dispatch(closeMobileSidebar())}
      />

      <aside
        data-mobile-open={mobileSidebarOpen}
        className={`
          mobile-sidebar-panel
          fixed inset-y-0 left-0 z-50 flex h-dvh shrink-0 flex-col overflow-visible border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:static lg:z-20 lg:h-full
          will-change-transform transition-[width] duration-300 ease-out
          ${collapsed ? 'w-64 lg:w-16' : 'w-64'}
          ${mobileSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none lg:pointer-events-auto'}
          lg:flex
        `}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5 lg:hidden">
          <img
            src="/cleanones.png"
            alt="CleanOnes"
            className="h-auto w-24 object-contain"
          />
        </div>

        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-[14px] z-[60] hidden h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-muted-foreground shadow-sm transition-colors hover:text-foreground lg:flex"
        >
          {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </button>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3 custom-scrollbar lg:py-2">
          <nav className="space-y-1 px-3">
            {visibleMainLinks.map((link) => {
              const isActive = routePath === link.href || (link.href !== '/' && routePath.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={localizePath(link.href, locale)}
                  onMouseEnter={() => handleLinkHover(link.href)}
                  onClick={() => dispatch(closeMobileSidebar())}
                  className={`flex h-9 items-center justify-between rounded px-3 text-sm font-medium transition-colors ${isActive
                    ? 'bg-[#e5f6fc] text-primary'
                    : 'text-sidebar-foreground hover:bg-[#f2f9fc] hover:text-foreground'
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    <link.icon className={`text-base ${isActive ? 'text-primary' : 'text-sidebar-foreground'}`} />
                    <span className={collapsed ? 'lg:hidden' : 'block'}>{link.name}</span>
                  </span>
                  {isActive && <span className={`h-1.5 w-1.5 rounded-full bg-primary ${collapsed ? 'lg:hidden' : 'block'}`} aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>

          <div className="mx-3 my-4 border-t border-sidebar-border" />
          <div className={`mb-2 px-6 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider ${collapsed ? 'lg:hidden' : 'block'}`}>{t.nav.qualityControl}</div>

          <nav className="space-y-1 px-3">
            {visibleQcLinks.map((link) => {
              const isActive = routePath === link.href || (routePath.startsWith(link.href) && link.href !== '/');
              return (
                <Link
                  key={link.name}
                  href={localizePath(link.href, locale)}
                  onMouseEnter={() => handleLinkHover(link.href)}
                  onClick={() => dispatch(closeMobileSidebar())}
                  className={`flex h-9 items-center justify-between rounded px-3 text-sm font-medium transition-colors ${isActive
                    ? 'bg-[#e5f6fc] text-primary'
                    : 'text-sidebar-foreground hover:bg-[#f2f9fc] hover:text-foreground'
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    <link.icon className={`text-base ${isActive ? 'text-primary' : 'text-sidebar-foreground'}`} />
                    <span className={collapsed ? 'lg:hidden' : 'block'}>{link.name}</span>
                  </span>
                  {isActive && <span className={`h-1.5 w-1.5 rounded-full bg-primary ${collapsed ? 'lg:hidden' : 'block'}`} aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>

          {/* {user?.role === 'SUPER_ADMIN' && (
            <>
              <div className="mx-3 my-4 border-t border-sidebar-border" />
              <div className={`mb-2 px-6 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70 ${collapsed ? 'lg:hidden' : 'block'}`}>{t.nav.administration}</div>
              <nav className="space-y-1 px-3">
                <Link href={localizePath('/manager-access', locale)} onClick={() => dispatch(closeMobileSidebar())} className={`flex h-9 items-center gap-2.5 rounded px-3 text-sm font-medium transition-colors ${routePath.startsWith('/manager-access') ? 'bg-[#e5f6fc] text-primary' : 'text-sidebar-foreground hover:bg-[#f2f9fc] hover:text-foreground'}`}>
                  <MdAdminPanelSettings className="text-lg" />
                  <span className={collapsed ? 'lg:hidden' : 'block'}>{t.nav.managerAccess}</span>
                </Link>
              </nav>
            </>
          )} */}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-sidebar-border p-3">
          <button onClick={() => dispatch(setSignOutModalOpen(true))} className="flex h-9 w-full cursor-pointer items-center gap-3 rounded px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground">
            <MdLogout className="shrink-0 text-lg" />
            <span className={collapsed ? 'lg:hidden' : 'block'}>{t.nav.signOut}</span>
          </button>
        </div>

        <style jsx global>{`
          .mobile-sidebar-panel {
            transform: translate3d(-100%, 0, 0);
            transition-property: transform, width;
            transition-duration: 480ms, 300ms;
            transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1), ease-out;
          }
          .mobile-sidebar-panel[data-mobile-open="true"] {
            transform: translate3d(0, 0, 0);
          }
          @media (min-width: 1024px) {
            .mobile-sidebar-panel,
            .mobile-sidebar-panel[data-mobile-open="true"] {
              transform: none;
            }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>
      </aside>
    </>
  );
}

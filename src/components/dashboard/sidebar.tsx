"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getLocale, localizePath, stripLocale } from '@/lib/locale';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebar, closeMobileSidebar, setSignOutModalOpen } from '@/store/slices/ui.slice';
import {
  MdDashboard, MdCalendarToday, MdAccessTime, MdPeople,
  MdBusinessCenter, MdLocationOn, MdMeetingRoom, MdAssignment,
  MdPhotoCamera, MdWarning, MdAssessment, MdNotifications, MdSettings,
  MdChevronLeft, MdChevronRight, MdLogout
} from 'react-icons/md';

const mainLinks = [
  { name: 'Dashboard', href: '/', icon: MdDashboard },
  { name: 'Roster', href: '/roster', icon: MdCalendarToday },
  { name: 'Shift Monitoring', href: '/shift-monitoring', icon: MdAccessTime },
  { name: 'Workers', href: '/users', icon: MdPeople },
  { name: 'Clients', href: '/clients', icon: MdBusinessCenter },
  { name: 'Locations', href: '/locations', icon: MdLocationOn },
  { name: 'Rooms', href: '/rooms', icon: MdMeetingRoom },
  { name: 'Cleaning Plans', href: '/cleaning-plans', icon: MdAssignment },
];

const qcLinks = [
  { name: 'Photo Reviews', href: '/photo-reviews', icon: MdPhotoCamera },
  { name: 'Escalations', href: '/escalations', icon: MdWarning },
  { name: 'Reports', href: '/reports', icon: MdAssessment },
  { name: 'Notifications', href: '/notifications', icon: MdNotifications },
  { name: 'Settings', href: '/settings', icon: MdSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const routePath = stripLocale(pathname);
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const mobileSidebarOpen = useAppSelector((state) => state.ui.mobileSidebarOpen);
  const collapsed = !sidebarOpen;

  return (
    <>
      {/* Mobile/tablet backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => dispatch(closeMobileSidebar())}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 h-full
          relative bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col shrink-0
          transition-[width,transform] duration-200 ease-[var(--ease-out)]
          ${collapsed ? 'w-64 lg:w-16' : 'w-64'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:flex
        `}
      >
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-[14px] z-10 hidden h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-muted-foreground shadow-sm transition-colors hover:text-foreground lg:flex"
        >
          {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </button>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          <nav className="space-y-1 px-3">
            {mainLinks.map((link) => {
              const isActive = routePath === link.href || (link.href !== '/' && routePath.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={localizePath(link.href, locale)}
                  onClick={() => dispatch(closeMobileSidebar())}
                  className={`flex h-9 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors ${isActive
                      ? 'bg-white text-primary shadow-[var(--shadow-xs)]'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                    }`}
                >
                  <link.icon className={`text-base ${isActive ? 'text-primary' : 'text-sidebar-foreground'}`} />
                  <span className={collapsed ? 'lg:hidden' : 'block'}>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mx-3 my-4 border-t border-sidebar-border" />
          <div className={`mb-2 px-6 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider ${collapsed ? 'lg:hidden' : 'block'}`}>Quality Control</div>

          <nav className="space-y-1 px-3">
            {qcLinks.map((link) => {
              const isActive = routePath === link.href || (routePath.startsWith(link.href) && link.href !== '/');
              return (
                <Link
                  key={link.name}
                  href={localizePath(link.href, locale)}
                  onClick={() => dispatch(closeMobileSidebar())}
                  className={`flex h-9 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors ${isActive
                      ? 'bg-white text-primary shadow-[var(--shadow-xs)]'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                    }`}
                >
                  <link.icon className={`text-base ${isActive ? 'text-primary' : 'text-sidebar-foreground'}`} />
                  <span className={collapsed ? 'lg:hidden' : 'block'}>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-sidebar-border p-3">
          <button onClick={() => dispatch(setSignOutModalOpen(true))} className="flex h-9 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground">
            <MdLogout className="shrink-0 text-lg" />
            <span className={collapsed ? 'lg:hidden' : 'block'}>Sign Out</span>
          </button>
        </div>

        <style jsx global>{`
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

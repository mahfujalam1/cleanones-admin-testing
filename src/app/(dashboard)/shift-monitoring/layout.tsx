"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getLocale, localizePath, stripLocale } from '@/lib/locale';

export default function ShiftMonitoringLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const routePath = stripLocale(pathname);

  const tabs = [
    { 
      name: 'Live Status', 
      path: '/shift-monitoring',
      icon: <span className="text-lg">⚡</span>,
      exact: true
    },
    { 
      name: 'Attendance & Time Tracking', 
      path: '/shift-monitoring/attendance-and-time-tracking',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      exact: false
    },
    { 
      name: 'Location Statistics', 
      path: '/shift-monitoring/location-statistics',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      exact: false
    }
  ];

  return (
    <div className="h-full flex flex-col relative">
      {/* Top Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-6 px-2 flex-shrink-0 overflow-x-auto">
        {tabs.map(tab => {
          const isActive = tab.exact
            ? routePath === tab.path
            : routePath.startsWith(tab.path);

          return (
            <Link 
              key={tab.name}
              href={localizePath(tab.path, locale)}
              aria-current={isActive ? 'page' : undefined}
              className={`mb-2 flex h-9 items-center gap-2 whitespace-nowrap rounded border px-3 text-xs font-semibold transition-colors ${
                isActive 
                  ? 'border-sky-200 bg-sky-50 text-primary' 
                  : 'border-transparent text-gray-500 hover:bg-white hover:text-gray-800'
              }`}
            >
              {tab.icon}
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pb-10">
        {children}
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { getLocale, localizePath, stripLocale } from '@/lib/locale';
import { SlidingTabs } from '@/components/ui/sliding-tabs';

import { getDashboardTranslation } from '@/lib/translations';
import { getUiTranslation } from "@/lib/translations";

export default function ShiftMonitoringLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const routePath = stripLocale(pathname);
  const t = getDashboardTranslation(locale);
  const ui = getUiTranslation(getLocale(usePathname()));

  const tabs = [
    { 
      name: ui.liveShifts, 
      path: '/shift-monitoring',
      icon: <span className="text-lg">⚡</span>,
      exact: true
    },
    { 
      name: t.dashboard.workerAttendance, 
      path: '/shift-monitoring/attendance-and-time-tracking',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      exact: false
    }
  ];
  const activePath = tabs.find((tab) =>
    tab.exact ? routePath === tab.path : routePath.startsWith(tab.path),
  )?.path ?? tabs[0].path;

  return (
    <div className="h-full flex flex-col relative">
      
      <div className="mb-6 flex-shrink-0 border-b border-gray-200 pb-3">
        <SlidingTabs
          value={activePath}
          className="w-fit"
          options={tabs.map((tab) => ({
            value: tab.path,
            href: localizePath(tab.path, locale),
            label: <span className="flex items-center gap-2">{tab.icon}{tab.name}</span>,
          }))}
        />
      </div>

      
      <div key={activePath} className="flex-1 animate-in overflow-y-auto pb-10 fade-in slide-in-from-bottom-1 duration-300">
        {children}
      </div>
    </div>
  );
}

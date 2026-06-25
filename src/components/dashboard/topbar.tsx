"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { MdMenu, MdNotificationsNone, MdLanguage } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/ui.slice';

export default function Topbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector(state => state.ui.sidebarOpen);

  // Simple title mapper based on pathname
  const getTitle = () => {
    if (pathname === '/') return 'Dashboard';
    const path = pathname?.split('/')[1];
    if (!path) return 'Dashboard';
    return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <header className="h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        {!sidebarOpen && (
          <button 
            onClick={() => dispatch(toggleSidebar())}
            className="text-gray-500 hover:text-gray-700 cursor-pointer p-1"
          >
            <MdMenu className="text-2xl" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Language selector */}
        <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors border border-gray-200 shadow-sm">
          <MdLanguage className="text-lg" />
          <span>English</span>
        </button>

        {/* Notifications */}
        <button className="relative text-gray-500 hover:text-gray-700 cursor-pointer p-2 rounded-full hover:bg-gray-50 transition-colors">
          <MdNotificationsNone className="text-2xl" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">
            5
          </span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-[#0ea5e9] flex items-center justify-center text-xs font-bold text-white shadow-sm group-hover:shadow-md transition-shadow">
            KP
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Kaz Putters</div>
            <div className="text-[10px] text-gray-500">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/ui.slice';
import { 
  MdDashboard, MdCalendarToday, MdAccessTime, MdPeople, 
  MdBusinessCenter, MdLocationOn, MdMeetingRoom, MdAssignment,
  MdPhotoCamera, MdWarning, MdAssessment, MdNotifications, MdSettings,
  MdChevronLeft
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
  { name: 'Reports', href: '/analytics', icon: MdAssessment },
  { name: 'Notifications', href: '/notifications', icon: MdNotifications },
  { name: 'Settings', href: '/settings', icon: MdSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  if (!sidebarOpen) return null; // In a real app, you might want to render a collapsed version

  return (
    <aside className="w-64 bg-[#1a2332] text-gray-300 flex flex-col h-full overflow-hidden shrink-0 transition-all duration-300 relative">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0">
        <div className="w-8 h-8 bg-[#0ea5e9] rounded flex items-center justify-center font-bold text-white text-sm mr-3">
          CO
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-none">CleanOnes</div>
          <div className="text-[10px] text-gray-400 mt-1">Manager Dashboard</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-1 px-3">
          {mainLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-l-2 border-[#0ea5e9]' 
                    : 'hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                }`}
              >
                <link.icon className={`text-lg ${isActive ? 'text-[#0ea5e9]' : 'text-gray-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 mb-2 px-6 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          Quality Control
        </div>
        
        <nav className="space-y-1 px-3">
          {qcLinks.map((link) => {
            const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== '/');
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-l-2 border-[#0ea5e9]' 
                    : 'hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                }`}
              >
                <link.icon className={`text-lg ${isActive ? 'text-[#0ea5e9]' : 'text-gray-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400 border border-white/20">
            Admin
          </div>
        </div>
        
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="w-full flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <MdChevronLeft className="text-lg" />
          Collapse
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
  );
}

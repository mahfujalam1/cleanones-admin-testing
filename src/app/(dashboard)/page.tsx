"use client";

import React from 'react';
import {
  MdShowChart, MdCalendarToday, MdCheckCircleOutline, MdPeopleOutline,
  MdPhotoCamera, MdWarningAmber, MdLocationOn, MdAdd, MdArrowForward
} from 'react-icons/md';
import Link from 'next/link';

const liveOperationsData = [
  { id: 1, initials: 'LV', name: 'Lisa Visser', location: 'NH Hotel Amsterdam', checkIn: '08:00', progress: 75, status: 'On Time', color: 'bg-[#10b981]' },
  { id: 2, initials: 'ES', name: 'Emma Smit', location: 'Hilton Rotterdam', checkIn: '08:12', progress: 90, status: 'Late', color: 'bg-[#f59e0b]' },
  { id: 3, initials: 'NB', name: 'Noah Bos', location: 'UMC Utrecht', checkIn: '—', progress: 15, status: 'Missing', color: 'bg-[#ef4444]' },
  { id: 4, initials: 'SB', name: 'Sophie de Boer', location: 'Van der Valk Eindhoven', checkIn: '07:02', progress: 55, status: 'On Time', color: 'bg-[#10b981]' },
  { id: 5, initials: 'LM', name: 'Lucas Meijer', location: 'NH Hotel Groningen', checkIn: '06:05', progress: 100, status: 'On Time', color: 'bg-[#10b981]' },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState('All');

  const filteredOperations = liveOperationsData.filter(op => {
    if (activeTab === 'All') return true;
    return op.status === activeTab;
  });
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Good morning, Kaz 👋</h2>
          <p className="text-sm text-gray-500">Monday, 9 June 2026 · Here&apos;s what&apos;s happening today</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e0f2fe] text-[#0ea5e9] rounded-full text-xs font-semibold shadow-sm cursor-pointer border border-[#bae6fd]">
          <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse"></span>
          Live Operations Active
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<MdShowChart className="text-[#0ea5e9]" />} value="14" label="Active Shifts" />
        <StatCard icon={<MdCalendarToday className="text-[#8b5cf6]" />} value="38" label="Scheduled Today" />
        <StatCard icon={<MdCheckCircleOutline className="text-[#10b981]" />} value="22" label="Completed Shifts" />
        <StatCard icon={<MdPeopleOutline className="text-[#6366f1]" />} value="8" label="Active Workers" />
        <StatCard icon={<MdPhotoCamera className="text-[#ec4899]" />} value="12" label="Pending Reviews" />
        <StatCard icon={<MdWarningAmber className="text-[#ef4444]" />} value="2" label="Open Escalations" />
        <StatCard icon={<MdLocationOn className="text-[#0ea5e9]" />} value="18" label="Active Locations" />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <MdAdd className="text-[#0ea5e9] text-lg" /> Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link href='/shift-monitoring'><Button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded text-xs px-4 h-8 shadow hover:shadow-md">
            + Create Shift
          </Button>
          </Link>
          <Link href='/clients'><Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded text-xs px-4 h-8 shadow hover:shadow-md">
            <MdAdd className="mr-1" /> Add Client
          </Button>
          </Link>
          <Link href='/locations'><Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded text-xs px-4 h-8 shadow hover:shadow-md">
            <MdAdd className="mr-1" /> Add Location
          </Button>
          </Link>
          <Link href='/photo-reviews'><Button className="bg-[#ec4899] hover:bg-[#db2777] text-white rounded text-xs px-4 h-8 shadow hover:shadow-md">
            <MdPhotoCamera className="mr-1" /> Review Photos
          </Button>
          </Link>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded p-4 shadow-sm flex flex-col justify-center">
          <div className="text-xl font-bold text-[#10b981] flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
            4
          </div>
          <div className="text-xs text-[#059669] font-medium mt-1">Checked In / On Time</div>
        </div>
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded p-4 shadow-sm flex flex-col justify-center">
          <div className="text-xl font-bold text-[#f59e0b] flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
            2
          </div>
          <div className="text-xs text-[#d97706] font-medium mt-1">Late</div>
        </div>
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded p-4 shadow-sm flex flex-col justify-center">
          <div className="text-xl font-bold text-[#ef4444] flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
            2
          </div>
          <div className="text-xs text-[#dc2626] font-medium mt-1">Missing / Not in</div>
        </div>
      </div>

      {/* Live Operations */}
      <Card className="border-0 shadow-sm border border-gray-100 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0ea5e9]"></span>
            Live Operations
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 p-1 rounded text-xs font-medium relative">
              {['All', 'On Time', 'Late', 'Missing'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded cursor-pointer transition-all duration-300 ease-in-out z-10 ${activeTab === tab ? 'bg-[#0ea5e9] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Link href="/shift-monitoring" className="text-xs text-[#0ea5e9] font-medium ml-4 flex items-center hover:underline cursor-pointer">
              View all <MdArrowForward className="ml-1" />
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-100 bg-white transition-all duration-300 min-h-[300px]">
          {filteredOperations.length > 0 ? (
            filteredOperations.map(op => (
              <div key={op.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <LiveOperationRow
                  initials={op.initials}
                  name={op.name}
                  location={op.location}
                  checkIn={op.checkIn}
                  progress={op.progress}
                  status={op.status}
                  color={op.color}
                />
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-gray-500">
              No operations found for this filter.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <Card className="rounded-lg shadow border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-5">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl mb-4">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</div>
          <div className="text-xs text-gray-500 font-medium">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function LiveOperationRow({ initials, name, location, checkIn, progress, status, color }: { initials: React.ReactNode, name: React.ReactNode, location: React.ReactNode, checkIn: React.ReactNode, progress: number, status: React.ReactNode, color: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center text-sm font-bold shadow-sm">
          {initials}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{name}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MdLocationOn className="text-gray-400" /> {location}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-12">
        <div className="text-right">
          <div className="text-[10px] text-gray-400 mb-0.5">Check-In</div>
          <div className="text-sm font-medium text-gray-900">{checkIn}</div>
        </div>

        <div className="w-32">
          <div className="flex justify-between text-[10px] font-medium mb-1.5">
            <span className="text-gray-400">Progress</span>
            <span className="text-gray-700">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="w-24 flex justify-end">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${color}`}></span>
            <span className={status === 'On Time' ? 'text-[#10b981]' : 'text-[#f59e0b]'}>{status}</span>
          </div>
        </div>

        <MdArrowForward className="text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </div>
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


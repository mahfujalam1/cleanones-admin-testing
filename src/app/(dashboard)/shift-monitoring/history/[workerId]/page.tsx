"use client";

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdAccessTime, MdOutlineCalendarMonth } from 'react-icons/md';
import { TbClock, TbCalendarStats, TbAlertTriangle, TbUserOff, TbCheck } from 'react-icons/tb';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

type Activity = {
  worker_name: string;
  worker_type?: string;
  profile_picture?: string;
  total_hours_worked: string;
  attendance_percentage: string;
  total_shifts: number;
  late_days: number;
  absent_days: number;
  daily_activity: Array<{
    shift_id: string;
    date: string;
    check_in_time: string;
    check_out_time: string;
    total_hours: string;
    status: string;
  }>;
};

const statusBadge = (status?: string) => {
  const value = (status || '').toLowerCase();
  if (value.includes('late')) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
        <TbAlertTriangle className="text-xs" />
        Late
      </span>
    );
  }
  if (value.includes('absent')) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
        <TbUserOff className="text-xs" />
        Absent
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
      <TbCheck className="text-xs" />
      On Time
    </span>
  );
};

export default function WorkerHistoryPage({ params }: { params: Promise<{ workerId: string }> }) {
  const router = useRouter();
  const { workerId } = use(params);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));


  const data = null as Activity | null;
  const loading = false;
  const error = '';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
        >
          <MdArrowBack className="text-base text-slate-500" />
          Back to Attendance
        </button>

        <span className="text-xs text-slate-400 font-mono">
          Worker ID: #{workerId}
        </span>
      </div>

      
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={data?.profile_picture || '/avatar-placeholder.svg'}
            alt={data?.worker_name || 'Worker'}
            className="h-13 w-13 rounded-full border border-slate-200 object-cover shadow-2xs"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-medium text-slate-900 tracking-tight">
                {data?.worker_name || 'Worker Activity'}
              </h1>
              {data?.worker_type && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 capitalize">
                  {data.worker_type}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Daily attendance logs, shift records, and hours worked.
            </p>
          </div>
        </div>

        
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <MdOutlineCalendarMonth className="text-lg" />
          </span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-normal text-slate-700 shadow-2xs cursor-pointer focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <p className="font-medium">Unable to load worker daily activity</p>
          <p className="mt-0.5 text-red-600">{error}</p>
        </div>
      )}

      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          label="Total Hours"
          value={data?.total_hours_worked || '0h'}
          icon={<TbClock className="text-base" />}
          subtitle="Hours completed"
        />
        <MetricCard
          label="Attendance Rate"
          value={data?.attendance_percentage || '0%'}
          icon={<TbCheck className="text-base" />}
          subtitle="Monthly rate"
        />
        <MetricCard
          label="Total Shifts"
          value={data?.total_shifts ?? 0}
          icon={<TbCalendarStats className="text-base" />}
          subtitle="Shifts scheduled"
        />
        <MetricCard
          label="Late Days"
          value={data?.late_days ?? 0}
          icon={<TbAlertTriangle className="text-base" />}
          subtitle="Late check-ins"
          alert={(data?.late_days ?? 0) > 0}
        />
        <MetricCard
          label="Absent Days"
          value={data?.absent_days ?? 0}
          icon={<TbUserOff className="text-base" />}
          subtitle="Unexcused absents"
          danger={(data?.absent_days ?? 0) > 0}
        />
      </div>

      
      <div className="dashboard-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-700">
              Shift Records for {month}
            </h2>
            <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {data?.daily_activity?.length ?? 0} records
            </span>
          </div>
          <p className="text-[11px] text-slate-400">All timestamps in local site time</p>
        </header>

        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Shift Reference</th>
                  <th className="px-6 py-3.5">Check In</th>
                  <th className="px-6 py-3.5">Check Out</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm bg-white">
                {(data?.daily_activity ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <TbCalendarStats className="text-2xl" />
                      </div>
                      <p className="text-sm font-medium text-slate-800">No activity recorded for this month</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try selecting another month in the selector above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  data?.daily_activity.map((row) => (
                    <tr key={row.shift_id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-medium text-slate-900 text-xs">
                        {row.date}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className="font-mono text-xs text-slate-500 max-w-[200px] block truncate"
                          title={row.shift_id}
                        >
                          {row.shift_id}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600 font-normal">
                        <span className="flex items-center gap-1.5">
                          <MdAccessTime className="text-slate-400 text-xs" />
                          {row.check_in_time || '--:--'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600 font-normal">
                        <span className="flex items-center gap-1.5">
                          <MdAccessTime className="text-slate-400 text-xs" />
                          {row.check_out_time || '--:--'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900 text-xs">
                          {row.total_hours}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {statusBadge(row.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  subtitle,
  alert = false,
  danger = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle: string;
  alert?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</span>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            danger
              ? 'bg-rose-50 text-rose-600'
              : alert
              ? 'bg-amber-50 text-amber-600'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {icon}
        </span>
      </div>
      <p
        className={`mt-2 text-2xl font-medium tracking-tight ${
          danger ? 'text-rose-600' : alert ? 'text-amber-600' : 'text-slate-900'
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-slate-400">{subtitle}</p>
    </div>
  );
}

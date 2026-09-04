"use client";
import { useState } from "react";
import { MdAccessTime, MdLocationOn, MdSearch } from "react-icons/md";
import { TableSkeleton } from "@/components/shared/SkeletonLoader";
import { type LiveWorker } from "@/services/actions/shiftMonitoring";
import { useGetLiveStatusQuery } from "@/redux/api/shiftMonitoringApi";
import { EmployeeSidebar } from "@/components/shift-monitoring/EmployeeSidebar";
import type { WorkerInfo } from "@/components/shift-monitoring/types";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

const mapWorker = (item: LiveWorker): WorkerInfo => ({
  id: item.worker_id,
  initials: "",
  name: item.worker_name,
  role: item.worker_type.toLowerCase() === "freelancer" ? "Freelancer" : "Employee",
  shiftId: item.shift_id,
  location: item.location_name,
  checkIn: item.checkin_time,
  status: item.status.toLowerCase() === "late" ? "Late" : item.status.toLowerCase() === "missing" ? "Missing" : "On Time",
  color: "bg-sky-500",
  statusColor: "text-sky-500",
  hoursWorked: item.hours_worked_numeric,
  totalShifts: 0,
  lateDays: 0,
  avgDuration: "0h",
});

export default function LiveStatusPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const [selected, setSelected] = useState<WorkerInfo | null>(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const { data: statusRes, isLoading: loading } = useGetLiveStatusQuery({
    status: status || undefined,
    search: search.trim() || undefined,
  });

  const items = statusRes?.items ?? [];
  const counts = {
    total: statusRes?.total_shifts_count ?? 0,
    ontime: statusRes?.ontime_count ?? 0,
    late: statusRes?.late_count ?? 0,
    missing: statusRes?.missing_count ?? 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{t.shiftMonitoring.title}</h1>
          <p className="text-xs text-slate-500">
            {counts.total} {t.shiftMonitoring.shiftsCount} · {counts.ontime} {t.shiftMonitoring.onTimeCount} · {counts.late} {t.shiftMonitoring.lateCount} · {counts.missing} {t.shiftMonitoring.missingCount}
          </p>
        </div>
        <div className="flex gap-2">
          <label className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.shiftMonitoring.searchPlaceholder}
              className="h-9 rounded border bg-white pl-9 pr-3 text-xs"
            />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded border bg-white px-3 text-xs">
            <option value="">{t.shiftMonitoring.allStatuses}</option>
            <option value="ontime">{t.shiftMonitoring.onTime}</option>
            <option value="late">{t.shiftMonitoring.late}</option>
            <option value="missing">{t.shiftMonitoring.missing}</option>
          </select>
        </div>
      </div>
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <div className="rounded border bg-white">
          <TableSkeleton rows={8} columns={6} />
        </div>
      ) : (
        <div className="overflow-hidden rounded border bg-white">
          <div className="divide-y">
            {items.map((item) => (
              <button
                key={`${item.worker_id}-${item.shift_id}`}
                onClick={() => setSelected(mapWorker(item))}
                className="grid w-full gap-3 p-4 text-left hover:bg-slate-50 md:grid-cols-[1.2fr_1fr_1fr_1fr_100px]"
              >
                <span className="font-semibold text-slate-800">
                  {item.worker_name}
                  <small className="block font-normal text-slate-400">{item.worker_type}</small>
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <MdLocationOn />
                  {item.location_name}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <MdAccessTime />
                  {item.shift_start_time}–{item.shift_end_time}
                </span>
                <span className="text-xs">
                  {item.hours_worked_display} · {item.progress_percentage}%
                </span>
                <span className="text-xs font-semibold">{item.status}</span>
              </button>
            ))}
            {items.length === 0 && <p className="py-16 text-center text-sm text-slate-500">{t.shiftMonitoring.noLiveShifts}</p>}
          </div>
        </div>
      )}
      {selected && <EmployeeSidebar worker={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

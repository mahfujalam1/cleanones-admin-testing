"use client";
import { useState } from "react";
import { MdAccessTime, MdChevronRight, MdClose, MdLocationOn, MdSearch } from "react-icons/md";
import { TbActivity, TbAlertTriangle, TbCircleCheck, TbUserOff } from "react-icons/tb";
import { type LiveWorker } from "@/services/actions/shiftMonitoring";
import { useGetLiveStatusQuery } from "@/redux/api/shiftMonitoringApi";
import { EmployeeDetailsModal } from "@/components/shift-monitoring/EmployeeDetailsModal";
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

const statusTone = (status: string) => {
  const value = status.toLowerCase();
  if (value.includes("late")) return { chip: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" };
  if (value.includes("missing")) return { chip: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500" };
  return { chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" };
};

export default function LiveStatusPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const [selected, setSelected] = useState<WorkerInfo | null>(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { data: statusRes, isFetching: loading, refetch } = useGetLiveStatusQuery({
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

  const statusOptions = [
    { value: "", label: t.shiftMonitoring.allStatuses },
    { value: "ontime", label: t.shiftMonitoring.onTime },
    { value: "late", label: t.shiftMonitoring.late },
    { value: "missing", label: t.shiftMonitoring.missing },
  ];

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-600">
          <TbActivity className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold leading-tight text-slate-900">{t.shiftMonitoring.title}</h1>
          <p className="truncate text-xs text-slate-500">Live check-in status for every shift running right now.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<TbActivity />} value={counts.total} label={t.shiftMonitoring.shiftsCount} tone="bg-slate-100 text-slate-600" />
        <StatCard icon={<TbCircleCheck />} value={counts.ontime} label={t.shiftMonitoring.onTimeCount} tone="bg-emerald-50 text-emerald-600" accent="text-emerald-700" />
        <StatCard icon={<TbAlertTriangle />} value={counts.late} label={t.shiftMonitoring.lateCount} tone="bg-amber-50 text-amber-600" accent="text-amber-700" />
        <StatCard icon={<TbUserOff />} value={counts.missing} label={t.shiftMonitoring.missingCount} tone="bg-red-50 text-red-600" accent="text-red-700" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.shiftMonitoring.searchPlaceholder}
            className="w-full rounded-lg bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <MdClose />
            </button>
          )}
        </div>

        <div className="flex max-w-full shrink-0 overflow-x-auto rounded-lg bg-slate-100 p-1 text-xs font-medium">
          {statusOptions.map((option) => (
            <button
              key={option.value || "all"}
              onClick={() => setStatus(option.value)}
              className={`shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3.5 py-1.5 transition-all ${status === option.value ? "bg-white font-semibold text-primary shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100/70" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <TbActivity className="text-3xl" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t.shiftMonitoring.noLiveShifts}</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            {search || status ? t.common.adjustFilters : "Nothing is running at the moment."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const worker = mapWorker(item);
            const tone = statusTone(worker.status);
            const progress = Math.min(100, Math.max(0, item.progress_percentage ?? 0));
            return (
              <button
                key={`${item.worker_id}-${item.shift_id}`}
                onClick={() => setSelected(worker)}
                className="group w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.profile_picture || item.profile_photo || "/avatar-placeholder.svg"}
                    alt={item.worker_name}
                    className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-primary">{item.worker_name}</b>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${tone.chip}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                        {worker.status}
                      </span>
                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600">
                        {item.worker_type}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex min-w-0 items-center gap-1">
                        <MdLocationOn className="shrink-0 text-sm text-slate-400" />
                        <span className="truncate">{item.location_name}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MdAccessTime className="shrink-0 text-sm text-slate-400" />
                        {item.shift_start_time}–{item.shift_end_time}
                      </span>
                    </div>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-bold text-slate-900">{item.hours_worked_display}</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">worked</p>
                  </div>

                  <MdChevronRight className="mt-2 shrink-0 text-lg text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>

                {/* Progress */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-500">{progress}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <EmployeeDetailsModal
          worker={selected}
          onClose={() => setSelected(null)}
          onChanged={() => { void refetch(); }}
        />
      )}
    </div>
  );
}

function StatCard({ icon, value, label, tone, accent }: { icon: React.ReactNode; value: number; label: string; tone: string; accent?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${tone}`}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`text-lg font-bold leading-tight ${accent ?? "text-slate-900"}`}>{value}</p>
      </div>
    </div>
  );
}

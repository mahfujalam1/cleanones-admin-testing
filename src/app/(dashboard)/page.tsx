"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MdAccessTime, MdAdd, MdArrowForward, MdBusiness, MdCall, MdCalendarToday, MdCheckCircle, MdClose, MdLocationOn, MdPeople, MdUploadFile, MdWarningAmber } from "react-icons/md";
import { CardGridSkeleton, DetailSkeleton } from "@/components/shared/SkeletonLoader";
import { getDashboardOverview, getInProgressShifts, getWorkerAttendanceSummary, type DashboardOverview, type InProgressShift } from "@/services/actions/dashboard";

const normalizeStatus = (value: string) => value.toLowerCase().replaceAll(" ", "_");
const uniqueBy = <T,>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [shifts, setShifts] = useState<InProgressShift[]>([]);
  const [filter, setFilter] = useState("");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLateWorker, setSelectedLateWorker] = useState<{
    worker_name: string;
    late_duration_text: string;
    phone_number: string;
    delay_reason?: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      void Promise.all([
        getDashboardOverview(filter || undefined),
        getInProgressShifts(),
        getWorkerAttendanceSummary(),
      ]).then(([home, progress, attendance]) => {
        if (!active) return;
        setLoading(false);
        const errors = [home, progress, attendance]
          .filter((item) => !item.success)
          .map((item) => (!item.success ? item.error : ""));
        if (errors.length) setError(errors.join(" · "));
        else setError("");
        if (home.success) setOverview(home.data);
        if (progress.success) setShifts(progress.data.shifts);
      });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [filter]);

  if (loading && !overview) return <div className="space-y-5"><DetailSkeleton blocks={2} /><CardGridSkeleton cards={4} /><DetailSkeleton blocks={7} /></div>;
  if (!overview) return <p className="rounded bg-red-50 p-4 text-sm text-red-700">{error || "Dashboard could not be loaded"}</p>;

  const attentionPills = uniqueBy(overview.attention_banner.call_pills, (item) => item.worker_id);
  const liveGroups = uniqueBy(overview.live_operations_by_client, (group) => `${group.client_id}-${group.location_id}`).map((group) => ({
    ...group,
    workers: uniqueBy(group.workers, (worker) => worker.worker_id),
  }));
  const fallingBehind = uniqueBy(shifts, (item) => `${item.shift_id}-${item.worker_id}`).filter((item) => {
    const progress = Number.parseFloat(item.progress_percentage) || item.progress;
    return progress > 0 && progress < 80;
  });
  const cards = overview.summary_cards;

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-sky-600">Operations overview</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{overview.greeting}</h1>
          <p className="mt-1 text-sm text-slate-500">{overview.subtitle_date}</p>
        </div>
        <div className="relative">
          <button onClick={() => setActionsOpen((open) => !open)} className="flex h-10 items-center gap-2 rounded bg-sky-500 px-4 text-sm font-semibold text-white">
            <MdAdd />Create or add
          </button>
          {actionsOpen && (
            <div className="absolute right-0 z-20 mt-2 w-56 rounded border bg-white p-1.5 shadow">
              {[["Create a shift", "/roster", MdCalendarToday], ["Add client or location", "/clients", MdBusiness], ["Bulk import data", "/users", MdUploadFile]].map(([label, href, Icon]) => (
                <Link key={label as string} href={href as string} className="flex items-center gap-3 rounded px-3 py-2.5 text-sm hover:bg-slate-50">
                  <Icon className="text-sky-500" />{label as string}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}

      {/* Red Attention Banner */}
      <section className={`rounded-xl border p-4 ${overview.attention_banner.people_need_attention_count > 0 ? "border-red-200 bg-red-50/70" : "border-slate-200 bg-white"}`}>
        <div className="flex flex-wrap items-center gap-4">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white ${overview.attention_banner.people_need_attention_count > 0 ? "bg-red-500 shadow-xs" : "bg-emerald-500"}`}>
            {overview.attention_banner.people_need_attention_count > 0 ? <MdWarningAmber className="text-2xl" /> : <MdCheckCircle className="text-2xl" />}
          </span>
          <div className="flex-1 min-w-48">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className={`font-bold ${overview.attention_banner.people_need_attention_count > 0 ? "text-red-950" : "text-slate-900"}`}>
                {overview.attention_banner.people_need_attention_count} people need attention
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${overview.attention_banner.people_need_attention_count > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                {overview.attention_banner.people_need_attention_count > 0 ? overview.attention_banner.badge_text : "All on time"}
              </span>
            </div>
            <p className={`text-xs sm:text-sm mt-0.5 ${overview.attention_banner.people_need_attention_count > 0 ? "text-red-700" : "text-slate-500"}`}>
              {overview.attention_banner.people_need_attention_count > 0 ? overview.attention_banner.banner_subtitle : "No workers require immediate attention or replacement."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {attentionPills.length > 0 ? (
              attentionPills.map((item) => (
                <button
                  key={item.worker_id}
                  onClick={() => setSelectedLateWorker({
                    worker_name: item.worker_name,
                    late_duration_text: item.late_duration_text,
                    phone_number: item.phone_number,
                  })}
                  title={item.worker_name}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <img src="/avatar-placeholder.svg" alt={item.worker_name} className="h-6 w-6 rounded-full" />
                  <span>{item.late_duration_text}</span>
                  <MdCall className="text-sm" />
                </button>
              ))
            ) : (
              <span className="text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-1.5">
                ✓ All shifts on schedule
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Yellow Falling Behind Banner */}
      <section className={`rounded-xl border p-4 ${fallingBehind.length > 0 ? "border-amber-200 bg-amber-50/70" : "border-slate-200 bg-white"}`}>
        <div className="flex items-center gap-2">
          <MdAccessTime className={`text-lg ${fallingBehind.length > 0 ? "text-amber-600" : "text-slate-400"}`} />
          <h2 className={`font-bold text-sm sm:text-base ${fallingBehind.length > 0 ? "text-amber-950" : "text-slate-900"}`}>
            Falling behind schedule
          </h2>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${fallingBehind.length > 0 ? "bg-amber-200/90 text-amber-900" : "bg-slate-100 text-slate-600"}`}>
            {fallingBehind.length} alerts
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {fallingBehind.length > 0 ? "Shift is nearly over and assigned objects may not finish on time." : "All active shifts are currently progressing according to schedule."}
        </p>
        {fallingBehind.length > 0 && (
          <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
            {fallingBehind.slice(0, 6).map((item) => {
              const progress = Number.parseFloat(item.progress_percentage) || item.progress;
              return (
                <div key={`${item.shift_id}-${item.worker_id}`} className="rounded-lg border border-amber-200/80 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <img src={item.worker_profile_picture || "/avatar-placeholder.svg"} alt={item.worker_name} className="h-9 w-9 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <b className="block text-sm truncate text-slate-900">{item.worker_name}</b>
                      <p className="text-xs text-slate-500 truncate">{item.location_name} · {item.shift_start_time}–{item.shift_end_time}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 shrink-0">{item.progress_percentage || `${progress}%`}</span>
                    <a href={`tel:${item.worker_name}`} className="flex h-8 items-center gap-1 rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs">
                      <MdCall /> Call
                    </a>
                  </div>
                  <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4 Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<MdAccessTime />} value={cards.active_shifts_count} label="Active shifts" tone="bg-sky-50 text-sky-600" />
        <Metric icon={<MdPeople />} value={cards.workers_on_site_count} label="Workers on site" tone="bg-violet-50 text-violet-600" />
        <Metric icon={<MdWarningAmber />} value={cards.late_no_show_count} label="Late / no show" tone="bg-red-50 text-red-600" />
        <Metric icon={<MdCheckCircle />} value={cards.reviews_pending_count} label="Reviews pending" tone="bg-amber-50 text-amber-600" />
      </div>

      {/* Live Operations by Client */}
      <section className="dashboard-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div>
            <h2 className="font-bold text-slate-900">Live operations by client</h2>
            <p className="text-xs text-slate-500">Locations first, then people working there</p>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1">
            {[["", "All"], ["on_time", "On time"], ["late", "Late"], ["no_show", "No show"]].map(([value, text]) => (
              <button key={text} onClick={() => setFilter(value)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${filter === value ? "bg-white text-sky-600 shadow-2xs" : "text-slate-500 hover:text-slate-700"}`}>
                {text}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {liveGroups.map((group) => (
            <div key={`${group.client_id}-${group.location_id}`} className="p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-lg bg-sky-50 p-2 text-sky-600">
                  <MdLocationOn className="text-base" />
                </span>
                <div>
                  <b className="block text-sm text-slate-900">{group.client_company_name}</b>
                  <span className="text-xs text-slate-500">{group.location_name}</span>
                </div>
                <span className="ml-auto text-xs text-slate-400">{group.roster_count_text}</span>
                <Link href={`/live-operations?clientId=${encodeURIComponent(group.client_id)}&locationId=${encodeURIComponent(group.location_id)}`} className="text-xs font-semibold text-sky-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-1.5">
                {group.workers.slice(0, 4).map((worker) => (
                  <div key={worker.worker_id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition-colors">
                    <img src={worker.profile_picture || "/avatar-placeholder.svg"} alt={worker.name} className="h-9 w-9 rounded-full object-cover" />
                    <span className="flex-1 min-w-0">
                      <b className="block text-sm truncate text-slate-900">{worker.name}</b>
                      <small className="text-slate-500 truncate block">{worker.shift_time_range}{worker.delay_reason ? ` · ${worker.delay_reason}` : ""}</small>
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${normalizeStatus(worker.status).includes("late") ? "bg-amber-100 text-amber-800" : normalizeStatus(worker.status).includes("show") || normalizeStatus(worker.status).includes("missing") ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                      {worker.status_badge_label}
                    </span>
                    {worker.can_call && (
                      <a href={`tel:${worker.phone_number}`} className="flex h-8 items-center gap-1 rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs">
                        <MdCall />Call
                      </a>
                    )}
                    <Link href="/shift-monitoring">
                      <MdArrowForward className="text-slate-400 hover:text-slate-700 text-base" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {liveGroups.length === 0 && <p className="py-16 text-center text-sm text-slate-500">No live operations found</p>}
        </div>
      </section>

      {/* Escalations Banner */}
      <Link href="/escalations" className="dashboard-card flex items-center gap-4 p-5 hover:border-amber-300 transition-colors">
        <MdWarningAmber className="text-2xl text-amber-500" />
        <div>
          <p className="font-bold text-slate-900">{overview.open_escalations_banner.open_escalations_count} open escalations</p>
          <p className="text-xs text-slate-500">{overview.open_escalations_banner.subtitle}</p>
        </div>
        <MdArrowForward className="ml-auto text-slate-400" />
      </Link>

      {/* Attendance Alert Modal (Matching Screenshot 1) */}
      {selectedLateWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">
                Attendance Alert
              </span>
              <button
                type="button"
                onClick={() => setSelectedLateWorker(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer transition-colors"
              >
                <MdClose className="text-lg" />
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-3">{selectedLateWorker.worker_name}</h3>
            <div className="rounded-lg bg-red-50 p-4 text-red-700 border border-red-100 mb-4">
              <b className="block text-sm font-bold">{selectedLateWorker.late_duration_text || "Late"}</b>
              {selectedLateWorker.delay_reason && (
                <p className="text-xs text-red-600 mt-1">Reason: {selectedLateWorker.delay_reason}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${selectedLateWorker.phone_number}`}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg border border-emerald-600 text-emerald-700 text-xs font-semibold hover:bg-emerald-50 transition-colors"
              >
                <MdCall className="text-sm" />
                Call employee
              </a>
              <button
                type="button"
                onClick={() => {
                  setSelectedLateWorker(null);
                }}
                className="flex-1 flex items-center justify-center h-10 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors shadow-xs cursor-pointer"
              >
                Mark sick & replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ icon, value, label, tone }: { icon: React.ReactNode; value: number; label: string; tone: string }) {
  return (
    <div className="dashboard-card min-h-32 p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${tone}`}>{icon}</span>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

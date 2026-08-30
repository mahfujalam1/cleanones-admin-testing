"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MdAccessTime, MdAdd, MdArrowForward, MdBusiness, MdCall, MdCalendarToday, MdCheckCircle, MdLocationOn, MdPeople, MdUploadFile, MdWarningAmber } from "react-icons/md";
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
  const [overview, setOverview] = useState<DashboardOverview | null>(null); const [shifts, setShifts] = useState<InProgressShift[]>([]); const [filter, setFilter] = useState(""); const [actionsOpen, setActionsOpen] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
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
  const fallingBehind = uniqueBy(shifts, (item) => `${item.shift_id}-${item.worker_id}`).filter((item) => { const progress = Number.parseFloat(item.progress_percentage) || item.progress; return progress > 0 && progress < 80; }); const cards = overview.summary_cards;
  return <div className="space-y-6 pb-10"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-sky-600">Operations overview</p><h1 className="mt-1 text-2xl font-bold text-slate-950">{overview.greeting}</h1><p className="mt-1 text-sm text-slate-500">{overview.subtitle_date}</p></div><div className="relative"><button onClick={() => setActionsOpen((open) => !open)} className="flex h-10 items-center gap-2 rounded bg-sky-500 px-4 text-sm font-semibold text-white"><MdAdd />Create or add</button>{actionsOpen && <div className="absolute right-0 z-20 mt-2 w-56 rounded border bg-white p-1.5 shadow">{[["Create a shift", "/roster", MdCalendarToday], ["Add client or location", "/clients", MdBusiness], ["Bulk import data", "/users", MdUploadFile]].map(([label, href, Icon]) => <Link key={label as string} href={href as string} className="flex items-center gap-3 rounded px-3 py-2.5 text-sm hover:bg-slate-50"><Icon className="text-sky-500" />{label as string}</Link>)}</div>}</div></header>
    {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    {overview.attention_banner.people_need_attention_count > 0 && <section className="rounded border border-red-200 bg-red-50 p-4"><div className="flex flex-wrap items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded bg-red-500 text-white"><MdWarningAmber className="text-2xl" /></span><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-red-950">{overview.attention_banner.people_need_attention_count} people need attention</h2><span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">{overview.attention_banner.badge_text}</span></div><p className="text-sm text-red-700">{overview.attention_banner.banner_subtitle}</p></div><div className="flex flex-wrap gap-2">{attentionPills.map((item) => <a key={item.worker_id} href={`tel:${item.phone_number}`} title={item.worker_name} className="flex items-center gap-2 rounded border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700"><img src="/avatar-placeholder.svg" alt={item.worker_name} className="h-6 w-6 rounded-full" />{item.late_duration_text}<MdCall /></a>)}</div></div></section>}
    {fallingBehind.length > 0 && <section className="rounded border border-amber-200 bg-amber-50 p-4"><h2 className="font-bold text-amber-950">Falling behind schedule <span className="ml-2 rounded bg-amber-200 px-2 py-1 text-xs">{fallingBehind.length} alerts</span></h2><div className="mt-3 grid gap-2 lg:grid-cols-2">{fallingBehind.slice(0, 6).map((item) => { const progress = Number.parseFloat(item.progress_percentage) || item.progress; return <div key={`${item.shift_id}-${item.worker_id}`} className="rounded border border-amber-200 bg-white p-3"><div className="flex items-center gap-3"><img src={item.worker_profile_picture || "/avatar-placeholder.svg"} alt={item.worker_name} className="h-9 w-9 rounded-full" /><div className="flex-1"><b className="text-sm">{item.worker_name}</b><p className="text-xs text-slate-500">{item.location_name} · {item.shift_start_time}–{item.shift_end_time}</p></div><b className="text-xs text-amber-700">{item.progress_percentage || `${progress}%`}</b></div><div className="mt-2 h-1.5 rounded bg-slate-100"><div className="h-full rounded bg-amber-500" style={{ width: `${Math.min(progress, 100)}%` }} /></div></div>; })}</div></section>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<MdAccessTime />} value={cards.active_shifts_count} label="Active shifts" tone="bg-sky-50 text-sky-600" /><Metric icon={<MdPeople />} value={cards.workers_on_site_count} label="Workers on site" tone="bg-violet-50 text-violet-600" /><Metric icon={<MdWarningAmber />} value={cards.late_no_show_count} label="Late / no show" tone="bg-red-50 text-red-600" /><Metric icon={<MdCheckCircle />} value={cards.reviews_pending_count} label="Reviews pending" tone="bg-amber-50 text-amber-600" /></div>
    <section className="dashboard-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-5"><div><h2 className="font-bold">Live operations by client</h2><p className="text-xs text-slate-500">Locations first, then people working there</p></div><div className="flex rounded bg-slate-100 p-1">{[["", "All"], ["on_time", "On time"], ["late", "Late"], ["no_show", "No show"]].map(([value, text]) => <button key={text} onClick={() => setFilter(value)} className={`rounded px-3 py-1.5 text-xs font-semibold ${filter === value ? "bg-white text-sky-600 shadow-sm" : "text-slate-500"}`}>{text}</button>)}</div></div><div className="divide-y">{liveGroups.map((group) => <div key={`${group.client_id}-${group.location_id}`} className="p-5"><div className="mb-3 flex items-center gap-3"><span className="rounded bg-sky-50 p-2 text-sky-600"><MdLocationOn /></span><div><b className="block text-sm">{group.client_company_name}</b><span className="text-xs text-slate-500">{group.location_name}</span></div><span className="ml-auto text-xs text-slate-400">{group.roster_count_text}</span><Link href={`/live-operations?clientId=${encodeURIComponent(group.client_id)}&locationId=${encodeURIComponent(group.location_id)}`} className="text-xs font-semibold text-sky-600 hover:underline">View all</Link></div><div className="space-y-1">{group.workers.slice(0, 4).map((worker) => <div key={worker.worker_id} className="flex items-center gap-3 rounded border p-3"><img src={worker.profile_picture || "/avatar-placeholder.svg"} alt={worker.name} className="h-9 w-9 rounded-full object-cover" /><span className="flex-1"><b className="block text-sm">{worker.name}</b><small className="text-slate-500">{worker.shift_time_range}{worker.delay_reason ? ` · ${worker.delay_reason}` : ""}</small></span><span className={`rounded px-2 py-1 text-xs ${normalizeStatus(worker.status).includes("late") ? "bg-amber-100 text-amber-700" : normalizeStatus(worker.status).includes("show") || normalizeStatus(worker.status).includes("missing") ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{worker.status_badge_label}</span>{worker.can_call && <a href={`tel:${worker.phone_number}`} className="flex h-8 items-center gap-1 rounded bg-emerald-600 px-3 text-xs font-semibold text-white"><MdCall />Call</a>}<Link href="/shift-monitoring"><MdArrowForward className="text-slate-300" /></Link></div>)}</div></div>)}{liveGroups.length === 0 && <p className="py-16 text-center text-sm text-slate-500">No live operations found</p>}</div></section>
    <Link href="/escalations" className="dashboard-card flex items-center gap-4 p-5 hover:border-amber-300"><MdWarningAmber className="text-2xl text-amber-500" /><div><p className="font-bold">{overview.open_escalations_banner.open_escalations_count} open escalations</p><p className="text-xs text-slate-500">{overview.open_escalations_banner.subtitle}</p></div><MdArrowForward className="ml-auto" /></Link>
  </div>;
}
function Metric({ icon, value, label, tone }: { icon: React.ReactNode; value: number; label: string; tone: string }) { return <div className="dashboard-card min-h-32 p-5"><span className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${tone}`}>{icon}</span><p className="mt-4 text-2xl font-bold">{value.toLocaleString()}</p><p className="text-xs text-slate-500">{label}</p></div>; }

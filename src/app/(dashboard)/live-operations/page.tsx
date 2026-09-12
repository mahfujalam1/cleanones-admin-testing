"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MdCall, MdLocationOn, MdSearch } from "react-icons/md";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";
import { getDashboardOverview, type DashboardOverview } from "@/services/actions/dashboard";

const uniqueBy = <T,>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

function LiveOperationsContent() {
  const params = useSearchParams(); const clientId = params.get("clientId"); const locationId = params.get("locationId"); const [data, setData] = useState<DashboardOverview | null>(null); const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      void getDashboardOverview(status || undefined).then((result) => {
        if (!active) return;
        setLoading(false);
        if (!result.success) return setError(result.error);
        setError("");
        setData(result.data);
      });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [status]);
  const groups = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return uniqueBy(
      data?.live_operations_by_client ?? [],
      (group) => `${group.client_id}-${group.location_id}`,
    )
      .filter(
        (group) =>
          (!clientId || group.client_id === clientId) &&
          (!locationId || group.location_id === locationId),
      )
      .map((group) => ({
        ...group,
        workers: uniqueBy(group.workers, (worker) => worker.worker_id).filter((worker) =>
          `${worker.name} ${worker.status} ${group.client_company_name} ${group.location_name}`
            .toLowerCase()
            .includes(normalizedSearch),
        ),
      }))
      .filter((group) => group.workers.length > 0);
  }, [data, clientId, locationId, search]);
  return <div className="space-y-5 pb-10"><div><h1 className="text-xl font-bold text-slate-900">Live Operations</h1><p className="text-xs text-slate-500">All live workers grouped by client and location.</p></div><div className="flex flex-wrap gap-2"><label className="relative flex-1"><MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workers or locations..." className="h-10 w-full rounded border bg-white pl-9 pr-3 text-sm" /></label><select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded border bg-white px-3 text-sm"><option value="">All statuses</option><option value="on_time">On time</option><option value="late">Late</option><option value="no_show">No show</option></select></div>{error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading ? <DetailSkeleton blocks={8} /> : <div className="space-y-4">{groups.map((group) => <section key={`${group.client_id}-${group.location_id}`} className="dashboard-card overflow-hidden"><header className="flex items-center gap-3 border-b p-4"><MdLocationOn className="text-sky-500" /><div><b className="block text-sm">{group.client_company_name}</b><span className="text-xs text-slate-500">{group.location_name}</span></div><span className="ml-auto text-xs text-slate-400">{group.roster_count_text}</span></header><div className="divide-y">{group.workers.map((worker) => <div key={worker.worker_id} className="flex items-center gap-3 p-4"><img src={worker.profile_picture || "/avatar-placeholder.svg"} alt={worker.name} className="h-10 w-10 rounded-full object-cover" /><div className="flex-1"><b className="block text-sm">{worker.name}</b><span className="text-xs text-slate-500">{worker.shift_time_range}{worker.delay_reason ? ` · ${worker.delay_reason}` : ""}</span></div><span className="rounded bg-slate-100 px-2 py-1 text-xs">{worker.status_badge_label}</span>{worker.can_call && <a href={`tel:${worker.phone_number}`} className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"><MdCall />Call</a>}</div>)}</div></section>)}{groups.length === 0 && <p className="py-16 text-center text-sm text-slate-500">No live operations found</p>}</div>}</div>;
}
export default function LiveOperationsPage() { return <Suspense fallback={<DetailSkeleton blocks={8} />}><LiveOperationsContent /></Suspense>; }

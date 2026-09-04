"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MdClose, MdOutlinePerson, MdSearch, MdWarningAmber } from "react-icons/md";
import { CardGridSkeleton, DetailSkeleton } from "@/components/shared/SkeletonLoader";
import { getEscalation, updateEscalationStatus, type EscalationApi } from "@/services/actions/escalations";
import { useGetEscalationsQuery } from "@/redux/api/escalationsApi";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

const severityStyle: Record<string, string> = { emergency: "border-l-red-500 text-red-500 bg-red-50", high: "border-l-amber-500 text-amber-500 bg-amber-50", medium: "border-l-sky-500 text-sky-500 bg-sky-50", low: "border-l-emerald-500 text-emerald-500 bg-emerald-50" };
const statusStyle: Record<string, string> = { open: "text-red-500", in_progress: "text-amber-500", resolved: "text-emerald-500", closed: "text-slate-500" };
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function EscalationsPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const [search, setSearch] = useState(""); const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<EscalationApi | null>(null); const [drawerLoading, setDrawerLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: escalationsRes, isLoading: loading, refetch } = useGetEscalationsQuery({ search: search.trim() || undefined, status: status || undefined });
  const items = escalationsRes?.escalations ?? [];
  const counts = {
    open: escalationsRes?.open_count ?? 0,
    progress: escalationsRes?.in_progress_count ?? 0,
    resolved: escalationsRes?.resolved_count ?? 0,
  };

  const openDrawer = async (item: EscalationApi) => { setSelected(item); setDrawerLoading(true); const result = await getEscalation(item.escalation_id); setDrawerLoading(false); if (result.success) setSelected(result.data); else setError(result.error); };
  const update = async (next: string, notes: string) => { if (!selected) return false; const result = await updateEscalationStatus(selected.escalation_id, next, notes); if (!result.success) { setError(result.error); return false; } setSelected(null); void refetch(); return true; };

  return <div className="space-y-5 pb-10">
    <div className="flex flex-wrap gap-2"><div className="relative min-w-[260px] flex-1"><MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.escalations.searchPlaceholder} className="h-10 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-400" /></div><select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded border border-slate-200 bg-white px-3 text-sm"><option value="">{t.escalations.allStatuses}</option><option value="open">{t.escalations.open} ({counts.open})</option><option value="in_progress">{t.extraServices.inProgress} ({counts.progress})</option><option value="resolved">{t.escalations.resolved} ({counts.resolved})</option><option value="closed">{t.escalations.closed}</option></select></div>
    {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <CardGridSkeleton cards={6} /> : <div className="space-y-3">{items.map((item) => <EscalationCard key={item.escalation_id} item={item} onClick={() => void openDrawer(item)} />)}{items.length === 0 && <div className="rounded border bg-white py-16 text-center text-sm text-slate-500">{t.escalations.noEscalations}</div>}</div>}
    {selected && <IssueDrawer issue={selected} loading={drawerLoading} onClose={() => setSelected(null)} onUpdate={update} t={t} />}
  </div>;
}

function EscalationCard({ item, onClick }: { item: EscalationApi; onClick: () => void }) { const severity = item.severity.toLowerCase(); const style = severityStyle[severity] ?? "border-l-slate-400 text-slate-500 bg-slate-50"; return <button onClick={onClick} className={`w-full rounded border border-l-4 border-slate-200 bg-white p-5 text-left shadow-sm hover:shadow ${style.split(" ")[0]}`}><div className="flex gap-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style}`}><MdWarningAmber className="text-xl" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2"><div><h2 className="text-sm font-bold text-slate-900">{item.title}</h2><p className="mt-1 text-xs text-slate-500">{item.subtitle}</p></div><span className={`text-xs font-semibold ${statusStyle[item.status] ?? "text-slate-500"}`}>{item.status_label || label(item.status)}</span></div><p className="mt-3 line-clamp-2 text-sm text-slate-600">{item.description}</p><div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500"><span>{item.reporter.name}</span>{item.assigned_to?.name && <span className="flex items-center gap-1"><MdOutlinePerson />Assigned to {item.assigned_to.name}</span>}<span>{new Date(item.created_at).toLocaleString()}</span></div></div></div></button>; }

function IssueDrawer({ issue, loading, onClose, onUpdate, t }: { issue: EscalationApi; loading: boolean; onClose: () => void; onUpdate: (status: string, notes: string) => Promise<boolean>; t: ReturnType<typeof getDashboardTranslation> }) {
  const [nextStatus, setNextStatus] = useState(issue.status); const [notes, setNotes] = useState(issue.notes ?? ""); const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); const ok = await onUpdate(nextStatus, notes); if (!ok) setSaving(false); };
  return <div className="modal-backdrop fixed inset-0 z-40 flex justify-end"><button className="absolute inset-0" onClick={onClose} aria-label="Close" /><aside className="relative z-10 flex h-full w-full max-w-[500px] flex-col bg-white shadow"><header className="flex justify-between border-b p-5"><div><h2 className="text-lg font-bold">Escalation {issue.escalation_id}</h2><p className="text-xs font-semibold text-amber-500">{label(issue.severity)}</p></div><button onClick={onClose}><MdClose className="text-2xl text-slate-400" /></button></header><div className="flex-1 overflow-y-auto p-6">{loading ? <DetailSkeleton blocks={6} /> : <div className="space-y-4"><div><h3 className="font-bold text-slate-800">{issue.title}</h3><p className="mt-1 text-xs text-slate-500">{issue.subtitle}</p><p className="mt-3 text-sm leading-6 text-slate-600">{issue.description}</p></div>{issue.photo_url && <img src={issue.photo_url} alt="Escalation" className="max-h-64 w-full rounded border object-cover" />}<div className="rounded bg-slate-50 p-3 text-xs text-slate-600"><p>Reporter: {issue.reporter.name}</p><p className="mt-1">Shift: {issue.shift_id}</p><p className="mt-1">Assigned: {issue.assigned_to?.name || "Unassigned"}</p></div><label className="block text-xs font-semibold text-slate-600">{t.common.status}<select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} className="mt-2 h-10 w-full rounded border bg-white px-3 text-sm font-normal"><option value="open">{t.escalations.open}</option><option value="in_progress">{t.extraServices.inProgress}</option><option value="resolved">{t.escalations.resolved}</option><option value="closed">{t.escalations.closed}</option></select></label><label className="block text-xs font-semibold text-slate-600">Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-2 w-full rounded border p-3 text-sm font-normal" /></label><button disabled={saving} onClick={() => void save()} className="h-10 w-full rounded bg-sky-500 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Updating..." : t.escalations.resolve}</button></div>}</div></aside></div>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { MdAdminPanelSettings, MdBlock, MdCheckCircle, MdInfoOutline, MdLockOpen, MdSave } from "react-icons/md";
import { defaultManagerAccess, defaultManagers, getStoredManagerAccess, getStoredManagers, MANAGER_ACCESS_STORAGE_KEY, MANAGERS_STORAGE_KEY, routePermissions, type ManagerRecord } from "@/lib/access-control";

export default function ManagerAccessPage() {
  const [access, setAccess] = useState<string[]>(defaultManagerAccess);
  const [saved, setSaved] = useState(false);
  const [managers, setManagers] = useState<ManagerRecord[]>(defaultManagers);
  useEffect(() => { setAccess(getStoredManagerAccess()); setManagers(getStoredManagers()); }, []);
  const grouped = useMemo(() => ({
    Operations: routePermissions.filter((item) => item.section === "Operations"),
    "Quality Control": routePermissions.filter((item) => item.section === "Quality Control"),
  }), []);
  const toggle = (href: string) => { setSaved(false); setAccess((current) => current.includes(href) ? current.filter((item) => item !== href) : [...current, href]); };
  const save = () => { localStorage.setItem(MANAGER_ACCESS_STORAGE_KEY, JSON.stringify(access)); setSaved(true); };
  const toggleManagerStatus = (id: string) => {
    setManagers((current) => {
      const updated = current.map((manager) => manager.id === id ? { ...manager, status: manager.status === "ACTIVE" ? "BLOCKED" as const : "ACTIVE" as const } : manager);
      localStorage.setItem(MANAGERS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return <div className="w-full space-y-5 pb-10">
    <div className="flex flex-col gap-4 rounded border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-sky-50 text-primary"><MdAdminPanelSettings className="text-2xl" /></span><div><h2 className="text-lg font-bold text-slate-900">Manager Route Access</h2><p className="mt-1 text-sm text-slate-500">Choose which pages appear in the Manager dashboard sidebar.</p></div></div>
    </div>
    <div className="flex items-center gap-2 rounded border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800"><MdInfoOutline className="shrink-0 text-lg" />Changes apply the next time the Manager navigates or signs in.</div>
    {saved && <div className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><MdCheckCircle className="text-lg" />Manager permissions saved successfully.</div>}
    <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4"><div><h3 className="text-sm font-bold text-slate-900">Managers</h3><p className="mt-1 text-xs text-slate-500">View manager accounts and control whether they can sign in.</p></div><span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">{managers.length} managers</span></div>
      <div className="divide-y divide-slate-100">{managers.map((manager) => <div key={manager.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"><img src="/avatar-placeholder.svg" alt={manager.name} className="h-10 w-10 rounded-full border border-slate-200 object-cover" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-bold text-slate-900">{manager.name}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${manager.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{manager.status === 'ACTIVE' ? 'Active' : 'Blocked'}</span></div><p className="mt-0.5 text-xs text-slate-500">{manager.email}</p><p className="mt-1 text-[10px] text-slate-400">Last active: {manager.lastActive}</p></div><button type="button" onClick={() => toggleManagerStatus(manager.id)} className={`flex h-9 items-center justify-center gap-1.5 rounded border px-3 text-xs font-bold ${manager.status === 'ACTIVE' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>{manager.status === 'ACTIVE' ? <><MdBlock className="text-base" /> Block</> : <><MdLockOpen className="text-base" /> Unblock</>}</button></div>)}</div>
    </section>
    <div className="grid gap-5 md:grid-cols-2">{Object.entries(grouped).map(([section, routes]) => <section key={section} className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 bg-slate-50 px-5 py-3"><h3 className="text-sm font-bold text-slate-800">{section}</h3></div><div className="divide-y divide-slate-100">{routes.map((route) => { const enabled = access.includes(route.href); return <label key={route.href} className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-slate-50"><span><span className="block text-sm font-semibold text-slate-800">{route.name}</span><span className="mt-0.5 block text-xs text-slate-400">{route.href}</span></span><span className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-primary' : 'bg-slate-300'}`}><input type="checkbox" checked={enabled} onChange={() => toggle(route.href)} className="sr-only" /><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${enabled ? 'left-6' : 'left-1'}`} /></span></label>; })}</div></section>)}</div>
    <div className="flex justify-end"><button type="button" onClick={save} className="flex h-10 items-center justify-center gap-2 rounded bg-primary px-5 text-sm font-semibold text-white hover:bg-sky-600"><MdSave className="text-lg" />Save Access</button></div>
  </div>;
}

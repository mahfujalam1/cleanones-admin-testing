"use client";

import React, { useMemo, useState } from "react";
import { MdAccessTime, MdExpandMore, MdLocationOn, MdSearch } from "react-icons/md";
import { EmployeeSidebar } from "@/components/shift-monitoring/EmployeeSidebar";
import { WORKERS } from "@/components/shift-monitoring/data";
import { WorkerInfo } from "@/components/shift-monitoring/types";

const schedule: Record<number, { start: string; end: string; progress: number; requiredHours: number }> = {
  1: { start: "08:00", end: "16:00", progress: 64, requiredHours: 240 },
  2: { start: "08:00", end: "16:00", progress: 61, requiredHours: 192 },
  3: { start: "07:30", end: "15:30", progress: 0, requiredHours: 304 },
  4: { start: "07:00", end: "15:00", progress: 76, requiredHours: 120 },
  5: { start: "06:00", end: "14:00", progress: 89, requiredHours: 168 },
  6: { start: "08:00", end: "16:00", progress: 0, requiredHours: 136 },
  7: { start: "08:00", end: "16:00", progress: 58, requiredHours: 104 },
  8: { start: "09:30", end: "17:30", progress: 42, requiredHours: 216 },
};

export default function LiveStatusPage() {
  const [selectedWorker, setSelectedWorker] = useState<WorkerInfo | null>(null);
  const [status, setStatus] = useState<"All" | WorkerInfo["status"]>("All");
  const [query, setQuery] = useState("");
  const [closed, setClosed] = useState<string[]>([]);
  const groups = useMemo(() => {
    const filtered = WORKERS.filter((worker) => (status === "All" || worker.status === status) && `${worker.name} ${worker.location}`.toLowerCase().includes(query.toLowerCase()));
    return Object.entries(filtered.reduce<Record<string, WorkerInfo[]>>((result, worker) => {
      (result[worker.location] ??= []).push(worker);
      return result;
    }, {}));
  }, [query, status]);

  return <div className="space-y-4">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div><h1 className="text-lg font-semibold text-slate-800">Live shifts by location</h1><p className="text-xs text-slate-500">Locations first, with assigned people, end times and live progress.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search location or employee..." className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-sky-400 sm:w-64" /></label><div className="flex rounded border border-slate-200 bg-white p-1">{(["All", "On Time", "Late", "Missing"] as const).map((item) => <button key={item} onClick={() => setStatus(item)} className={`rounded px-3 py-1 text-[10px] font-semibold ${status === item ? "bg-sky-500 text-white" : "text-slate-500"}`}>{item}</button>)}</div></div>
    </div>
    <div className="space-y-3">{groups.map(([location, employees]) => {
      const collapsed = closed.includes(location);
      const average = Math.round(employees.reduce((sum, worker) => sum + schedule[worker.id].progress, 0) / employees.length);
      const required = schedule[employees[0].id].requiredHours;
      return <section key={location} className="overflow-hidden rounded border border-slate-200 bg-white">
        <button onClick={() => setClosed((items) => items.includes(location) ? items.filter((item) => item !== location) : [...items, location])} className="flex w-full flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3 text-left">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-sky-50 text-sky-600"><MdLocationOn /></span><span className="min-w-48 flex-1"><b className="block text-sm text-slate-800">{location}</b><small className="text-[10px] text-slate-500">{employees.length} assigned today · {required} required hours/month</small></span>
          <span className="w-36"><span className="flex justify-between text-[10px] text-slate-500"><span>Progress</span><b>{average}%</b></span><span className="mt-1 block h-1.5 overflow-hidden rounded bg-slate-100"><span className="block h-full rounded bg-sky-500" style={{ width: `${average}%` }} /></span></span><MdExpandMore className={`text-lg text-slate-400 ${collapsed ? "" : "rotate-180"}`} />
        </button>
        {!collapsed && <div className="divide-y divide-slate-100">{employees.map((worker) => {
          const shift = schedule[worker.id];
          return <button key={worker.id} onClick={() => setSelectedWorker(worker)} className="grid w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 md:grid-cols-[minmax(210px,1.3fr)_150px_minmax(180px,1fr)_100px] md:items-center">
            <span className="flex items-center gap-3"><img src="/avatar-placeholder.svg" alt={worker.name} className="h-8 w-8 rounded-full border border-slate-200 object-cover" /><span><b className="block text-xs text-slate-800">{worker.name}</b><small className="text-[10px] text-slate-500">{worker.role} · {worker.shiftId}</small></span></span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-600"><MdAccessTime className="text-slate-400" /> {shift.start}–{shift.end}</span>
            <span><span className="flex justify-between text-[10px] text-slate-500"><span>{shift.progress ? `${Math.round(shift.progress * .08 * 10) / 10}h worked` : "Not started"}</span><b>{shift.progress}%</b></span><span className="mt-1 block h-1.5 overflow-hidden rounded bg-slate-100"><span className={`block h-full rounded ${worker.status === "Missing" ? "bg-red-400" : worker.status === "Late" ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${shift.progress}%` }} /></span></span>
            <span className={`justify-self-start rounded px-2 py-1 text-[10px] font-semibold md:justify-self-end ${worker.status === "On Time" ? "bg-emerald-50 text-emerald-700" : worker.status === "Late" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{worker.status}</span>
          </button>;
        })}</div>}
      </section>;
    })}</div>
    {selectedWorker && <EmployeeSidebar worker={selectedWorker} onClose={() => setSelectedWorker(null)} />}
  </div>;
}

"use client";

import React from "react";
import Link from "next/link";
import {
  MdAccessTime, MdAdd, MdArrowForward, MdBusiness, MdCalendarToday,
  MdCall, MdCheckCircle, MdClose, MdLocationOn,
  MdPeople, MdUploadFile, MdWarningAmber,
} from "react-icons/md";

type Worker = {
  name: string; initials: string; phone: string; shift: string; status: "On time" | "Late" | "No show";
  late?: number; reason?: string;
};

const sites: { client: string; location: string; workers: Worker[] }[] = [
  { client: "NH Hotels", location: "NH Hotel Amsterdam", workers: [
    { name: "Lisa Visser", initials: "LV", phone: "+31 6 12 34 56 78", shift: "08:00–16:00", status: "On time" },
    { name: "Emma Smit", initials: "ES", phone: "+31 6 98 76 54 32", shift: "08:00–16:00", status: "Late", late: 42, reason: "Train delay" },
  ]},
  { client: "UMC Utrecht", location: "Main building · Floor 2", workers: [
    { name: "Noah Bos", initials: "NB", phone: "+31 6 45 67 89 10", shift: "07:30–15:30", status: "No show", late: 68, reason: "No reason received" },
    { name: "Sophie de Boer", initials: "SB", phone: "+31 6 22 44 66 88", shift: "07:30–15:30", status: "On time" },
  ]},
  { client: "Hilton Group", location: "Hilton Rotterdam", workers: [
    { name: "Lucas Meijer", initials: "LM", phone: "+31 6 11 33 55 77", shift: "09:00–17:00", status: "Late", late: 31, reason: "Traffic" },
  ]},
];

const replacementCandidates: Worker[] = [
  { name: "Milan Dekker", initials: "MD", phone: "+31 6 30 21 44 80", shift: "Available until 18:00", status: "On time" },
  { name: "Anna Mulder", initials: "AM", phone: "+31 6 72 18 64 20", shift: "Available now", status: "On time" },
  { name: "Daan van den Berg", initials: "DB", phone: "+31 6 11 09 54 66", shift: "Available from 10:00", status: "On time" },
];

export default function DashboardPage() {
  const [filter, setFilter] = React.useState<"All" | Worker["status"]>("All");
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Worker | null>(null);
  const [replacementMode, setReplacementMode] = React.useState(false);
  const [selectedReplacement, setSelectedReplacement] = React.useState<Worker | null>(null);
  const [operationalSites, setOperationalSites] = React.useState(sites);
  const [notice, setNotice] = React.useState("");
  const urgent = operationalSites.flatMap(s => s.workers).filter(w => (w.late ?? 0) >= 30);

  const assignReplacement = () => {
    if (!selected || !selectedReplacement) return;
    setOperationalSites((current) => current.map((site) => ({
      ...site,
      workers: site.workers.map((worker) => worker.name === selected.name
        ? { ...selectedReplacement, shift: worker.shift, status: "On time", reason: `Replacement for ${selected.name}`, late: undefined }
        : worker),
    })));
    setNotice(`${selectedReplacement.name} assigned to ${selected.name}'s shift. Both employees have been notified.`);
    setSelected(null);
    setReplacementMode(false);
    setSelectedReplacement(null);
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-sky-600">Operations overview</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Good morning, Kaz</h1>
          <p className="mt-1 text-sm text-slate-500">Saturday, 25 July · Live status across all locations</p>
        </div>
        <div className="relative">
          <button onClick={() => setActionsOpen(v => !v)} className="flex h-10 items-center gap-2 rounded bg-sky-500 px-4 text-sm font-semibold text-white shadow-sm hover:bg-sky-600">
            <MdAdd className="text-lg" /> Create or add
          </button>
          {actionsOpen && <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded border bg-white p-1.5 shadow">
            {[["Create a shift", "/roster", MdCalendarToday], ["Add client or location", "/clients", MdBusiness], ["Bulk import data", "/users", MdUploadFile]].map(([label, href, Icon]) =>
              <Link key={label as string} href={href as string} className="flex items-center gap-3 rounded px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Icon className="text-lg text-sky-500" />{label as string}</Link>
            )}
          </div>}
        </div>
      </header>

      <section className="rounded border border-red-200 bg-red-50 p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-red-500 text-white"><MdWarningAmber className="text-2xl" /></div>
            <div><div className="flex items-center gap-2"><h2 className="text-lg font-bold text-red-950">{urgent.length} people need attention</h2><span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">30+ min late</span></div>
            <p className="mt-1 text-sm text-red-700">Contact them now or arrange a replacement.</p></div>
          </div>
          <div className="flex flex-wrap gap-2">{urgent.map(w => <button key={w.name} onClick={() => setSelected(w)} className="flex items-center gap-2 rounded border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-800 hover:border-red-400"><img src="/avatar-placeholder.svg" alt={w.name} className="h-6 w-6 rounded-full border border-red-100 object-cover" /><span>{w.late} min</span><MdCall /></button>)}</div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<MdAccessTime />} value="14" label="Active shifts" tone="text-sky-600 bg-sky-50" />
        <Metric icon={<MdPeople />} value="8" label="Workers on site" tone="text-violet-600 bg-violet-50" />
        <Metric icon={<MdWarningAmber />} value="3" label="Late / no show" tone="text-red-600 bg-red-50" />
        <Metric icon={<MdCheckCircle />} value="12" label="Reviews pending" tone="text-amber-600 bg-amber-50" />
      </div>

      <section className="dashboard-card overflow-hidden rounded">
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-bold text-slate-900">Live operations by client</h2><p className="text-xs text-slate-500">Locations first, then the people working there</p></div>
          <div className="flex rounded bg-slate-100 p-1">{(["All", "On time", "Late", "No show"] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`rounded px-3 py-1.5 text-xs font-semibold ${filter === f ? "bg-white text-sky-600 shadow-sm" : "text-slate-500"}`}>{f}</button>)}</div>
        </div>
        <div className="divide-y">
          {operationalSites.map(site => {
            const workers = site.workers.filter(w => filter === "All" || w.status === filter);
            if (!workers.length) return null;
            return <div key={site.location} className="p-5">
              <div className="mb-3 flex items-center gap-3"><div className="rounded bg-sky-50 p-2 text-sky-600"><MdLocationOn /></div><div><h3 className="text-sm font-bold text-slate-900">{site.client}</h3><p className="text-xs text-slate-500">{site.location}</p></div><span className="ml-auto text-xs text-slate-400">{workers.length} on roster</span></div>
              <div className="space-y-1">{workers.map(w => <div key={w.name} className="flex items-center gap-3 rounded border border-slate-100 bg-white p-3 text-left hover:bg-slate-50">
                <img src="/avatar-placeholder.svg" alt={w.name} className="h-9 w-9 rounded-full border border-slate-200 object-cover" />
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{w.name}</span><span className="block text-xs text-slate-500">{w.shift}{w.reason ? ` · ${w.reason}` : ""}</span></span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${w.status === "On time" ? "bg-emerald-100 text-emerald-700" : w.status === "Late" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{w.late ? `${w.late}m late` : w.status}</span>
                {w.status !== "On time" && <a href={`tel:${w.phone.replace(/\s/g, "")}`} onClick={(e) => e.stopPropagation()} className="flex h-9 items-center gap-1.5 rounded bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700"><MdCall /> Call</a>}
                <button onClick={() => setSelected(w)} className="text-slate-300 hover:text-sky-500"><MdArrowForward /></button>
              </div>)}</div>
            </div>;
          })}
        </div>
      </section>

      <div>
        <Link href="/escalations" className="dashboard-card flex items-center gap-4 p-5 hover:border-amber-300"><MdWarningAmber className="text-2xl text-amber-500" /><div><p className="font-bold">2 open escalations</p><p className="text-xs text-slate-500">One requires a response today</p></div><MdArrowForward className="ml-auto" /></Link>
      </div>

      {notice && <div className="fixed bottom-5 right-5 z-40 max-w-sm rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800"><div className="flex gap-3"><MdCheckCircle className="shrink-0 text-lg" /><span>{notice}</span><button onClick={() => setNotice("")} className="ml-auto text-emerald-700"><MdClose /></button></div></div>}

      {selected && <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={() => setSelected(null)}><div onMouseDown={e => e.stopPropagation()} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-5">
        <div className="flex justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-red-500">Attendance alert</p><h2 className="mt-1 text-xl font-bold">{selected.name}</h2></div><button onClick={() => setSelected(null)}><MdClose /></button></div>
        {!replacementMode ? <><div className="my-4 rounded border border-red-100 bg-red-50 p-4"><p className="text-xl font-bold text-red-700">{selected.late} minutes late</p><p className="mt-1 text-xs text-red-600">Reason: {selected.reason}</p></div>
        <div className="grid gap-2 sm:grid-cols-2"><a href={`tel:${selected.phone.replace(/\s/g, "")}`} className="flex h-10 items-center justify-center gap-2 rounded border border-emerald-600 text-xs font-bold text-emerald-700 hover:bg-emerald-50"><MdCall /> Call employee</a><button onClick={() => setReplacementMode(true)} className="h-10 rounded bg-sky-500 px-3 text-xs font-bold text-white hover:bg-sky-600">Mark sick & replace</button></div></> :
        <><div className="my-4"><p className="text-sm font-semibold text-slate-800">Choose an available replacement</p><p className="mt-1 text-xs text-slate-500">The original shift, location and working hours will be reassigned.</p></div><div className="space-y-2">{replacementCandidates.map((candidate) => <button key={candidate.name} onClick={() => setSelectedReplacement(candidate)} className={`flex w-full items-center gap-3 rounded border p-3 text-left ${selectedReplacement?.name === candidate.name ? "border-sky-400 bg-sky-50" : "border-slate-200"}`}><img src="/avatar-placeholder.svg" alt={candidate.name} className="h-9 w-9 rounded-full border border-slate-200 object-cover" /><span className="flex-1"><b className="block text-xs text-slate-800">{candidate.name}</b><small className="text-[10px] text-slate-500">{candidate.shift}</small></span>{selectedReplacement?.name === candidate.name && <MdCheckCircle className="text-sky-500" />}</button>)}</div><div className="mt-4 flex justify-end gap-2"><button onClick={() => setReplacementMode(false)} className="h-9 rounded border border-slate-200 px-3 text-xs font-semibold text-slate-600">Back</button><button disabled={!selectedReplacement} onClick={assignReplacement} className="h-9 rounded bg-sky-500 px-4 text-xs font-semibold text-white disabled:bg-slate-200">Confirm replacement</button></div></>}
      </div></div>}
    </div>
  );
}

function Metric({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone: string }) {
  return <div className="dashboard-card min-h-32 p-5"><span className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${tone}`}>{icon}</span><div className="mt-4"><p className="text-2xl font-bold">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div>;
}

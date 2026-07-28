"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MdAccessTime, MdAssignment, MdMeetingRoom, MdOutlineClose, MdOutlineLocationOn, MdOutlinePeople } from "react-icons/md";
import { TbBuilding } from "react-icons/tb";
import { Location } from "./types";

interface LocationDetailSidebarProps { location: Location; onClose: () => void; }
type Tab = "overview" | "rooms" | "plans";

export function LocationDetailSidebar({ location, onClose }: LocationDetailSidebarProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const rooms = Array.from({ length: Math.min(location.rooms, 6) }, (_, index) => `${index < 3 ? "Floor 1" : "Floor 2"} · Room ${201 + index}`);
  return <>
    <div className="modal-backdrop fixed inset-0 z-[60]" onClick={onClose} />
    <div className="fixed right-0 top-0 z-[65] flex h-dvh w-full max-w-[430px] flex-col border-l border-gray-200 bg-white animate-in slide-in-from-right duration-200">
      <div className="flex items-center gap-3 border-b border-gray-700 bg-[#1A2332] px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded bg-sky-100"><TbBuilding className="text-lg text-sky-600" /></span>
        <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-white">{location.name}</h2><p className="mt-0.5 text-[10px] text-slate-300">{location.client} · {location.id}</p></div>
        <button onClick={onClose} className="p-1 text-slate-300 hover:text-white"><MdOutlineClose className="text-lg" /></button>
      </div>
      <div className="grid grid-cols-3 border-b border-gray-200 bg-white px-3 pt-2">
        {([["overview", "Overview"], ["rooms", `Rooms (${location.rooms})`], ["plans", "Cleaning plans"]] as const).map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={`border-b-2 px-2 py-2 text-[10px] font-semibold ${tab === value ? "border-sky-500 text-sky-600" : "border-transparent text-slate-500"}`}>{label}</button>)}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "overview" && <div className="space-y-3">
          <Info icon={<MdOutlineLocationOn />} label="Address" value={location.address} />
          <div className="grid grid-cols-3 gap-2">
            <Stat value={location.floors} label="Floors" />
            <Stat value={location.rooms} label="Rooms" />
            <Stat value={`${location.requiredHours}h`} label="Required / month" />
          </div>
          <section className="rounded border border-gray-200">
            <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5"><MdOutlinePeople className="text-sky-500" /><div><h3 className="text-xs font-semibold text-slate-800">Assigned employees</h3><p className="text-[10px] text-slate-500">Default team for this location</p></div><span className="ml-auto text-[10px] font-semibold text-slate-500">{location.assignedEmployees.length}</span></div>
            <div className="divide-y divide-gray-100">{location.assignedEmployees.map((employee) => <div key={employee} className="flex items-center gap-2.5 px-3 py-2.5"><img src="/avatar-placeholder.svg" alt={employee} className="h-7 w-7 rounded-full border border-slate-200 object-cover" /><span className="text-xs font-medium text-slate-700">{employee}</span><span className="ml-auto rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">Assigned</span></div>)}</div>
          </section>
          <Info icon={<MdAccessTime />} label="Coverage" value={`${location.requiredHours} required hours per month · Mon–Fri`} />
        </div>}
        {tab === "rooms" && <div className="space-y-2">
          <div className="mb-3"><h3 className="text-sm font-semibold text-slate-800">Rooms at {location.name}</h3><p className="text-[10px] text-slate-500">Rooms are managed inside their parent location.</p></div>
          {rooms.map((room, index) => <div key={room} className="flex items-center gap-3 rounded border border-gray-200 p-3"><span className="flex h-8 w-8 items-center justify-center rounded bg-sky-50 text-sky-500"><MdMeetingRoom /></span><div className="flex-1"><p className="text-xs font-semibold text-slate-700">{room}</p><p className="text-[10px] text-slate-500">{index % 2 ? "Standard cleaning" : "Daily priority"}</p></div><span className="text-[10px] text-emerald-600">Active</span></div>)}
          <Link href="/rooms" className="mt-3 flex h-9 items-center justify-center rounded border border-sky-200 bg-sky-50 text-xs font-semibold text-sky-700">Manage all rooms for this location</Link>
        </div>}
        {tab === "plans" && <div className="space-y-2">
          <div className="mb-3"><h3 className="text-sm font-semibold text-slate-800">Cleaning plans</h3><p className="text-[10px] text-slate-500">Plans linked to this location and its rooms.</p></div>
          {["Daily room standard", "Public areas morning plan", "Weekly deep clean"].map((plan, index) => <div key={plan} className="flex items-center gap-3 rounded border border-gray-200 p-3"><span className="flex h-8 w-8 items-center justify-center rounded bg-violet-50 text-violet-500"><MdAssignment /></span><div className="flex-1"><p className="text-xs font-semibold text-slate-700">{plan}</p><p className="text-[10px] text-slate-500">{index === 0 ? `${location.rooms} rooms` : index === 1 ? "Lobby and shared spaces" : "Selected rooms"}</p></div><span className="text-[10px] text-emerald-600">Active</span></div>)}
          <Link href="/cleaning-plans" className="mt-3 flex h-9 items-center justify-center rounded border border-sky-200 bg-sky-50 text-xs font-semibold text-sky-700">Manage cleaning plans</Link>
        </div>}
      </div>
    </div>
  </>;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-3 rounded border border-gray-200 bg-gray-50/60 p-3"><span className="mt-0.5 text-lg text-sky-500">{icon}</span><div><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-0.5 text-xs font-medium text-slate-700">{value}</p></div></div>;
}
function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return <div className="rounded border border-gray-200 p-3 text-center"><p className="text-base font-semibold text-slate-800">{value}</p><p className="mt-0.5 text-[9px] text-slate-500">{label}</p></div>;
}

"use client";
import { use, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdArrowBack } from "react-icons/md";
import { ClientForm } from "@/components/clients/ClientForm";
import { useClientById } from "@/redux/api/endpoints/clients.api";
import { getLocale, localizePath } from "@/lib/locale";
import { ErrorNotice } from "@/components/shared/ListStates";
import { apiError } from "@/redux/api/apiError";
export default function ClientLayout({ params, children }: { params: Promise<{ id: string }>; children: React.ReactNode }) {
  const { id } = use(params);
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const { client, isLoading, error } = useClientById(id);
  const [editing, setEditing] = useState(false);
  const base = `/clients/${id}`;
  const active = pathname.includes(`${base}/locations`) ? "Locations" : pathname.endsWith("/contacts") ? "Contacts" : "Overview";
  return <div className="space-y-5 pb-10">
    <header className="flex items-start justify-between gap-4"><div className="flex items-center gap-3">
      <Link aria-label="All clients" href={localizePath('/clients', locale)} className="rounded border border-slate-200 p-2"><MdArrowBack /></Link>
      <div><h1 className="text-xl font-bold text-slate-900">{client?.company_name || client?.name || (isLoading ? 'Loading…' : 'Client')}</h1><p className="mt-1 text-xs text-slate-500">{client?.name} {client?.contract_status && `· ${client.contract_status}`}</p></div></div>
      {client && <button onClick={() => setEditing(true)} className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white">Edit client</button>}
    </header>
    <nav aria-label="Client sections" className="flex gap-1 border-b border-slate-200">{['Overview', 'Contacts', 'Locations'].map((tab) => <Link key={tab} aria-current={active === tab ? 'page' : undefined} href={localizePath(base + (tab === 'Overview' ? '' : `/${tab.toLowerCase()}`), locale)} className={`border-b-2 px-5 py-3 text-sm ${active === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}>{tab}</Link>)}</nav>
    {error ? <ErrorNotice message={apiError(error)} /> : children}
    {editing && client && <ClientForm client={client} onClose={() => setEditing(false)} />}
  </div>;
}

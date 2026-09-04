"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MdAdd, MdBusinessCenter, MdClose, MdDelete, MdLocationOn, MdRestore, MdSearch, MdWarningAmber } from "react-icons/md";
import { AddClientModal } from "@/components/clients/AddClientModal";
import type { Client } from "@/components/clients/types";
import { deleteClient, getDeletedClients, restoreClient } from "@/services/actions/clients";
import { useGetClientsQuery } from "@/redux/api/dashboardApi";
import { CardGridSkeleton } from "@/components/shared/SkeletonLoader";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

type Mode = "active" | "deleted";

export default function ClientsPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 9;

  const { data: clientsRes, isLoading: loading, refetch } = useGetClientsQuery({ search: search.trim() || undefined, page, limit });

  const rawClients = clientsRes?.clients ?? [];
  const total = clientsRes?.total_count ?? 0;
  const clients: Client[] = rawClients.filter((item) => !item.is_signup).map((item) => ({
    id: item.id, name: item.company_name, industry: item.industry, status: item.status,
    mainContactName: item.primary_contact_name, email: item.email, phone: item.phone,
    locationsCount: item.locations_count, contractStatus: item.contract_status,
    contractExpiryDate: "", activeTasks: 0, contacts: [], locations: [],
  }));

  const restore = async (client: Client) => {
    setError("");
    const result = await restoreClient(client.id);
    if (!result.success) return setError(result.error);
    void refetch();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    const result = await deleteClient(deleteTarget.id);
    setDeleting(false);
    if (!result.success) return setError(result.error);
    setDeleteTarget(null);
    void refetch();
  };

  return <div className="space-y-5 pb-10">
    <div className="flex flex-wrap gap-3">
      <label className="relative"><MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.clients.searchPlaceholder} className="h-9 w-64 rounded border bg-slate-50 pl-9 pr-3 text-sm" /></label>
      <div className="flex rounded border bg-white p-1 text-xs font-semibold">{(["active", "deleted"] as const).map((item) => <button key={item} onClick={() => setMode(item)} className={`rounded px-4 py-1.5 capitalize ${mode === item ? "bg-sky-500 text-white" : "text-slate-500"}`}>{item === "active" ? t.common.active : t.common.inactive}</button>)}</div>
      {mode === "active" && <button onClick={() => setAddOpen(true)} className="ml-auto flex h-9 items-center gap-1 rounded bg-sky-500 px-4 text-sm font-semibold text-white"><MdAdd /> {t.clients.addClient}</button>}
    </div>
    {error && <p className="rounded bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    {loading ? <CardGridSkeleton cards={9} /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {clients.map((client) => <article key={client.id} onClick={() => mode === "active" && router.push(`/clients/${client.id}`)} className={`dashboard-card p-5 ${mode === "active" ? "cursor-pointer" : ""}`}>
        <div className="flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded bg-emerald-50 text-emerald-600"><MdBusinessCenter /></span><div className="flex-1"><h3 className="font-bold">{client.name}</h3><p className="text-xs text-slate-500">{client.industry} · {client.status}</p></div>
          <button aria-label={mode === "deleted" ? `Restore ${client.name}` : `Delete ${client.name}`} onClick={(e) => { e.stopPropagation(); if (mode === "deleted") void restore(client); else setDeleteTarget(client); }} className={`rounded p-2 ${mode === "deleted" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{mode === "deleted" ? <MdRestore /> : <MdDelete />}</button>
        </div><div className="mt-4 space-y-1 text-xs text-slate-500"><p>{client.mainContactName}</p><p>{client.email}</p><p>{client.phone}</p><p className="flex items-center gap-1"><MdLocationOn /> {client.locationsCount} {t.nav.locations.toLowerCase()}</p></div>
      </article>)}
      {clients.length === 0 && !error && <p className="col-span-full py-16 text-center text-sm text-slate-500">{t.clients.noClientsFound}</p>}
    </div>}
    {!error && <BackendPagination page={page} limit={limit} total={total} onPageChange={setPage} />}
    {addOpen && <AddClientModal onClose={() => setAddOpen(false)} onAdd={() => { setAddOpen(false); void refetch(); }} />}
    {deleteTarget && <DeleteClientModal client={deleteTarget} deleting={deleting} onCancel={() => !deleting && setDeleteTarget(null)} onConfirm={() => void confirmDelete()} />}
  </div>;
}

function DeleteClientModal({ client, deleting, onCancel, onConfirm }: { client: Client; deleting: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <div role="dialog" aria-modal="true" aria-labelledby="delete-client-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-xl text-red-600"><MdWarningAmber /></span><button aria-label="Close delete confirmation" disabled={deleting} onClick={onCancel} className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-50"><MdClose className="text-xl" /></button></div>
      <h2 id="delete-client-title" className="mt-4 text-lg font-bold text-slate-900">Delete client?</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">Are you sure you want to delete <strong className="text-slate-800">{client.name}</strong>? You can restore this client later from the Deleted tab.</p>
      <div className="mt-6 flex justify-end gap-3"><button disabled={deleting} onClick={onCancel} className="rounded border px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50">Cancel</button><button disabled={deleting} onClick={onConfirm} className="flex min-w-24 items-center justify-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><MdDelete /> {deleting ? "Deleting..." : "Delete"}</button></div>
    </div>
  </div>;
}


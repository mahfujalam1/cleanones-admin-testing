"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MdAdd, MdBusinessCenter } from "react-icons/md";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientForm } from "@/components/clients/ClientForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { getUiTranslation } from "@/lib/translations";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { CardGridSkeleton, EmptyState, ErrorNotice, SearchInput } from "@/components/shared/ListStates";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useDeleteClientMutation,
  useGetClientsQuery,
  type Client,
} from "@/redux/api/endpoints/clients.api";
import { apiError } from "@/redux/api/apiError";
import { getLocale, localizePath } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

const LIMIT = 9;

export default function ClientsPage() {
  const locale = getLocale(usePathname());
  const t = getDashboardTranslation(locale);
  const ui = getUiTranslation(locale);

  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const [page, setPage] = useState(1);
  const [formTarget, setFormTarget] = useState<Client | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [actionError, setActionError] = useState("");

  // A new search starts over; staying on page 7 of the old result set shows nothing.
  useEffect(() => setPage(1), [searchTerm]);

  const { data, isFetching, error } = useGetClientsQuery({
    page,
    limit: LIMIT,
    searchTerm: searchTerm || undefined,
  });
  const [deleteClient, { isLoading: deleting }] = useDeleteClientMutation();

  const clients = data?.result ?? [];
  const total = data?.meta.total ?? 0;
  const message = actionError || (error ? apiError(error) : "");

  // Auto-fallback: if current page has no data and we are past page 1, redirect to previous page
  useEffect(() => {
    if (!isFetching && data && clients.length === 0 && page > 1) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [isFetching, data, clients.length, page]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionError("");
    try {
      await deleteClient(deleteTarget._id).unwrap();
      setDeleteTarget(null);
    } catch (cause) {
      setActionError(apiError(cause));
    }
  };

  const addButton = (
    <button
      type="button"
      onClick={() => setFormTarget("new")}
      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.98]"
    >
      <MdAdd className="text-lg" /> {t.clients.addClient}
    </button>
  );

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-600">
            <MdBusinessCenter className="text-xl" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-bold leading-tight text-slate-900">{t.clients.title}</h1>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{total}</span>
            </div>
            <p className="truncate text-xs text-slate-500">{ui.clientAccountsSubtitle}</p>
          </div>
        </div>
        {addButton}
      </div>

      <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder={t.clients.searchPlaceholder} />
      </div>

      {message && <ErrorNotice message={message} />}

      {isFetching ? (
        <CardGridSkeleton />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<MdBusinessCenter />}
          title={t.clients.noClientsFound}
          description={
            searchTerm
              ? t.common.adjustFilters
              : "Add your first client to start managing their locations and rooms."
          }
          action={searchTerm ? undefined : addButton}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <ClientCard
              key={client._id}
              client={client}
              href={localizePath(`/clients/${client._id}`, locale)}
              onEdit={setFormTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <BackendPagination
        page={page}
        limit={LIMIT}
        total={total}
        itemCount={clients.length}
        onPageChange={setPage}
      />

      {formTarget && (
        <ClientForm
          client={formTarget === "new" ? undefined : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={ui.deleteClient}
          description={`${deleteTarget.name} will be deactivated and their login blocked.`}
          confirmText={ui.delete}
          loading={deleting}
          onConfirm={() => void confirmDelete()}
          onClose={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

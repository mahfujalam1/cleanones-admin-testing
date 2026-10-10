"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MdAdd, MdBusinessCenter, MdUploadFile } from "react-icons/md";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientForm } from "@/components/clients/ClientForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BulkUploadModal, type BulkUploadColumn } from "@/components/shared/BulkUploadModal";
import { getUiTranslation } from "@/lib/translations";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { CardGridSkeleton, EmptyState, ErrorNotice, SearchInput } from "@/components/shared/ListStates";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useDeleteClientMutation,
  useGetClientsQuery,
  useBulkUploadClientsMutation,
  type Client,
} from "@/redux/api/endpoints/clients.api";
import { apiError } from "@/redux/api/apiError";
import { getLocale, localizePath } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

const LIMIT = 9;

const CLIENT_BULK_COLUMNS: BulkUploadColumn[] = [
  { name: "name", required: true },
  { name: "email", required: true, notes: "Must be unique" },
  { name: "phone", required: true },
  { name: "password", required: true, notes: "Min 6 characters" },
  { name: "company_name", required: false },
  { name: "licence_expiration_date", required: false, notes: "e.g. 2027-01-31" },
  { name: "contract_status", required: false, notes: "Active, Inactive or Pending" },
];

const SAMPLE_CLIENTS_CSV = `name,email,phone,password,company_name,licence_expiration_date,contract_status
Acme Cleaning,acme@example.com,+4512345678,secret123,Acme ApS,2027-01-31,Active
Beta Corp,beta@example.com,+4587654321,secret456,,,Pending`;

export default function ClientsPage() {
  const locale = getLocale(usePathname());
  const t = getDashboardTranslation(locale);
  const ui = getUiTranslation(locale);

  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const [page, setPage] = useState(1);
  const [formTarget, setFormTarget] = useState<Client | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [actionError, setActionError] = useState("");

  
  useEffect(() => setPage(1), [searchTerm]);

  const { data, isFetching, error } = useGetClientsQuery({
    page,
    limit: LIMIT,
    searchTerm: searchTerm || undefined,
  });
  const [deleteClient, { isLoading: deleting }] = useDeleteClientMutation();
  const [bulkUploadClients] = useBulkUploadClientsMutation();

  const clients = data?.result ?? [];
  const total = data?.meta.total ?? 0;
  const message = actionError || (error ? apiError(error) : "");

  
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBulkUpload(true)}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 active:scale-[0.98]"
          >
            <MdUploadFile className="text-lg text-slate-500" /> Bulk Upload
          </button>
          {addButton}
        </div>
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

      {showBulkUpload && (
        <BulkUploadModal
          title="Bulk Upload Clients"
          entityName="Clients"
          columns={CLIENT_BULK_COLUMNS}
          sampleCsvFilename="clients_template.csv"
          sampleCsvContent={SAMPLE_CLIENTS_CSV}
          onUpload={async (formData) => {
            return await bulkUploadClients(formData).unwrap();
          }}
          onClose={() => setShowBulkUpload(false)}
        />
      )}
    </div>
  );
}

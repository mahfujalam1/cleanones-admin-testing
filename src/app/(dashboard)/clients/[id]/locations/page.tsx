"use client";

import { use, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MdAdd,
  MdPlace,
} from "react-icons/md";
import { LocationCard } from "@/components/locations/LocationCard";
import { LocationForm } from "@/components/locations/LocationForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { CardGridSkeleton, EmptyState, ErrorNotice, SearchInput } from "@/components/shared/ListStates";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useDeleteLocationMutation,
  useGetClientLocationsQuery,
  type Location,
} from "@/redux/api/endpoints/locations.api";
import { apiError } from "@/redux/api/apiError";
import { getLocale, localizePath } from "@/lib/locale";

const LIMIT = 9;

export default function ClientLocationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const locale = getLocale(usePathname());

  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => setPage(1), [searchTerm]);

  const { data, isFetching, error } = useGetClientLocationsQuery({
    clientId: id,
    page,
    limit: LIMIT,
    searchTerm: searchTerm || undefined,
  });
  const [deleteLocation, { isLoading: deleting }] = useDeleteLocationMutation();

  const locations = data?.result ?? [];
  const total = data?.meta.total ?? 0;
  const message = actionError || (error ? apiError(error) : "");

  // Auto-fallback: if current page has no data and we are past page 1, redirect to previous page
  useEffect(() => {
    if (!isFetching && data && locations.length === 0 && page > 1) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [isFetching, data, locations.length, page]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionError("");
    try {
      await deleteLocation(deleteTarget._id).unwrap();
      setDeleteTarget(null);
    } catch (cause) {
      setActionError(apiError(cause));
    }
  };

  const addButton = (
    <button
      type="button"
      onClick={() => setCreating(true)}
      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.98]"
    >
      <MdAdd className="text-lg" /> Add location
    </button>
  );

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">Locations</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{total}</span>
        </div>
        {addButton}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
        <SearchInput value={search} onChange={setSearch} placeholder="Search locations by name or address" />
      </div>

      {message && <ErrorNotice message={message} />}

      {isFetching ? (
        <CardGridSkeleton count={3} />
      ) : locations.length === 0 ? (
        <EmptyState
          icon={<MdPlace />}
          title="No locations yet"
          description={
            searchTerm ? "No location matches that search." : "Add the first location for this client."
          }
          action={searchTerm ? undefined : addButton}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {locations.map((location) => (
            <LocationCard
              key={location._id}
              location={location}
              onSelect={() => router.push(localizePath(`/clients/${id}/locations/${location._id}`, locale))}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <BackendPagination
        page={page}
        limit={LIMIT}
        total={total}
        itemCount={locations.length}
        onPageChange={setPage}
      />

      {creating && <LocationForm clientId={id} onClose={() => setCreating(false)} />}
      {editTarget && <LocationForm location={editTarget} onClose={() => setEditTarget(null)} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete location?"
          description={`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`}
          confirmText="Delete"
          loading={deleting}
          onConfirm={() => void confirmDelete()}
          onClose={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

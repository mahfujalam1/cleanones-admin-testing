"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MdAdd } from "react-icons/md";
import { LocationCard } from "@/components/locations/LocationCard";
import { LocationForm } from "@/components/locations/LocationForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { CardGridSkeleton, ErrorNotice, SearchInput } from "@/components/shared/ListStates";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { clientLabel, CLIENT_LOOKUP_ARGS, useGetClientsQuery } from "@/redux/api/endpoints/clients.api";
import {
  useDeleteLocationMutation,
  useGetClientLocationsQuery,
  useGetLocationsQuery,
  type Location,
} from "@/redux/api/endpoints/locations.api";
import { refId } from "@/redux/api/types";
import { apiError } from "@/redux/api/apiError";
import { getLocale, localizePath } from "@/lib/locale";

const LIMIT = 16;

function LocationsView() {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const clientId = useSearchParams().get("client") ?? "";

  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => setPage(1), [searchTerm, clientId]);
  const args = { page, limit: LIMIT, searchTerm: searchTerm || undefined };
  const scoped = useGetClientLocationsQuery({ clientId, ...args }, { skip: !clientId });
  const all = useGetLocationsQuery(args, { skip: Boolean(clientId) });
  const { data, isFetching, error } = clientId ? scoped : all;

  const [deleteLocation, { isLoading: deleting }] = useDeleteLocationMutation();
  const { data: clientPage } = useGetClientsQuery(CLIENT_LOOKUP_ARGS);

  const locations = data?.result ?? [];
  const total = data?.meta.total ?? 0;
  const message = actionError || (error ? apiError(error) : "");
  const selectedClient = clientPage?.result.find((client) => client._id === clientId);

  // Auto-fallback: if current page has no data and we are past page 1, redirect to previous page
  useEffect(() => {
    if (!isFetching && data && locations.length === 0 && page > 1) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [isFetching, data, locations.length, page]);

  const chooseClient = (value: string) =>
    router.replace(localizePath(value ? `/locations?client=${value}` : "/locations", locale));

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

  const addLocation = () => setCreating(true);

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Locations</h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {total}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {selectedClient
              ? `Locations for ${clientLabel(selectedClient)}`
              : "Client locations. Open one to manage its rooms."}
          </p>
        </div>
      </header>

      {/* Controls take only the width they need and sit left; stretching them across a wide
          screen makes a two-field toolbar look like a form. */}
      <div className="grid gap-2 rounded-xl bg-white p-2 ring-1 ring-slate-200/70 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_auto]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search locations…" />

        <Select
          value={clientId}
          onValueChange={chooseClient}
          placeholder="All clients"
          options={[
            { value: "", label: "All clients" },
            ...(clientPage?.result ?? []).map((client) => ({
              value: client._id,
              label: clientLabel(client),
            })),
          ]}
        />

        <Button onClick={addLocation} className="md:col-span-2 xl:col-span-1">
          <MdAdd className="text-base" /> Add location
        </Button>
      </div>

      {message && <ErrorNotice message={message} />}

      {isFetching ? (
        <CardGridSkeleton />
      ) : locations.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-base font-medium text-slate-900">No locations found</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
            {searchTerm
              ? "Nothing matches that search. Try a different name or address."
              : "Add a location to start setting up its rooms and tasks."}
          </p>
          {!searchTerm && (
            <Button variant="secondary" onClick={addLocation} className="mt-5">
              <MdAdd className="text-base" /> Add location
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {locations.map((location) => (
            <LocationCard
              key={location._id}
              location={location}
              onSelect={() =>
                router.push(
                  localizePath(
                    `/clients/${refId(location.client) || clientId}/locations/${location._id}`,
                    locale,
                  ),
                )
              }
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

      {/* The client is chosen inside the form, so adding never takes two dialogs. When the page
          is already scoped to a client, that choice is made for the user. */}
      {creating && <LocationForm clientId={clientId || undefined} onClose={() => setCreating(false)} />}

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

export default function LocationsPage() {
  // `useSearchParams` needs a Suspense boundary to keep the route statically renderable.
  return (
    <Suspense fallback={<CardGridSkeleton />}>
      <LocationsView />
    </Suspense>
  );
}

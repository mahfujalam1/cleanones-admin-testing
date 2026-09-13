"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MdAdd, MdOutlineAssignment } from "react-icons/md";
import { PlanCard } from "@/components/cleaningPlans/PlanCard";
import { PlanForm } from "@/components/cleaningPlans/PlanForm";
import { PlanDetailModal } from "@/components/cleaningPlans/PlanDetailModal";
import { AssignWorkersModal } from "@/components/cleaningPlans/AssignWorkersModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { CardGridSkeleton, ErrorNotice, SearchInput } from "@/components/shared/ListStates";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { clientLabel, CLIENT_LOOKUP_ARGS, useGetClientsQuery } from "@/redux/api/endpoints/clients.api";
import { useGetClientLocationsQuery, useGetLocationsQuery } from "@/redux/api/endpoints/locations.api";
import {
  useDeleteCleaningPlanMutation,
  useGetCleaningPlanListQuery,
  type CleaningPlan,
} from "@/redux/api/endpoints/cleaningPlans.api";
import { apiError } from "@/redux/api/apiError";
import { getLocale, localizePath } from "@/lib/locale";

const LIMIT = 12;
const PICKER_LIMIT = 100;

function CleaningPlansView() {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const query = useSearchParams();

  const clientId = query.get("client") ?? "";
  const locationId = query.get("location") ?? "";

  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const [page, setPage] = useState(1);
  const [formTarget, setFormTarget] = useState<CleaningPlan | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CleaningPlan | null>(null);
  const [justCreated, setJustCreated] = useState<CleaningPlan | null>(null);
  const [viewTarget, setViewTarget] = useState<CleaningPlan | null>(null);
  const [assignTarget, setAssignTarget] = useState<CleaningPlan | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => setPage(1), [searchTerm, clientId, locationId]);

  /** Narrowing the client clears the location, which no longer belongs to it. */
  const applyScope = (next: { client?: string; location?: string }) => {
    const params = new URLSearchParams();
    if (next.client) params.set("client", next.client);
    if (next.location) params.set("location", next.location);
    const suffix = params.toString();
    router.replace(localizePath(`/cleaning-plans${suffix ? `?${suffix}` : ""}`, locale));
  };

  // One request, paged and searched by the server — no walking rooms to collect tasks.
  const { data, isFetching, error } = useGetCleaningPlanListQuery({
    page,
    limit: LIMIT,
    searchTerm: searchTerm || undefined,
    client: clientId || undefined,
    location: locationId || undefined,
  });

  const { data: clientPage } = useGetClientsQuery(CLIENT_LOOKUP_ARGS);
  const scopedLocations = useGetClientLocationsQuery(
    { clientId, limit: PICKER_LIMIT, sort: "name" },
    { skip: !clientId },
  );
  const allLocations = useGetLocationsQuery({ limit: PICKER_LIMIT, sort: "name" }, { skip: Boolean(clientId) });
  const locations = (clientId ? scopedLocations.data : allLocations.data)?.result ?? [];

  const plans = data?.result ?? [];
  const total = data?.meta.total ?? 0;
  const message = actionError || (error ? apiError(error) : "");

  const [deletePlan, { isLoading: deleting }] = useDeleteCleaningPlanMutation();

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionError("");
    try {
      await deletePlan(deleteTarget._id).unwrap();
      setDeleteTarget(null);
    } catch (cause) {
      setActionError(apiError(cause));
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <header className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">Cleaning Plans</h1>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {total}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Scheduled cleaning plans across every client location.</p>
      </header>

      <div className="grid gap-2 rounded-xl bg-white p-2 ring-1 ring-slate-200/70 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_auto]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search cleaning plans…" />

        <Select
          value={clientId}
          onValueChange={(value) => applyScope({ client: value })}
          placeholder="All clients"
          options={[
            { value: "", label: "All clients" },
            ...(clientPage?.result ?? []).map((client) => ({
              value: client._id,
              label: clientLabel(client),
            })),
          ]}
        />

        <Select
          value={locationId}
          onValueChange={(value) => applyScope({ client: clientId, location: value })}
          placeholder="All locations"
          options={[
            { value: "", label: "All locations" },
            ...locations.map((location) => ({ value: location._id, label: location.name })),
          ]}
        />

        <Button className="md:col-span-2 xl:col-span-1" onClick={() => setFormTarget("new")}>
          <MdAdd className="text-base" /> Add cleaning plan
        </Button>
      </div>

      {message && <ErrorNotice message={message} />}

      {isFetching ? (
        <CardGridSkeleton />
      ) : plans.length === 0 ? (
        <div className="rounded-xl bg-white px-4 py-20 text-center ring-1 ring-slate-200/70">
          <MdOutlineAssignment className="mx-auto text-5xl text-slate-200" />
          <p className="mt-4 text-sm font-semibold text-slate-900">No cleaning plans</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            {searchTerm || clientId || locationId
              ? "Nothing matches these filters."
              : "No cleaning plans have been scheduled yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              onSelect={setViewTarget}
              onEdit={setFormTarget}
              onDelete={setDeleteTarget}
              onAssign={setAssignTarget}
            />
          ))}
        </div>
      )}

      <BackendPagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />

      {viewTarget && (
        <PlanDetailModal
          planId={viewTarget._id}
          onClose={() => setViewTarget(null)}
          onEdit={(plan) => {
            setViewTarget(null);
            setFormTarget(plan);
          }}
          onDelete={(plan) => {
            setViewTarget(null);
            setDeleteTarget(plan);
          }}
          onAssign={setAssignTarget}
        />
      )}

      {assignTarget && (
        <AssignWorkersModal plan={assignTarget} onClose={() => setAssignTarget(null)} />
      )}

      {formTarget && (
        <PlanForm
          plan={formTarget === "new" ? undefined : formTarget}
          onClose={() => setFormTarget(null)}
          // A plan has to exist before tasks can point at it, so the offer comes after creating.
          onCreated={(created) => {
            setFormTarget(null);
            setJustCreated(created);
          }}
        />
      )}

      {justCreated && (
        <ConfirmDialog
          title="Plan created"
          description={`Do you want to add additional tasks to ${justCreated.title}?`}
          confirmText="Add tasks"
          cancelText="Not now"
          destructive={false}
          onConfirm={() => {
            const plan = justCreated;
            setJustCreated(null);
            setFormTarget(plan);
          }}
          onClose={() => setJustCreated(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete cleaning plan?"
          description={`${deleteTarget.title} will be removed.`}
          confirmText="Delete"
          loading={deleting}
          onConfirm={() => void confirmDelete()}
          onClose={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default function CleaningPlansPage() {
  // `useSearchParams` needs a Suspense boundary to keep the route statically renderable.
  return (
    <Suspense fallback={<CardGridSkeleton />}>
      <CleaningPlansView />
    </Suspense>
  );
}

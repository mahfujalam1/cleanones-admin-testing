"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MdAdd, MdOutlineAssignment } from "react-icons/md";
import { PlanCard } from "@/components/cleaningPlans/PlanCard";
import { PlanForm } from "@/components/cleaningPlans/PlanForm";
import { PlanDetailModal } from "@/components/cleaningPlans/PlanDetailModal";
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
  useGetCleaningPlanQuery,
  type CleaningPlan,
} from "@/redux/api/endpoints/cleaningPlans.api";
import { apiError } from "@/redux/api/apiError";
import { getLocale, localizePath } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";

const LIMIT = 12;
const PICKER_LIMIT = 100;

function CleaningPlansView() {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const ui = getUiTranslation(getLocale(usePathname()));
  const query = useSearchParams();

  const clientId = query.get("client") ?? "";
  const locationId = query.get("location") ?? "";
  /**
   * `?plan=<id>&action=edit|assign|delete` opens that plan straight away, so other screens
   * (Shift Monitoring's quick actions, for one) can link to a specific plan action.
   */
  const deepLinkPlanId = query.get("plan") ?? "";
  const deepLinkAction = query.get("action") ?? "view";

  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const [page, setPage] = useState(1);
  const [formTarget, setFormTarget] = useState<CleaningPlan | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CleaningPlan | null>(null);
  const [justCreated, setJustCreated] = useState<CleaningPlan | null>(null);
  const [viewTarget, setViewTarget] = useState<CleaningPlan | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => setPage(1), [searchTerm, clientId, locationId]);

  const { data: deepLinkPlan } = useGetCleaningPlanQuery(deepLinkPlanId, { skip: !deepLinkPlanId });

  useEffect(() => {
    if (!deepLinkPlan) return;
    if (deepLinkAction === "edit") setFormTarget(deepLinkPlan);
    else if (deepLinkAction === "delete") setDeleteTarget(deepLinkPlan);
    else setViewTarget(deepLinkPlan);
    // Drop the params, so closing the modal does not immediately reopen it.
    router.replace(localizePath("/cleaning-plans", locale));
  }, [deepLinkPlan, deepLinkAction, locale, router]);

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

  // Auto-fallback: if current page has no data and we are past page 1, redirect to previous page
  useEffect(() => {
    if (!isFetching && data && plans.length === 0 && page > 1) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  }, [isFetching, data, plans.length, page]);

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
          <h1 className="text-xl font-bold text-slate-900">{ui.cleaningPlansTitle}</h1>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {total}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">{ui.cleaningPlansSubtitle}</p>
      </header>

      <div className="grid gap-2 rounded-xl bg-white p-2 ring-1 ring-slate-200/70 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_auto]">
        <SearchInput value={search} onChange={setSearch} placeholder={ui.searchCleaningPlans} />

        <Select
          value={clientId}
          onValueChange={(value) => applyScope({ client: value })}
          placeholder={ui.allClients}
          options={[
            { value: "", label: ui.allClients },
            ...(clientPage?.result ?? []).map((client) => ({
              value: client._id,
              label: clientLabel(client),
            })),
          ]}
        />

        <Select
          value={locationId}
          onValueChange={(value) => applyScope({ client: clientId, location: value })}
          placeholder={ui.allLocationsFilter}
          options={[
            { value: "", label: ui.allLocationsFilter },
            ...locations.map((location) => ({ value: location._id, label: location.name })),
          ]}
        />

        <Button className="md:col-span-2 xl:col-span-1" onClick={() => setFormTarget("new")}>
          <MdAdd className="text-base" /> {ui.addCleaningPlan}
        </Button>
      </div>

      {message && <ErrorNotice message={message} />}

      {isFetching ? (
        <CardGridSkeleton />
      ) : plans.length === 0 ? (
        <div className="rounded-xl bg-white px-4 py-20 text-center ring-1 ring-slate-200/70">
          <MdOutlineAssignment className="mx-auto text-5xl text-slate-200" />
          <p className="mt-4 text-sm font-semibold text-slate-900">{ui.noCleaningPlans}</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            {searchTerm || clientId || locationId
              ? ui.nothingMatchesFilters
              : ui.noPlansScheduled}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              onSelect={setViewTarget}
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
        itemCount={plans.length}
        onPageChange={setPage}
      />

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
        />
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
          confirmText={ui.delete}
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

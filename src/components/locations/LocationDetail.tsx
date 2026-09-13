"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MdArrowBack, MdBusiness, MdOutlineAssignment } from "react-icons/md";
import { useGetLocationQuery } from "@/redux/api/endpoints/locations.api";
import { useGetRoomCatalogQuery } from "@/redux/api/endpoints/catalog.api";
import { useGetCleaningPlanListQuery, type CleaningPlan } from "@/redux/api/endpoints/cleaningPlans.api";
import { PlanCard } from "@/components/cleaningPlans/PlanCard";
import { PlanDetailModal } from "@/components/cleaningPlans/PlanDetailModal";
import { LocationForm } from "./LocationForm";
import { RoomsView } from "@/components/rooms/RoomsView";
import { CardGridSkeleton, EmptyState, ErrorNotice } from "@/components/shared/ListStates";
import { apiError } from "@/redux/api/apiError";
import { refId } from "@/redux/api/types";
import { getLocale, localizePath } from "@/lib/locale";

export function LocationDetail({ clientId, locationId }: { clientId: string; locationId: string }) {
  const locale = getLocale(usePathname());
  const router = useRouter();
  const query = useSearchParams();
  const tab = query.get('tab') === 'rooms' ? 'Rooms' : query.get('tab') === 'cleaning-plan' ? 'Cleaning plan' : 'Overview';
  const setTab = (name: string) => router.replace(localizePath(`/clients/${clientId}/locations/${locationId}?tab=${name.toLowerCase().replace(' ', '-')}`, locale));
  const [editing, setEditing] = useState(false);
  const [viewPlan, setViewPlan] = useState<CleaningPlan | null>(null);
  const { data: location, isLoading, error } = useGetLocationQuery(locationId);
  const { currentData: rooms = [] } = useGetRoomCatalogQuery({ clientId, locationId }, { refetchOnMountOrArgChange: false });
  // The plans belonging to this client at this location — the same filter pair the
  // /cleaning-plans page uses, so both screens agree on what belongs here.
  const { data: planPage, isFetching: loadingPlans, error: plansError } = useGetCleaningPlanListQuery(
    { client: clientId, location: locationId, limit: 50 },
    { skip: tab !== 'Cleaning plan' },
  );
  const plans = planPage?.result ?? [];
  const base = `/clients/${clientId}/locations`;
  if (isLoading) return <CardGridSkeleton />;
  if (error) return <ErrorNotice message={apiError(error)} />;
  if (!location || refId(location.client) !== clientId) return <ErrorNotice message="Location not found for this client." />;
  return <div className="space-y-4">
    <nav aria-label="Breadcrumb" className="flex gap-2 text-xs text-slate-500"><Link href={localizePath(base, locale)}>Locations</Link><span>›</span><span className="text-primary">{location.name}</span></nav>
    <header className="flex items-center gap-3 rounded border border-slate-200 bg-white p-5">
      <Link aria-label="Back to client locations" href={localizePath(base, locale)} className="rounded border border-slate-200 p-2"><MdArrowBack /></Link><MdBusiness className="text-3xl text-primary" /><div className="flex-1"><h2 className="font-bold">{location.name}</h2><p className="mt-1 text-xs text-slate-400">{location.address}</p></div><button onClick={() => setEditing(true)} className="rounded border border-slate-200 px-3 py-2 text-xs text-primary">Edit location</button>
    </header>
    <nav aria-label="Location sections" className="flex border-b border-slate-200">{['Overview', 'Rooms', 'Cleaning plan'].map((name) => <button key={name} onClick={() => setTab(name)} aria-pressed={tab === name} className={`border-b-2 px-4 py-3 text-xs ${tab === name ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}>{name}{name === 'Rooms' ? ` (${rooms.length})` : ''}</button>)}</nav>
    {tab === 'Overview' && <div className="grid gap-4 sm:grid-cols-3">{[['Address', location.address], ['Rooms', rooms.length], ['Status', location.is_active ? 'Active' : 'Inactive'], ['Type', location.type || '—'], ['Description', location.description || '—']].map(([label, value]) => <div key={label} className="rounded border border-slate-200 bg-white p-5"><p className="text-xs uppercase text-slate-400">{label}</p><p className="mt-2 text-sm font-medium">{value}</p></div>)}</div>}
    {tab === 'Rooms' && <RoomsView scopedClientId={clientId} scopedLocationId={locationId} />}
    {tab === 'Cleaning plan' && (loadingPlans && plans.length === 0 ? <CardGridSkeleton count={3} />
      : plansError ? <ErrorNotice message={apiError(plansError)} />
      : plans.length === 0 ? <EmptyState icon={<MdOutlineAssignment />} title="No cleaning plans" description={`No cleaning plans are scheduled for ${location.name} yet.`} />
      : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => <PlanCard key={plan._id} plan={plan} onSelect={setViewPlan} />)}</div>)}
    {viewPlan && <PlanDetailModal planId={viewPlan._id} onClose={() => setViewPlan(null)} />}
    {editing && <LocationForm location={location} onClose={() => setEditing(false)} />}
  </div>;
}

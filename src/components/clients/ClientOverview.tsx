"use client";
import { use } from "react";
import { useClientById } from "@/redux/api/endpoints/clients.api";
import { useGetClientLocationsQuery } from "@/redux/api/endpoints/locations.api";
import { CardGridSkeleton } from "@/components/shared/ListStates";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
export default function ClientOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ui = getUiTranslation(getLocale(usePathname()));
  const { client, isLoading } = useClientById(id);
  const { data } = useGetClientLocationsQuery({ clientId: id, limit: 1 });
  if (isLoading) return <CardGridSkeleton />;
  const fields = [[ui.companyName, client?.company_name || client?.name], [ui.licenceExpiryDate, client?.licence_expiration_date?.slice(0, 10)], [ui.locations, data?.meta.total], [ui.email, client?.email], [ui.phone, client?.phone]];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{fields.map(([label, value]) => <div key={label} className="rounded bg-white/60 p-4"><p className="text-[11px] uppercase text-slate-400">{label}</p><p className="mt-2 break-words text-sm font-medium text-slate-900">{value ?? '—'}</p></div>)}</div>;
}

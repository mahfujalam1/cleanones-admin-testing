"use client";

import { usePathname } from "next/navigation";
import { clientCompanyLabel, CLIENT_LOOKUP_ARGS, useGetClientsQuery } from "@/redux/api/endpoints/clients.api";
import { useGetLocationCatalogQuery } from "@/redux/api/endpoints/catalog.api";
import { refId } from "@/redux/api/types";
import { Select } from "@/components/ui/select";
import { getLocale } from "@/lib/locale";
import { getScreenCopy } from "@/lib/screen-copy";



export function CatalogFilters({
  clientId,
  locationId,
  onClient,
  onLocation,
}: {
  clientId: string;
  locationId: string;
  onClient: (id: string) => void;
  onLocation: (id: string) => void;
}) {
  const copy = getScreenCopy(getLocale(usePathname()));
  const { data: clients } = useGetClientsQuery(CLIENT_LOOKUP_ARGS);
  const { data: locations = [] } = useGetLocationCatalogQuery(undefined, { refetchOnMountOrArgChange: false });

  const forClient = locations.filter((location) => !clientId || refId(location.client) === clientId);

  return (
    <>
      <Select
        value={clientId}
        onValueChange={onClient}
        placeholder={copy.allClients}
        options={[
          { value: "", label: copy.allClients },
          ...(clients?.result ?? []).map((client) => ({
            value: client._id,
            label: clientCompanyLabel(client),
          })),
        ]}
      />
      <Select
        value={locationId}
        onValueChange={onLocation}
        placeholder={copy.allLocations}
        options={[
          { value: "", label: copy.allLocations },
          ...forClient.map((location) => ({ value: location._id, label: location.name })),
        ]}
      />
    </>
  );
}

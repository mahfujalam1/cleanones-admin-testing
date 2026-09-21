"use client";

import { clientCompanyLabel, CLIENT_LOOKUP_ARGS, useGetClientsQuery } from "@/redux/api/endpoints/clients.api";
import { useGetLocationCatalogQuery } from "@/redux/api/endpoints/catalog.api";
import { refId } from "@/redux/api/types";
import { Select } from "@/components/ui/select";



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
  const { data: clients } = useGetClientsQuery(CLIENT_LOOKUP_ARGS);
  const { data: locations = [] } = useGetLocationCatalogQuery(undefined, { refetchOnMountOrArgChange: false });

  const forClient = locations.filter((location) => !clientId || refId(location.client) === clientId);

  return (
    <>
      <Select
        value={clientId}
        onValueChange={onClient}
        placeholder="All clients"
        options={[
          { value: "", label: "All clients" },
          ...(clients?.result ?? []).map((client) => ({
            value: client._id,
            label: clientCompanyLabel(client),
          })),
        ]}
      />
      <Select
        value={locationId}
        onValueChange={onLocation}
        placeholder="All locations"
        options={[
          { value: "", label: "All locations" },
          ...forClient.map((location) => ({ value: location._id, label: location.name })),
        ]}
      />
    </>
  );
}

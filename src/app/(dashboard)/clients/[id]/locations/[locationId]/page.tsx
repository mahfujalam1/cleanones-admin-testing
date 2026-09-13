"use client";
import { use, Suspense } from "react";
import { LocationDetail } from "@/components/locations/LocationDetail";
export default function LocationPage({ params }: { params: Promise<{ id: string; locationId: string }> }) {
  const { id, locationId } = use(params);
  return <Suspense><LocationDetail key={locationId} clientId={id} locationId={locationId} /></Suspense>;
}

"use client";
import { Suspense } from "react";
import { RoomsView } from "@/components/rooms/RoomsView";
import { CardGridSkeleton } from "@/components/shared/ListStates";
export default function RoomsPage() { return <Suspense fallback={<CardGridSkeleton />}><RoomsView /></Suspense>; }

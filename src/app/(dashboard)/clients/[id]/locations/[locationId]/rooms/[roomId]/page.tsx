"use client";
import { use, Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdArrowBack, MdMeetingRoom } from "react-icons/md";
import { useGetRoomQuery } from "@/redux/api/endpoints/rooms.api";
import { useGetLocationQuery } from "@/redux/api/endpoints/locations.api";
import { TasksView } from "@/components/tasks/TasksView";
import { RoomForm } from "@/components/rooms/RoomForm";
import { ErrorNotice, CardGridSkeleton } from "@/components/shared/ListStates";
import { apiError } from "@/redux/api/apiError";
import { refId } from "@/redux/api/types";
import { getLocale, localizePath } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
export default function RoomPage({ params }: { params: Promise<{ id: string; locationId: string; roomId: string }> }) {
  const { id, locationId, roomId } = use(params);
  const locale = getLocale(usePathname());
  const ui = getUiTranslation(getLocale(usePathname()));
  const [editing, setEditing] = useState(false);
  const { data: room, isLoading, error } = useGetRoomQuery(roomId);
  const { data: location, isLoading: loadingLocation, error: locationError } = useGetLocationQuery(locationId);
  const base = `/clients/${id}/locations`;
  if (isLoading || loadingLocation) return <CardGridSkeleton />;
  if (error || locationError) return <ErrorNotice message={apiError(error || locationError)} />;
  if (!room || !location || refId(room.location) !== locationId || refId(location.client) !== id) return <ErrorNotice message={ui.roomNotFound} />;
  return <div className="space-y-5"><nav aria-label={ui.breadcrumb} className="flex flex-wrap gap-2 text-xs text-slate-500"><Link href={localizePath(base, locale)}>{ui.locations}</Link><span>›</span><Link href={localizePath(`${base}/${locationId}?tab=rooms`, locale)}>{location.name}</Link><span>›</span><span className="text-primary">{room.name}</span></nav>
    <header className="flex items-center gap-3 rounded border border-slate-200 bg-white p-5"><Link aria-label={ui.backToLocationRooms} href={localizePath(`${base}/${locationId}?tab=rooms`, locale)} className="rounded border border-slate-200 p-2"><MdArrowBack /></Link><MdMeetingRoom className="text-3xl text-amber-500" /><div className="flex-1"><h2 className="font-bold">{room.name}</h2><p className="mt-1 text-xs text-amber-600">{room.room_type}</p></div><button onClick={() => setEditing(true)} className="rounded bg-primary px-4 py-2 text-xs font-semibold text-white">{ui.editRoom}</button></header>
    <div className="grid gap-5 xl:grid-cols-[1fr_280px]"><Suspense><TasksView key={roomId} scopedLocationId={locationId} scopedRoomId={roomId} /></Suspense><aside className="space-y-4"><div className="rounded border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-400">{ui.location}</p><p className="mt-2 text-sm">{location.name}</p></div><div className="rounded border border-slate-200 bg-white p-4"><p className="text-xs uppercase text-slate-400">{ui.cleaningType}</p><p className="mt-2 text-sm">{room.cleaning_type || '—'}</p></div></aside></div>
    {editing && <RoomForm room={room} locationId={locationId} onClose={() => setEditing(false)} />}
  </div>;
}

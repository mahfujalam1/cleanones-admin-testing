"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MdAdd, MdMeetingRoom } from "react-icons/md";
import { RoomCard } from "./RoomCard";
import { RoomForm } from "./RoomForm";
import { CatalogFilters } from "@/components/shared/CatalogFilters";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { CardGridSkeleton, EmptyState, ErrorNotice, SearchInput } from "@/components/shared/ListStates";
import { useGetRoomCatalogQuery } from "@/redux/api/endpoints/catalog.api";
import { useDeleteRoomMutation, type Room } from "@/redux/api/endpoints/rooms.api";
import { refId, refDoc } from "@/redux/api/types";
import { apiError } from "@/redux/api/apiError";
import { getLocale, localizePath } from "@/lib/locale";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export function RoomsView({ scopedClientId, scopedLocationId }: { scopedClientId?: string; scopedLocationId?: string } = {}) {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const query = useSearchParams();
  const clientId = scopedClientId ?? query.get('client') ?? '';
  const locationId = scopedLocationId ?? query.get('location') ?? '';
  const roomId = scopedLocationId ? '' : query.get('room') ?? '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [createLocation, setCreateLocation] = useState('');
  const [edit, setEdit] = useState<Room | null>(null);
  const [remove, setRemove] = useState<Room | null>(null);
  const [actionError, setActionError] = useState('');
  const { currentData: rooms = [], isFetching, error } = useGetRoomCatalogQuery({ clientId: clientId || undefined, locationId: locationId || undefined }, { refetchOnMountOrArgChange: false });
  const [deleteRoom, { isLoading: deleting }] = useDeleteRoomMutation();
  const filtered = rooms.filter((room) => (!roomId || room._id === roomId) && `${room.name} ${room.room_type} ${refDoc(room.location)?.name ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 12)));
  function filter(client: string, location: string, room = '') {
    const next = new URLSearchParams();
    if (client) next.set('client', client);
    if (location) next.set('location', location);
    if (room) next.set('room', room);
    setPage(1);
    router.replace(localizePath(`/rooms?${next}`, locale));
  }
  const add = <Button onClick={() => { setCreateLocation(locationId); setCreating(true); }}><MdAdd className="text-base" /> Add room</Button>;
  return <div className="space-y-4">
    <div className={`grid gap-2 rounded-xl bg-white p-2 ring-1 ring-slate-200/70 ${scopedLocationId ? 'sm:grid-cols-[1fr_auto]' : 'md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto]'}`}>
      <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search rooms…" />
      {!scopedLocationId && <><CatalogFilters clientId={clientId} locationId={locationId} onClient={(id) => filter(id, '')} onLocation={(id) => filter(clientId, id)} /><Select value={roomId} onValueChange={(value) => filter(clientId, locationId, value)} placeholder="All rooms" options={[{ value: '', label: 'All rooms' }, ...rooms.map((room) => ({ value: room._id, label: room.name }))]} /></>}
      {add}
    </div>
    {(error || actionError) && <ErrorNotice message={actionError || apiError(error)} />}
    {isFetching ? <CardGridSkeleton /> : filtered.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{filtered.slice((currentPage - 1) * 12, currentPage * 12).map((room) => <RoomCard key={room._id} room={room} onEdit={setEdit} onDelete={setRemove} onSelect={() => {
      const location = refDoc(room.location);
      const client = scopedClientId || refId(location?.client);
      if (client) router.push(localizePath(`/clients/${client}/locations/${refId(room.location)}/rooms/${room._id}`, locale));
    }} />)}</div> : !error && <EmptyState icon={<MdMeetingRoom />} title="No rooms found" description="Try another filter or add a room." action={add} />}
    <BackendPagination page={currentPage} limit={12} total={filtered.length} onPageChange={setPage} />
    {/* No location yet means the form asks for client and location itself. */}
    {creating && <RoomForm locationId={createLocation || undefined} onClose={() => setCreating(false)} />}
    {edit && <RoomForm room={edit} locationId={refId(edit.location)} onClose={() => setEdit(null)} />}
    {remove && <ConfirmDialog title="Deactivate room?" description={`${remove.name} will be marked inactive.`} confirmText="Deactivate" loading={deleting} onClose={() => !deleting && setRemove(null)} onConfirm={async () => { try { await deleteRoom({ id: remove._id, locationId: refId(remove.location) }).unwrap(); setRemove(null); } catch (e) { setActionError(apiError(e)); } }} />}
  </div>;
}

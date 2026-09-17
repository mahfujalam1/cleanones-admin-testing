"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MdAdd, MdMeetingRoom } from "react-icons/md";
import { RoomCard } from "./RoomCard";
import { RoomForm } from "./RoomForm";
import { CatalogFilters } from "@/components/shared/CatalogFilters";
import { getUiTranslation } from "@/lib/translations";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { BackendPagination } from "@/components/shared/BackendPagination";
import {
  CardGridSkeleton,
  EmptyState,
  ErrorNotice,
  SearchInput,
} from "@/components/shared/ListStates";
import { useGetRoomCatalogQuery, useGetLocationCatalogQuery } from "@/redux/api/endpoints/catalog.api";
import {
  useDeleteRoomMutation,
  type Room,
} from "@/redux/api/endpoints/rooms.api";
import { refId, refDoc } from "@/redux/api/types";
import { apiError } from "@/redux/api/apiError";
import { getLocale, localizePath } from "@/lib/locale";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export function RoomsView({
  scopedClientId,
  scopedLocationId,
}: { scopedClientId?: string; scopedLocationId?: string } = {}) {
  const router = useRouter();
  const locale = getLocale(usePathname());
  const ui = getUiTranslation(locale);
  
  // Default to empty ("All") so no filter is selected on initial page load
  const [clientId, setClientId] = useState(scopedClientId ?? "");
  const [locationId, setLocationId] = useState(scopedLocationId ?? "");
  const [roomId, setRoomId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [createLocation, setCreateLocation] = useState("");
  const [edit, setEdit] = useState<Room | null>(null);
  const [remove, setRemove] = useState<Room | null>(null);
  const [actionError, setActionError] = useState("");

  // Clear any old leftover search params from previous redirects
  useEffect(() => {
    if (!scopedLocationId && typeof window !== "undefined" && window.location.search) {
      router.replace(localizePath("/rooms", locale));
    }
  }, [scopedLocationId, router, locale]);

  const { data: allLocations = [] } = useGetLocationCatalogQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const {
    currentData: rooms = [],
    isFetching,
    error,
  } = useGetRoomCatalogQuery(
    { clientId: clientId || undefined, locationId: locationId || undefined },
    { refetchOnMountOrArgChange: false },
  );
  const [deleteRoom, { isLoading: deleting }] = useDeleteRoomMutation();
  const filtered = rooms.filter(
    (room) =>
      (!roomId || room._id === roomId) &&
      `${room.name} ${room.room_type} ${refDoc(room.location)?.name ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / 16)),
  );

  useEffect(() => {
    if (page > currentPage) {
      setPage(currentPage);
    }
  }, [page, currentPage]);
  function filter(newClient: string, newLocation: string, newRoom = "") {
    setClientId(newClient);
    setLocationId(newLocation);
    setRoomId(newRoom);
    setPage(1);
    const next = new URLSearchParams();
    if (newClient) next.set("client", newClient);
    if (newLocation) next.set("location", newLocation);
    if (newRoom) next.set("room", newRoom);
    const qStr = next.toString();
    router.replace(localizePath(`/rooms${qStr ? `?${qStr}` : ""}`, locale));
  }
  const add = (
    <Button
      onClick={() => {
        setCreateLocation(locationId);
        setCreating(true);
      }}
    >
      <MdAdd className="text-base" /> {ui.addRoom}
    </Button>
  );
  return (
    <div className="space-y-6 pb-16">
      {!scopedLocationId && (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{ui.rooms}</h1>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {filtered.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {ui.roomsSubtitle}
            </p>
          </div>
        </header>
      )}

      <div
        className={`grid gap-2 rounded-xl bg-white p-2 ring-1 ring-slate-200/70 ${scopedLocationId ? "sm:grid-cols-[1fr_auto]" : "md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"}`}
      >
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={ui.searchRooms}
        />
        {!scopedLocationId && (
          <>
            <CatalogFilters
              clientId={clientId}
              locationId={locationId}
              onClient={(id) => filter(id, "")}
              onLocation={(id) => filter(clientId, id)}
            />
            <Select
              value={roomId}
              onValueChange={(value) => filter(clientId, locationId, value)}
              placeholder={ui.allRooms}
              options={[
                { value: "", label: ui.allRooms },
                ...rooms.map((room) => ({ value: room._id, label: room.name })),
              ]}
            />
          </>
        )}
        {add}
      </div>
      {(error || actionError) && (
        <ErrorNotice message={actionError || apiError(error)} />
      )}
      {isFetching ? (
        <CardGridSkeleton />
      ) : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered
            .slice((currentPage - 1) * 16, currentPage * 16)
            .map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                onEdit={setEdit}
                onDelete={setRemove}
                onSelect={() => {
                  const location = refDoc(room.location);
                  const client = scopedClientId || refId(location?.client);
                  if (client)
                    router.push(
                      localizePath(
                        `/clients/${client}/locations/${refId(room.location)}/rooms/${room._id}`,
                        locale,
                      ),
                    );
                }}
              />
            ))}
        </div>
      ) : (
        !error && (
          <EmptyState
            icon={<MdMeetingRoom />}
            title={ui.noRoomsFound}
            description={ui.tryAnotherFilter}
            action={add}
          />
        )
      )}
      <BackendPagination
        page={currentPage}
        limit={16}
        total={filtered.length}
        onPageChange={setPage}
        itemLabel="rooms"
      />
      {/* Inside a client's location both are fixed by the page; on the global Rooms list the
          form asks for them itself. */}
      {creating && (
        <RoomForm
          clientId={scopedClientId}
          locationId={createLocation || ""}
          lockScope={Boolean(scopedLocationId)}
          onClose={() => setCreating(false)}
        />
      )}
      {edit && (
        <RoomForm
          room={edit}
          clientId={scopedClientId}
          locationId={refId(edit.location)}
          lockScope={Boolean(scopedLocationId)}
          onClose={() => setEdit(null)}
        />
      )}
      {remove && (
        <ConfirmDialog
          title={ui.deleteRoom}
          description={`${remove.name} will be removed.`}
          confirmText={ui.delete}
          loading={deleting}
          onClose={() => !deleting && setRemove(null)}
          onConfirm={async () => {
            try {
              await deleteRoom({
                id: remove._id,
                locationId: refId(remove.location),
              }).unwrap();
              setRemove(null);
            } catch (e) {
              setActionError(apiError(e));
            }
          }}
        />
      )}
    </div>
  );
}

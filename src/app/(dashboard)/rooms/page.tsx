"use client";

import { AddRoomModal } from '@/components/rooms/AddRoomModal';
import { RoomDetailSidebar } from '@/components/rooms/RoomDetailsSidebar';
import { Room, RoomType } from '@/components/rooms/types';
import React, { useCallback, useEffect, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { TbDoor, TbClock, TbCamera, TbChecklist } from 'react-icons/tb';
import { getRoomLocations, getRooms } from '@/services/actions/rooms';
import { getClientOptions, type ClientOption } from '@/services/actions/locations';
import { getPlanRooms, type PlanRoomOption } from '@/services/actions/cleaningPlans';
import { CardGridSkeleton } from '@/components/shared/SkeletonLoader';
import { BackendPagination } from '@/components/shared/BackendPagination';
import { Select } from '@/components/ui/select';

import { useGetRoomsQuery } from '@/redux/api/dashboardApi';

const ALL_FILTER_VALUE = '__all__';
const ROOMS_PAGE_LIMIT = 12;
type LocationOption = { id: string; name: string; total_rooms: number };

const title = (val?: string) => val ? val.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Standard';

const typeColors: Record<RoomType, { text: string; bg: string }> = {
    Standard: { text: 'text-[#0ea5e9]', bg: 'bg-[#e0f2fe]' },
    Deluxe: { text: 'text-purple-500', bg: 'bg-purple-50' },
    Suite: { text: 'text-amber-500', bg: 'bg-amber-50' },
    'Junior Suite': { text: 'text-pink-500', bg: 'bg-pink-50' },
};

export default function RoomsPage() {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [error, setError] = useState('');
    const [filterError, setFilterError] = useState('');
    const [page, setPage] = useState(1);
    const [clientId, setClientId] = useState('');
    const [locationId, setLocationId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [locations, setLocations] = useState<LocationOption[]>([]);
    const [roomOptions, setRoomOptions] = useState<PlanRoomOption[]>([]);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [roomOptionsLoading, setRoomOptionsLoading] = useState(false);

    const { data: roomsRes, isLoading: loading, refetch } = useGetRoomsQuery({
        search: search.trim() || undefined,
        client_id: clientId || undefined,
        location_id: locationId || undefined,
        room_id: roomId || undefined,
        page,
        limit: ROOMS_PAGE_LIMIT,
    });

    const rawRooms = roomsRes?.rooms ?? [];
    const total = roomsRes?.total_count ?? 0;
    const rooms: Room[] = rawRooms.map((item) => ({
        id: item.room_id,
        name: item.room_name,
        type: title(item.room_type),
        location: item.location_name,
        floor: '',
        duration: 0,
        photos: item.total_photos_required || item.photo_number,
        tasks: item.task_number,
        cleaningPlan: title(item.clean_type),
    }));

    useEffect(() => {
        let active = true;
        void getClientOptions(1, 100).then((result) => {
            if (!active) return;
            setClientsLoading(false);
            if (!result.success) return setFilterError(result.error);
            setFilterError('');
            setClients(result.data.clients);
        });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;
        if (!clientId) return () => { active = false; };

        void getRoomLocations(clientId).then((result) => {
            if (!active) return;
            setLocationsLoading(false);
            if (!result.success) return setFilterError(result.error);
            setFilterError('');
            setLocations(result.data.locations);
        });
        return () => { active = false; };
    }, [clientId]);

    useEffect(() => {
        let active = true;
        if (!clientId || !locationId) return () => { active = false; };

        void getPlanRooms({ clientId, locationId, page: 1, limit: 100 }).then((result) => {
            if (!active) return;
            setRoomOptionsLoading(false);
            if (!result.success) return setFilterError(result.error);
            setFilterError('');
            setRoomOptions(result.data.rooms);
        });
        return () => { active = false; };
    }, [clientId, locationId]);

    const handleClientChange = (value: string) => {
        const nextClientId = value === ALL_FILTER_VALUE ? '' : value;
        setFilterError('');
        setClientId(nextClientId);
        setLocationId('');
        setRoomId('');
        setLocations([]);
        setRoomOptions([]);
        setLocationsLoading(Boolean(nextClientId));
        setRoomOptionsLoading(false);
        setPage(1);
    };

    const handleLocationChange = (value: string) => {
        const nextLocationId = value === ALL_FILTER_VALUE ? '' : value;
        setFilterError('');
        setLocationId(nextLocationId);
        setRoomId('');
        setRoomOptions([]);
        setRoomOptionsLoading(Boolean(clientId && nextLocationId));
        setPage(1);
    };

    const handleRoomChange = (value: string) => {
        setRoomId(value === ALL_FILTER_VALUE ? '' : value);
        setPage(1);
    };

    const handleAdd = () => {
        setShowModal(false);
        void refetch();
    };

    return (
        <div className="min-h-screen">
            {/* Filters & Action Bar */}
            <div className="mb-5 flex flex-col gap-3 rounded border border-gray-200 bg-white p-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="relative">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search rooms..."
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            className="h-10 w-full rounded border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
                        />
                    </div>
                    <Select
                        value={clientsLoading ? '' : clientId || ALL_FILTER_VALUE}
                        onValueChange={handleClientChange}
                        options={[
                            { value: ALL_FILTER_VALUE, label: 'All clients' },
                            ...clients.map((client) => ({
                                value: client.id,
                                label: client.company_name || client.primary_contact_name || 'Unnamed client',
                            })),
                        ]}
                        placeholder={clientsLoading ? 'Loading clients...' : 'All clients'}
                        disabled={clientsLoading}
                    />
                    <Select
                        value={locationsLoading ? '' : locationId || (clientId ? ALL_FILTER_VALUE : '')}
                        onValueChange={handleLocationChange}
                        options={[
                            { value: ALL_FILTER_VALUE, label: 'All locations' },
                            ...locations.map((location) => ({ value: location.id, label: location.name })),
                        ]}
                        placeholder={!clientId ? 'Select client first' : locationsLoading ? 'Loading locations...' : 'All locations'}
                        disabled={!clientId || locationsLoading}
                    />
                    <Select
                        value={roomOptionsLoading ? '' : roomId || (locationId ? ALL_FILTER_VALUE : '')}
                        onValueChange={handleRoomChange}
                        options={[
                            { value: ALL_FILTER_VALUE, label: 'All rooms' },
                            ...roomOptions.map((room) => ({ value: room.room_id, label: room.room_name })),
                        ]}
                        placeholder={!locationId ? 'Select location first' : roomOptionsLoading ? 'Loading rooms...' : 'All rooms'}
                        disabled={!locationId || roomOptionsLoading}
                    />
                </div>
                <div className="flex justify-end shrink-0">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex h-10 items-center justify-center gap-1.5 rounded bg-[#0ea5e9] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7] cursor-pointer whitespace-nowrap"
                    >
                        + Add Room
                    </button>
                </div>
            </div>

            {/* Cards Grid */}
            <div>
                {filterError && <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{filterError}</p>}
                {error && <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
                {loading ? <CardGridSkeleton /> : rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <TbDoor className="text-5xl text-gray-300 mb-3" />
                        <p className="text-sm font-semibold text-gray-500">No rooms found</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different search or add a new room.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rooms.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                onClick={() => setSelectedRoom(room)}
                                isSelected={selectedRoom?.id === room.id}
                            />
                        ))}
                    </div>
                )}
            </div>
            <BackendPagination page={page} limit={ROOMS_PAGE_LIMIT} total={total} onPageChange={setPage} />

            {/* Modal */}
            {showModal && (
                <AddRoomModal
                    onClose={() => setShowModal(false)}
                    onAdd={handleAdd}
                />
            )}

            {/* Sidebar */}
            {selectedRoom && (
                <RoomDetailSidebar
                    room={selectedRoom}
                    onClose={() => setSelectedRoom(null)}
                />
            )}
        </div>
    );
}

interface RoomCardProps {
    room: Room;
    onClick: () => void;
    isSelected: boolean;
}

function RoomCard({ room, onClick, isSelected }: RoomCardProps) {
    const colors = typeColors[room.type] ?? typeColors.Standard;

    return (
        <div
            onClick={onClick}
            className={`dashboard-card flex flex-col justify-between h-full cursor-pointer transition-[border-color,box-shadow] hover:border-[#d7dbe4] hover:shadow ${isSelected ? 'border-[#0ea5e9]/50 shadow ring-1 ring-[#0ea5e9]/20' : ''
                }`}
        >
            <div className="flex-1 flex flex-col min-w-0">
                {/* Card Header */}
                <div className="px-3.5 pt-3 pb-2 flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded ${colors.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <TbDoor className={`${colors.text} text-base`} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 leading-tight">{room.name}</p>
                        <p className={`text-[10px] font-medium mt-0.5 ${colors.text}`}>{room.type}</p>
                    </div>
                </div>

                {/* Location + Floor */}
                <div className="px-3.5 pb-2.5">
                    <p className="text-xs text-gray-700 font-medium truncate">{room.location}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{room.floor}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 mx-3.5" />

                {/* Stats */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 mt-auto">
                    <div className="py-2 flex flex-col items-center gap-0.5">
                        <TbClock className="text-gray-300 text-sm" />
                        <p className="text-xs font-bold text-gray-800">{room.duration}m</p>
                        <p className="text-[10px] text-gray-400">Duration</p>
                    </div>
                    <div className="py-2 flex flex-col items-center gap-0.5">
                        <TbCamera className="text-gray-300 text-sm" />
                        <p className="text-xs font-bold text-gray-800">{room.photos}</p>
                        <p className="text-[10px] text-gray-400">Photos</p>
                    </div>
                    <div className="py-2 flex flex-col items-center gap-0.5">
                        <TbChecklist className="text-gray-300 text-sm" />
                        <p className="text-xs font-bold text-gray-800">{room.tasks}</p>
                        <p className="text-[10px] text-gray-400">Tasks</p>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mx-3.5" />

            {/* Cleaning Plan */}
            <div className="px-3.5 py-2 mt-auto">
                <p className={`text-xs font-semibold ${colors.text}`}>{room.cleaningPlan}</p>
            </div>
        </div>
    );
}

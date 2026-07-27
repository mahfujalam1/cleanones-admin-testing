"use client";

import { AddRoomModal } from '@/components/rooms/AddRoomModal';
import { mockRooms } from '@/components/rooms/MockData';
import { RoomDetailSidebar } from '@/components/rooms/RoomDetailsSidebar';
import { Room, RoomType } from '@/components/rooms/types';
import React, { useState, useMemo } from 'react';
import { MdOutlineLocationOn, MdSearch } from 'react-icons/md';
import { TbDoor, TbClock, TbCamera, TbChecklist } from 'react-icons/tb';

const typeColors: Record<RoomType, { text: string; bg: string }> = {
    Standard: { text: 'text-[#0ea5e9]', bg: 'bg-[#e0f2fe]' },
    Deluxe: { text: 'text-purple-500', bg: 'bg-purple-50' },
    Suite: { text: 'text-amber-500', bg: 'bg-amber-50' },
    'Junior Suite': { text: 'text-pink-500', bg: 'bg-pink-50' },
};

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>(mockRooms);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return rooms.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.location.toLowerCase().includes(q) ||
                r.type.toLowerCase().includes(q) ||
                r.floor.toLowerCase().includes(q)
        );
    }, [rooms, search]);

    const handleAdd = (data: Omit<Room, 'id'>) => {
        const newRoom: Room = {
            ...data,
            id: `R${String(rooms.length + 1).padStart(3, '0')}`,
        };
        setRooms((prev) => [...prev, newRoom]);
        setShowModal(false);
    };

    return (
        <div className="min-h-screen">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-5">
                {/* Search */}
                <div>
                    <div className="relative w-full max-w-sm">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search rooms..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded text-sm w-64 focus:outline-none shadow-sm bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded shadow-sm transition-colors cursor-pointer"
                    >
                        + Add Room
                    </button>
                </div>
            </div>

            {/* Cards Grid */}
            <div>
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <TbDoor className="text-5xl text-gray-300 mb-3" />
                        <p className="text-sm font-semibold text-gray-500">No rooms found</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different search or add a new room.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((room) => (
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
    const colors = typeColors[room.type];

    return (
        <div
            onClick={onClick}
            className={`dashboard-card cursor-pointer transition-[border-color,box-shadow] hover:border-[#d7dbe4] hover:shadow ${isSelected ? 'border-[#0ea5e9]/50 shadow ring-1 ring-[#0ea5e9]/20' : ''
                }`}
        >
            {/* Card Header */}
            <div className="px-4 pt-4 pb-2 flex items-start gap-3">
                <div className={`w-9 h-9 rounded ${colors.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <TbDoor className={`${colors.text} text-lg`} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{room.name}</p>
                    <p className={`text-xs font-medium mt-0.5 ${colors.text}`}>{room.type}</p>
                </div>
            </div>

            {/* Location + Floor */}
            <div className="px-4 pb-3">
                <p className="text-xs text-gray-700 font-medium truncate">{room.location}</p>
                <p className="text-xs text-gray-400 mt-0.5">{room.floor}</p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mx-4" />

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 px-0">
                <div className="py-3 flex flex-col items-center gap-1">
                    <TbClock className="text-gray-300 text-base" />
                    <p className="text-sm font-bold text-gray-800">{room.duration}m</p>
                    <p className="text-[10px] text-gray-400">Duration</p>
                </div>
                <div className="py-3 flex flex-col items-center gap-1">
                    <TbCamera className="text-gray-300 text-base" />
                    <p className="text-sm font-bold text-gray-800">{room.photos}</p>
                    <p className="text-[10px] text-gray-400">Photos</p>
                </div>
                <div className="py-3 flex flex-col items-center gap-1">
                    <TbChecklist className="text-gray-300 text-base" />
                    <p className="text-sm font-bold text-gray-800">{room.tasks}</p>
                    <p className="text-[10px] text-gray-400">Tasks</p>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mx-4" />

            {/* Cleaning Plan */}
            <div className="px-4 py-3">
                <p className={`text-xs font-semibold ${colors.text}`}>{room.cleaningPlan}</p>
            </div>
        </div>
    );
}

"use client";

import React, { useEffect, useState } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { TbDoor, TbClock, TbCamera, TbChecklist, TbMapPin, TbLayersLinked } from 'react-icons/tb';
import { Room, RoomType } from './types';
import { getRoom, type RoomDetails } from '@/services/actions/rooms';
import { DetailSkeleton } from '@/components/shared/SkeletonLoader';

interface RoomDetailSidebarProps {
    room: Room;
    onClose: () => void;
}

const typeColors: Record<RoomType, { text: string; bg: string }> = {
    Standard: { text: 'text-[#0ea5e9]', bg: 'bg-[#e0f2fe]' },
    Deluxe: { text: 'text-purple-500', bg: 'bg-purple-50' },
    Suite: { text: 'text-amber-500', bg: 'bg-amber-50' },
    'Junior Suite': { text: 'text-pink-500', bg: 'bg-pink-50' },
};

const typeIconColors: Record<RoomType, string> = {
    Standard: 'text-[#0ea5e9]',
    Deluxe: 'text-purple-500',
    Suite: 'text-amber-500',
    'Junior Suite': 'text-pink-500',
};

export function RoomDetailSidebar({ room, onClose }: RoomDetailSidebarProps) {
    const colors = typeColors[room.type] ?? typeColors.Standard;
    const [details, setDetails] = useState<RoomDetails | null>(null);
    const [error, setError] = useState('');
    useEffect(() => { void getRoom(room.id).then((result) => result.success ? setDetails(result.data) : setError(result.error)); }, [room.id]);

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop fixed inset-0 z-[60] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[65] shadow flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 bg-[#1A2332]">
                    <div className={`w-10 h-10 rounded ${colors.bg} flex items-center justify-center shrink-0`}>
                        <TbDoor className={`${typeIconColors[room.type] ?? typeIconColors.Standard} text-xl`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-white truncate">{room.name}</h2>
                        <p className="text-xs text-white mt-0.5">{room.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-400 transition-colors p-1 cursor-pointer shrink-0"
                    >
                        <MdOutlineClose className="text-xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
                    {error && <p className="rounded bg-red-50 p-2 text-xs text-red-700">{error}</p>}
                    {!details && !error ? <DetailSkeleton blocks={5} /> : <>
                    {/* Room Type + Floor */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded border border-gray-100 bg-gray-50/60 px-4 py-3.5">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Room Type</p>
                            <p className={`text-sm font-semibold ${colors.text}`}>{room.type}</p>
                        </div>
                        <div className="rounded border border-gray-100 bg-gray-50/60 px-4 py-3.5">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Floor</p>
                            <p className="text-sm font-medium text-gray-800">{details ? `Floor ${details.floor}` : room.floor}</p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="rounded border border-gray-100 bg-gray-50/60 px-4 py-3.5 flex items-start gap-3">
                        <TbMapPin className="text-[#0ea5e9] text-lg mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Location</p>
                            <p className="text-sm font-medium text-gray-800">{details?.location_name ?? room.location}</p>
                        </div>
                    </div>

                    {/* Cleaning Plan */}
                    <div className="rounded border border-gray-100 bg-gray-50/60 px-4 py-3.5 flex items-start gap-3">
                        <TbLayersLinked className="text-[#0ea5e9] text-lg mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Cleaning Plan</p>
                            <p className={`text-sm font-semibold ${colors.text}`}>{details?.clean_type ?? room.cleaningPlan}</p>
                        </div>
                    </div>

                    {/* Stats — Duration / Photos / Tasks */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded border border-gray-100 bg-gray-50/60 px-3 py-4 flex flex-col items-center gap-1.5">
                            <TbClock className="text-gray-400 text-lg" />
                            <p className="text-lg font-bold text-gray-900">{details?.duration ?? room.duration}m</p>
                            <p className="text-[11px] text-gray-400">Duration</p>
                        </div>
                        <div className="rounded border border-gray-100 bg-gray-50/60 px-3 py-4 flex flex-col items-center gap-1.5">
                            <TbCamera className="text-gray-400 text-lg" />
                            <p className="text-lg font-bold text-gray-900">{details?.total_photos_required ?? room.photos}</p>
                            <p className="text-[11px] text-gray-400">Photos</p>
                        </div>
                        <div className="rounded border border-gray-100 bg-gray-50/60 px-3 py-4 flex flex-col items-center gap-1.5">
                            <TbChecklist className="text-gray-400 text-lg" />
                            <p className="text-lg font-bold text-gray-900">{details?.task_number ?? room.tasks}</p>
                            <p className="text-[11px] text-gray-400">Tasks</p>
                        </div>
                    </div>
                    </>}
                </div>
            </div>
        </>
    );
}

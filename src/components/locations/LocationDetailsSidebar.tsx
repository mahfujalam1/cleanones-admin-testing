"use client";

import React from 'react';
import { MdOutlineClose, MdOutlineLocationOn, MdOutlinePeople } from 'react-icons/md';
import { TbBuilding } from 'react-icons/tb';
import { Location } from './types';

interface LocationDetailSidebarProps {
    location: Location;
    onClose: () => void;
}

export function LocationDetailSidebar({ location, onClose }: LocationDetailSidebarProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-black/40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[65] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 bg-[#1A2332]">
                    <div className="w-10 h-10 rounded-lg bg-[#e0f2fe] flex items-center justify-center shrink-0">
                        <TbBuilding className="text-[#0ea5e9] text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-white truncate">{location.name}</h2>
                        <p className="text-xs text-white mt-0.5">{location.id}</p>
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
                    {/* Client */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3.5 flex items-start gap-3">
                        <MdOutlinePeople className="text-[#0ea5e9] text-lg mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Client</p>
                            <p className="text-sm font-medium text-gray-800">{location.client}</p>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3.5 flex items-start gap-3">
                        <MdOutlineLocationOn className="text-[#0ea5e9] text-lg mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Address</p>
                            <p className="text-sm font-medium text-gray-800">{location.address}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-4 text-center">
                            <p className="text-2xl font-bold text-gray-900">{location.floors}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Floors</p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-4 text-center">
                            <p className="text-2xl font-bold text-gray-900">{location.rooms}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Rooms</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
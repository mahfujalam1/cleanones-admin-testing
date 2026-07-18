"use client";

import { LocationDetailSidebar } from '@/components/locations/LocationDetailsSidebar';
import { mockLocations } from '@/components/locations/MockData';
import React, { useState, useMemo } from 'react';
import { MdOutlineLocationOn, MdSearch } from 'react-icons/md';
import { TbBuilding } from 'react-icons/tb';
import { Location } from '../../../components/locations/types';
import { CreateLocationModal } from '@/components/locations/CreateLocationModal';

export default function LocationsPage() {
    const [locations, setLocations] = useState<Location[]>(mockLocations);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return locations.filter(
            (l) =>
                l.name.toLowerCase().includes(q) ||
                l.client.toLowerCase().includes(q) ||
                l.address.toLowerCase().includes(q)
        );
    }, [locations, search]);

    const handleAdd = (data: Omit<Location, 'id'>) => {
        const newLocation: Location = {
            ...data,
            id: `L${String(locations.length + 1).padStart(3, '0')}`,
        };
        setLocations((prev) => [...prev, newLocation]);
        setShowModal(false);
    };

    return (
        <div className="min-h-screen">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 px-6">
                {/* Search */}
                <div className="w-full sm:w-auto">
                    <div className="relative w-full max-w-sm">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm w-full sm:w-64 focus:outline-none shadow-sm bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded-lg shadow-sm transition-colors cursor-pointer w-full sm:w-auto justify-center"
                    >
                        + Add Location
                    </button>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="px-6">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <MdOutlineLocationOn className="text-5xl text-gray-300 mb-3" />
                        <p className="text-sm font-semibold text-gray-500">No locations found</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different search or add a new location.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-4">
                        {filtered.map((location) => (
                            <LocationCard
                                key={location.id}
                                location={location}
                                onClick={() => setSelectedLocation(location)}
                                isSelected={selectedLocation?.id === location.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <CreateLocationModal
                    onClose={() => setShowModal(false)}
                    onAdd={handleAdd}
                />
            )}

            {/* Sidebar */}
            {selectedLocation && (
                <LocationDetailSidebar
                    location={selectedLocation}
                    onClose={() => setSelectedLocation(null)}
                />
            )}
        </div>
    );
}

interface LocationCardProps {
    location: Location;
    onClick: () => void;
    isSelected: boolean;
}

function LocationCard({ location, onClick, isSelected }: LocationCardProps) {
    return (
        <div
            onClick={onClick}
            className={`dashboard-card cursor-pointer transition-[border-color,box-shadow] hover:border-[#d7dbe4] hover:shadow-md ${isSelected ? 'border-[#0ea5e9]/50 shadow-md ring-1 ring-[#0ea5e9]/20' : ''
                }`}
        >
            {/* Card Header */}
            <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#e0f2fe] flex items-center justify-center shrink-0 mt-0.5">
                    <TbBuilding className="text-[#0ea5e9] text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{location.name}</p>
                    <p className="text-xs text-[#0ea5e9] mt-0.5 truncate">{location.client}</p>
                </div>
            </div>

            {/* Address */}
            <div className="px-4 pb-3 flex items-center gap-1.5">
                <MdOutlineLocationOn className="text-gray-400 text-sm shrink-0" />
                <p className="text-xs text-gray-400 truncate">{location.address}</p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mx-4" />

            {/* Stats */}
            <div className="grid grid-cols-2 divide-x divide-gray-100">
                <div className="px-4 py-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{location.floors}</p>
                    <p className="text-[11px] text-gray-400">Floors</p>
                </div>
                <div className="px-4 py-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{location.rooms}</p>
                    <p className="text-[11px] text-gray-400">Rooms</p>
                </div>
            </div>
        </div>
    );
}

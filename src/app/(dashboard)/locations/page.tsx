"use client";

import { LocationDetailSidebar } from '@/components/locations/LocationDetailsSidebar';
import React, { useCallback, useEffect, useState } from 'react';
import { MdOutlineLocationOn, MdSearch, MdUploadFile } from 'react-icons/md';
import { BulkImportModal } from '@/components/shared/BulkImportModal';
import { TbBuilding } from 'react-icons/tb';
import { Location } from '../../../components/locations/types';
import { CreateLocationModal } from '@/components/locations/CreateLocationModal';
import { getClientOptions, type ClientOption } from '@/services/actions/locations';
import { getRoomLocations } from '@/services/actions/rooms';
import { useGetLocationsQuery } from '@/redux/api/dashboardApi';
import { CardGridSkeleton } from '@/components/shared/SkeletonLoader';
import { BackendPagination } from '@/components/shared/BackendPagination';
import { Select } from '@/components/ui/select';
import { usePathname } from 'next/navigation';
import { getLocale } from '@/lib/locale';
import { getDashboardTranslation, DashboardTranslationDict } from '@/lib/translations';

const ALL_FILTER_VALUE = '__all__';
type LocationOption = { id: string; name: string; total_rooms: number };

export default function LocationsPage() {
    const pathname = usePathname();
    const locale = getLocale(pathname);
    const t = getDashboardTranslation(locale);

    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [error, setError] = useState('');
    const [filterError, setFilterError] = useState('');
    const [page, setPage] = useState(1);
    const limit = 12;

    const [clientId, setClientId] = useState('');
    const [locationId, setLocationId] = useState('');
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [locationsLoading, setLocationsLoading] = useState(false);

    const { data: locationsRes, isLoading: loading, refetch } = useGetLocationsQuery({
        search: search.trim() || undefined,
        client_id: clientId || undefined,
        location_id: locationId || undefined,
        page,
        limit,
    });

    const rawLocations = locationsRes?.locations ?? [];
    const total = locationsRes?.total_count ?? 0;
    const locations: Location[] = rawLocations.map((item) => ({
        id: item.location_id,
        name: item.location_name,
        client: item.client_company_name,
        address: item.address,
        floors: item.floors,
        rooms: item.rooms,
        requiredHours: item.required_hours_numeric,
        assignedEmployees: [],
        createdDate: item.created_at,
        totalWorkersCount: 0,
        notes: '',
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

        setLocationsLoading(true);
        void getRoomLocations(clientId).then((result) => {
            if (!active) return;
            setLocationsLoading(false);
            if (!result.success) return setFilterError(result.error);
            setFilterError('');
            setLocationOptions(result.data.locations);
        });
        return () => { active = false; };
    }, [clientId]);

    const handleClientChange = (value: string) => {
        const nextClientId = value === ALL_FILTER_VALUE ? '' : value;
        setFilterError('');
        setClientId(nextClientId);
        setLocationId('');
        setLocationOptions([]);
        setLocationsLoading(Boolean(nextClientId));
        setPage(1);
    };

    const handleLocationChange = (value: string) => {
        const nextLocationId = value === ALL_FILTER_VALUE ? '' : value;
        setFilterError('');
        setLocationId(nextLocationId);
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
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="relative">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder={t.locations.searchPlaceholder}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="h-10 w-full rounded border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
                        />
                    </div>
                    <Select
                        value={clientsLoading ? '' : clientId || ALL_FILTER_VALUE}
                        onValueChange={handleClientChange}
                        options={[
                            { value: ALL_FILTER_VALUE, label: t.common.allClients },
                            ...clients.map((client) => ({
                                value: client.id,
                                label: client.company_name || client.primary_contact_name || 'Unnamed client',
                            })),
                        ]}
                        placeholder={clientsLoading ? `${t.common.allClients}...` : t.common.allClients}
                        disabled={clientsLoading}
                    />
                    <Select
                        value={locationsLoading ? '' : locationId || (clientId ? ALL_FILTER_VALUE : '')}
                        onValueChange={handleLocationChange}
                        options={[
                            { value: ALL_FILTER_VALUE, label: t.common.allLocations },
                            ...locationOptions.map((location) => ({ value: location.id, label: location.name })),
                        ]}
                        placeholder={!clientId ? t.common.allLocations : locationsLoading ? `${t.common.allLocations}...` : t.common.allLocations}
                        disabled={!clientId || locationsLoading}
                    />
                </div>

                <div className="flex justify-end shrink-0 gap-2">
                    <button
                        onClick={() => setImportOpen(true)}
                        className="flex h-10 items-center gap-1.5 rounded border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm hover:border-sky-300"
                    >
                        <MdUploadFile className="text-lg text-sky-500" /> {t.common.bulkImport}
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex h-10 items-center justify-center gap-1.5 rounded bg-[#0ea5e9] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7] cursor-pointer whitespace-nowrap"
                    >
                        {t.locations.addLocation}
                    </button>
                </div>
            </div>

            {/* Cards Grid */}
            <div>
                {filterError && <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{filterError}</p>}
                {error && <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}

                {loading ? <CardGridSkeleton /> : locations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <MdOutlineLocationOn className="text-5xl text-gray-300 mb-3" />
                        <p className="text-sm font-semibold text-gray-500">{t.locations.noLocationsFound}</p>
                        <p className="text-xs text-gray-400 mt-1">{t.common.adjustFilters}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-4">
                        {locations.map((location) => (
                            <LocationCard
                                key={location.id}
                                location={location}
                                onClick={() => setSelectedLocation(location)}
                                isSelected={selectedLocation?.id === location.id}
                                t={t}
                            />
                        ))}
                    </div>
                )}
            </div>
            <BackendPagination page={page} limit={limit} total={total} onPageChange={setPage} />

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
            {importOpen && <BulkImportModal mode="locations" onImported={() => { setImportOpen(false); void refetch(); }} onClose={() => setImportOpen(false)} />}
        </div>
    );
}

interface LocationCardProps {
    location: Location;
    onClick: () => void;
    isSelected: boolean;
    t: DashboardTranslationDict;
}

function LocationCard({ location, onClick, isSelected, t }: LocationCardProps) {
    return (
        <div
            onClick={onClick}
            className={`dashboard-card flex flex-col justify-between h-full cursor-pointer transition-[border-color,box-shadow] hover:border-[#d7dbe4] hover:shadow ${isSelected ? 'border-[#0ea5e9]/50 shadow ring-1 ring-[#0ea5e9]/20' : ''
                }`}
        >
            <div className="flex-1 flex flex-col min-w-0">
                {/* Card Header */}
                <div className="px-3.5 pt-3 pb-2 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#e0f2fe] flex items-center justify-center shrink-0 mt-0.5">
                        <TbBuilding className="text-[#0ea5e9] text-base" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">{location.name}</p>
                        <p className="text-xs text-[#0ea5e9] mt-0.5 truncate">{location.client}</p>
                    </div>
                </div>

                {/* Address */}
                <div className="px-3.5 pb-2.5 flex items-center gap-1.5">
                    <MdOutlineLocationOn className="text-gray-400 text-xs shrink-0" />
                    <p className="text-xs text-gray-400 truncate">{location.address}</p>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mx-3.5" />

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 mt-auto">
                <div className="px-2 py-2 text-center">
                    <p className="text-sm font-bold text-gray-900">{location.floors}</p>
                    <p className="text-[10px] text-gray-400">{t.common.floors}</p>
                </div>
                <div className="px-2 py-2 text-center">
                    <p className="text-sm font-bold text-gray-900">{location.rooms}</p>
                    <p className="text-[10px] text-gray-400">{t.common.rooms}</p>
                </div>
                <div className="px-2 py-2 text-center">
                    <p className="text-sm font-bold text-gray-900">{location.requiredHours}h</p>
                    <p className="text-[10px] text-gray-400">{t.common.required}</p>
                </div>
            </div>
        </div>
    );
}


"use client";

import { CreatePlanModal } from '@/components/cleaningPlans/CreatePlanModal';
import { PlanDetailSidebar } from '@/components/cleaningPlans/PlanDetailsSidebar';
import { PlanCard } from '@/components/cleaningPlans/PlanCard';
import { CleaningPlan } from '@/components/cleaningPlans/types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getLocale } from '@/lib/locale';
import { getDashboardTranslation } from '@/lib/translations';
import { MdSearch } from 'react-icons/md';
import { TbClipboardList } from 'react-icons/tb';
import { deleteCleaningPlan, getCleaningPlan, getPlanRooms, type PlanRoomOption } from '@/services/actions/cleaningPlans';
import { useGetCleaningPlansQuery } from '@/redux/api/dashboardApi';
import { CardGridSkeleton } from '@/components/shared/SkeletonLoader';
import { BackendPagination } from '@/components/shared/BackendPagination';
import { Select } from '@/components/ui/select';
import { getClientOptions, type ClientOption } from '@/services/actions/locations';
import { getRoomLocations } from '@/services/actions/rooms';
import { getWorkers, type WorkerApi } from '@/services/actions/workers';
import { WorkerAssignmentModal } from '@/components/cleaningPlans/WorkerAssignmentModal';

// Cache for room names and location names from plan details to keep extra calls minimal
const roomNameCache: Record<string, string[]> = {};
const locationCache: Record<string, string> = {};

export default function CleaningPlansPage() {
    const pathname = usePathname();
    const locale = getLocale(pathname);
    const t = getDashboardTranslation(locale);

    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<CleaningPlan | null>(null);
    const [assigningPlan, setAssigningPlan] = useState<CleaningPlan | null>(null);
    const [error, setError] = useState('');
    const [filterError, setFilterError] = useState('');
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
    const [roomOptions, setRoomOptions] = useState<PlanRoomOption[]>([]);
    const [workers, setWorkers] = useState<WorkerApi[]>([]);
    const [clientId, setClientId] = useState('all');
    const [locationId, setLocationId] = useState('all');
    const [roomId, setRoomId] = useState('all');
    const [workerId, setWorkerId] = useState('all');
    const [page, setPage] = useState(1);
    const limit = 12;
    const firstClient = useRef(true), firstLocation = useRef(true);
    const [roomNames, setRoomNames] = useState<Record<string, string[]>>(roomNameCache);
    const [planLocations, setPlanLocations] = useState<Record<string, string>>(locationCache);

    const { data: plansRes, isLoading: loading, refetch } = useGetCleaningPlansQuery({ search: search.trim() || undefined, page, limit });

    const total = plansRes?.total_count ?? 0;
    const plans: CleaningPlan[] = useMemo(() => (plansRes?.plans ?? []).map((item) => {
        const loc = item.location_name || (item.location_names && item.location_names.length ? item.location_names.join(', ') : '') || planLocations[item.id] || '';
        const schedule = item.date ? `${item.date}${item.start_time ? ` · ${item.start_time}` : ''}` : '';
        return {
            id: item.id,
            name: item.title,
            client: (item.client_names ?? []).join(', '),
            location: loc,
            dateSchedule: schedule,
            rooms: item.room_names ?? [],
            duration: item.duration_minutes,
            photos: item.total_photos_count,
            tasks: item.total_tasks_count,
            aiValid: item.is_active,
            checklistTasks: [],
            photoRequirements: [],
        };
    }), [plansRes, planLocations]);

    useEffect(() => {
        const missing = plans
            .filter((p) => !(p.id in roomNameCache) || (!p.location && !(p.id in locationCache)))
            .map((p) => p.id);
        if (!missing.length) return;
        let active = true;
        void Promise.all(missing.map((id) => getCleaningPlan(id).then((result) => {
            const rNames = result.success ? (result.data.rooms ?? []).map((room) => room.room_name) : [];
            const locName = result.success ? (result.data.location_name || result.data.locations?.[0]?.name || '') : '';
            return [id, rNames, locName] as const;
        }))).then((entries) => {
            entries.forEach(([id, names, locName]) => {
                roomNameCache[id] = names;
                if (locName) locationCache[id] = locName;
            });
            if (active) {
                setRoomNames({ ...roomNameCache });
                setPlanLocations({ ...locationCache });
            }
        });
        return () => { active = false; };
    }, [plans]);

    useEffect(() => {
        void getClientOptions(1, 100).then((result) => result.success ? setClients(result.data.clients ?? []) : setFilterError(result.error));
        void getWorkers({ limit: 50 }).then((result) => result.success ? setWorkers(result.data.workers ?? []) : setFilterError(result.error));
    }, []);
    useEffect(() => {
        if (firstClient.current) { firstClient.current = false; return; }
        setLocationId('all'); setRoomId('all'); setLocations([]); setRoomOptions([]);
        if (clientId !== 'all') void getRoomLocations(clientId).then((result) => result.success ? setLocations(result.data.locations ?? []) : setFilterError(result.error));
    }, [clientId]);
    useEffect(() => {
        if (firstLocation.current) { firstLocation.current = false; return; }
        setRoomId('all'); setRoomOptions([]);
        if (locationId !== 'all') void getPlanRooms({ clientId: clientId === 'all' ? undefined : clientId, locationId, limit: 100 }).then((result) => result.success ? setRoomOptions(result.data.rooms ?? []) : setFilterError(result.error));
    }, [clientId, locationId]);

    const handleAdd = () => {
        setShowModal(false);
        setEditingPlanId(null);
        void refetch();
    };

    const handleDelete = async (id: string) => {
        const result = await deleteCleaningPlan(id); if (!result.success) { setError(result.error); return; }
        void refetch();
        if (selectedPlan?.id === id) setSelectedPlan(null);
    };

    return (
        <div className="min-h-screen">
            {/* Filters & Action Bar */}
            <div className="mb-5 flex flex-col gap-3 rounded border border-gray-200 bg-white p-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <div className="relative">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder={t.plans.searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm font-medium text-gray-700 focus:outline-none"
                        />
                    </div>
                    <Select value={clientId} onValueChange={setClientId} options={[{ value: 'all', label: t.common.allClients }, ...clients.map((c) => ({ value: c.id, label: c.company_name }))]} />
                    <Select value={locationId} onValueChange={setLocationId} options={[{ value: 'all', label: t.common.allLocations }, ...locations.map((l) => ({ value: l.id, label: l.name }))]} />
                    <Select value={roomId} onValueChange={setRoomId} options={[{ value: 'all', label: t.common.allRooms }, ...roomOptions.map((r) => ({ value: r.room_id, label: r.room_name }))]} />
                    <Select value={workerId} onValueChange={setWorkerId} options={[{ value: 'all', label: t.common.allWorkers }, ...workers.map((w) => ({ value: w.worker_id, label: w.full_name }))]} />
                </div>
                <div className="flex justify-end shrink-0">
                    <button onClick={() => setShowModal(true)} className="flex h-10 items-center justify-center gap-1.5 rounded bg-[#0ea5e9] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7] cursor-pointer whitespace-nowrap">
                        {t.plans.addPlan}
                    </button>
                </div>
            </div>

            {error && <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}

            {loading ? <CardGridSkeleton /> : plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <TbClipboardList className="mb-3 text-5xl text-gray-300" />
                    <p className="text-sm font-semibold text-gray-500">{t.plans.noPlansFound}</p>
                    <p className="mt-1 text-xs text-gray-400">{t.common.adjustFilters}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={{
                                ...plan,
                                rooms: roomNames[plan.id]?.length ? roomNames[plan.id] : plan.rooms,
                                location: plan.location || planLocations[plan.id] || '',
                            }}
                            t={t}
                            onClick={() => setSelectedPlan(plan)}
                            isSelected={selectedPlan?.id === plan.id}
                            onDelete={() => void handleDelete(plan.id)}
                            onEdit={() => setEditingPlanId(plan.id)}
                            onAssign={() => setAssigningPlan(plan)}
                        />
                    ))}
                </div>
            )}
            <BackendPagination page={page} limit={limit} total={total} onPageChange={setPage} />

            {showModal && (
                <CreatePlanModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
            )}
            {editingPlanId && (
                <CreatePlanModal key={editingPlanId} planId={editingPlanId} onClose={() => setEditingPlanId(null)} onAdd={handleAdd} />
            )}
            {assigningPlan && <WorkerAssignmentModal planId={assigningPlan.id} planTitle={assigningPlan.name} onClose={() => setAssigningPlan(null)} onAssigned={() => { void refetch(); }} />}

            {selectedPlan && (
                <PlanDetailSidebar
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    onDelete={(id) => { void handleDelete(id); }}
                    onEdit={() => {
                        setEditingPlanId(selectedPlan.id);
                        setSelectedPlan(null);
                    }}
                    onAssign={() => {
                        setAssigningPlan(selectedPlan);
                        setSelectedPlan(null);
                    }}
                />
            )}
        </div>
    );
}

"use client";

import { CreatePlanModal } from '@/components/cleaningPlans/CreatePlanModal';
import { PlanDetailSidebar } from '@/components/cleaningPlans/PlanDetailsSidebar';
import { CleaningPlan } from '@/components/cleaningPlans/types';
import React, { useEffect, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { TbClipboardList, TbClock, TbCamera, TbChecklist, TbUser, TbMapPin, TbDoor, TbPinned, TbTrash } from 'react-icons/tb';
import { deleteCleaningPlan, getPlanRooms, type PlanRoomOption } from '@/services/actions/cleaningPlans';
import { useGetCleaningPlansQuery } from '@/redux/api/dashboardApi';
import { CardGridSkeleton } from '@/components/shared/SkeletonLoader';
import { BackendPagination } from '@/components/shared/BackendPagination';
import { Select } from '@/components/ui/select';
import { getClientOptions, type ClientOption } from '@/services/actions/locations';
import { getRoomLocations } from '@/services/actions/rooms';
import { getWorkers, type WorkerApi } from '@/services/actions/workers';
import { WorkerAssignmentModal } from '@/components/cleaningPlans/WorkerAssignmentModal';

export default function CleaningPlansPage() {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<CleaningPlan | null>(null);
    const [assigningPlan, setAssigningPlan] = useState<CleaningPlan | null>(null);
    const [error, setError] = useState('');
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

    const { data: plansRes, isLoading: loading, refetch } = useGetCleaningPlansQuery({ search: search.trim() || undefined, page, limit });

    const rawPlans = plansRes?.plans ?? [];
    const total = plansRes?.total_count ?? 0;
    const plans: CleaningPlan[] = rawPlans.map((item) => ({ id: item.id, name: item.title, client: (item.client_names ?? []).join(', '), location: item.date ? `${item.date} · ${item.start_time}` : '', rooms: item.room_names ?? [], duration: item.duration_minutes, photos: item.total_photos_count, tasks: item.total_tasks_count, aiValid: item.is_active, checklistTasks: [], photoRequirements: [] }));

    useEffect(() => { void getClientOptions(1, 100).then((result) => result.success ? setClients(result.data.clients ?? []) : setError(result.error)); void getWorkers({ limit: 100 }).then((result) => result.success ? setWorkers(result.data.workers ?? []) : setError(result.error)); }, []);
    useEffect(() => { setLocationId('all'); setRoomId('all'); setLocations([]); setRoomOptions([]); if (clientId !== 'all') void getRoomLocations(clientId).then((result) => result.success ? setLocations(result.data.locations ?? []) : setError(result.error)); }, [clientId]);
    useEffect(() => { setRoomId('all'); setRoomOptions([]); if (locationId !== 'all') void getPlanRooms({ clientId: clientId === 'all' ? undefined : clientId, locationId, limit: 100 }).then((result) => result.success ? setRoomOptions(result.data.rooms ?? []) : setError(result.error)); }, [clientId, locationId]);

    const handleAdd = () => {
        setShowModal(false);
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
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="relative">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search cleaning plans..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm font-medium text-gray-700 focus:outline-none"
                        />
                    </div>
                    <Select value={clientId} onValueChange={setClientId} options={[{ value: 'all', label: 'All Clients' }, ...clients.map((c) => ({ value: c.id, label: c.company_name }))]} />
                    <Select value={locationId} onValueChange={setLocationId} options={[{ value: 'all', label: 'All Locations' }, ...locations.map((l) => ({ value: l.id, label: l.name }))]} />
                    <Select value={roomId} onValueChange={setRoomId} options={[{ value: 'all', label: 'All Rooms' }, ...roomOptions.map((r) => ({ value: r.room_id, label: r.room_name }))]} />
                    <Select value={workerId} onValueChange={setWorkerId} options={[{ value: 'all', label: 'All Workers' }, ...workers.map((w) => ({ value: w.worker_id, label: w.full_name }))]} />
                </div>
                <div className="flex justify-end">
                    <button onClick={() => setShowModal(true)} className="flex h-10 items-center gap-1.5 rounded bg-[#0ea5e9] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#0284c7]">
                        + Add Cleaning Plan
                    </button>
                </div>
            </div>

            {error && <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}

            {loading ? <CardGridSkeleton /> : plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <TbClipboardList className="mb-3 text-5xl text-gray-300" />
                    <p className="text-sm font-semibold text-gray-500">No cleaning plans found</p>
                    <p className="mt-1 text-xs text-gray-400">Try adjusting search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {plans.map((plan) => (
                        <article key={plan.id} onClick={() => setSelectedPlan(plan)} className="cursor-pointer rounded border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-sky-300 hover:shadow-md">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{plan.name}</h3>
                                    <p className="mt-0.5 text-xs text-gray-500">{plan.client || 'No client'}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); void handleDelete(plan.id); }} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                                    <TbTrash className="text-lg" />
                                </button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><TbMapPin className="text-sky-500" /> {plan.location || '—'}</span>
                                <span className="flex items-center gap-1"><TbDoor className="text-sky-500" /> {plan.rooms.length} rooms</span>
                                <span className="flex items-center gap-1"><TbClock className="text-sky-500" /> {plan.duration} min</span>
                                <span className="flex items-center gap-1"><TbChecklist className="text-sky-500" /> {plan.tasks} tasks</span>
                                <span className="flex items-center gap-1"><TbCamera className="text-sky-500" /> {plan.photos} photos</span>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                                <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${plan.aiValid ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {plan.aiValid ? 'Active' : 'Inactive'}
                                </span>
                                <button onClick={(e) => { e.stopPropagation(); setAssigningPlan(plan); }} className="text-xs font-semibold text-sky-600 hover:underline">
                                    Assign Workers
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
            <BackendPagination page={page} limit={limit} total={total} onPageChange={setPage} />

            {showModal && (
                <CreatePlanModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
            )}
            {assigningPlan && <WorkerAssignmentModal planId={assigningPlan.id} planTitle={assigningPlan.name} assignedWorkerIds={[]} onClose={() => setAssigningPlan(null)} onAssigned={() => { void refetch(); }} />}

            {selectedPlan && (
                <PlanDetailSidebar
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    onDelete={(id) => { void handleDelete(id); }}
                />
            )}
        </div>
    );
}

interface PlanCardProps {
    plan: CleaningPlan;
    onClick: () => void;
    isSelected: boolean;
    onDelete: () => void;
    onAssign: () => void;
}

function PlanCard({ plan, onClick, isSelected, onDelete, onAssign }: PlanCardProps) {
    return (
        <div
            onClick={onClick}
            className={`dashboard-card flex flex-col justify-between h-full cursor-pointer transition-[border-color,box-shadow] hover:border-[#d7dbe4] hover:shadow ${isSelected ? 'border-[#0ea5e9]/50 shadow ring-1 ring-[#0ea5e9]/20' : ''
                }`}
        >
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="px-3.5 pt-3 pb-2 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#e0f2fe] flex items-center justify-center shrink-0 mt-0.5">
                        <TbClipboardList className="text-[#0ea5e9] text-base" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-1">{plan.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{plan.id}</p>
                    </div>
                    {/* Action icons */}
                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 text-gray-300 hover:text-[#0ea5e9] transition-colors cursor-pointer">
                            <TbPinned className="text-sm" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-1 text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                        >
                            <TbTrash className="text-sm" />
                        </button>
                    </div>
                </div>

                {/* Client + Location */}
                <div className="px-3.5 pb-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                        <TbUser className="text-gray-300 text-xs shrink-0" />
                        <p className="text-xs text-gray-500 truncate">{plan.client}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <TbMapPin className="text-gray-300 text-xs shrink-0" />
                        <p className="text-xs text-gray-500 truncate">{plan.location}</p>
                    </div>
                    {(plan.rooms ?? []).length > 0 && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <TbDoor className="text-gray-300 text-xs shrink-0" />
                            <div className="flex flex-wrap gap-1">
                                {(plan.rooms ?? []).slice(0, 3).map((r, index) => (
                                    <span key={`${plan.id}-${index}-${r}`} className="text-[10px] font-medium text-[#0ea5e9] bg-[#e0f2fe] px-1.5 py-0.5 rounded">
                                        {r}
                                    </span>
                                ))}
                                {(plan.rooms ?? []).length > 3 && (
                                    <span className="text-[10px] text-gray-400">+{(plan.rooms ?? []).length - 3}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Dynamic tasks */}
                {plan.periodicTasks && (
                    <div className="mx-3.5 mb-2 rounded border border-sky-100 bg-sky-50 p-2 text-xs">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-sky-700">Dynamic tasks</p>
                        <p className="mt-0.5 text-xs text-slate-600">{plan.periodicTasks.filter(task => task.due).length} periodic task(s) due this week</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">Photos: {plan.photoRotation}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100 mt-auto">
                    <div className="py-2 flex flex-col items-center gap-0.5">
                        <TbClock className="text-gray-300 text-sm" />
                        <p className="text-xs font-bold text-gray-800">{plan.duration}m</p>
                        <p className="text-[10px] text-gray-400">Duration</p>
                    </div>
                    <div className="py-2 flex flex-col items-center gap-0.5">
                        <TbCamera className="text-gray-300 text-sm" />
                        <p className="text-xs font-bold text-gray-800">{plan.photos}</p>
                        <p className="text-[10px] text-gray-400">Photos</p>
                    </div>
                    <div className="py-2 flex flex-col items-center gap-0.5">
                        <TbChecklist className="text-gray-300 text-sm" />
                        <p className="text-xs font-bold text-gray-800">{plan.tasks}</p>
                        <p className="text-[10px] text-gray-400">Tasks</p>
                    </div>
                </div>
            </div>

            {/* Assign Button at Bottom */}
            <div className="border-t border-gray-100 p-2.5 mt-auto" onClick={(event) => event.stopPropagation()}>
                <button onClick={onAssign} className="flex h-8 w-full items-center justify-center gap-1.5 rounded border border-sky-200 bg-sky-50 text-xs font-semibold text-sky-600 transition hover:border-sky-400 hover:bg-sky-100">
                    <TbUser className="text-sm"/> Assign workers
                </button>
            </div>
        </div>
    );
}

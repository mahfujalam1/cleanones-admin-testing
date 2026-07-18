"use client";

import { CreatePlanModal } from '@/components/cleaningPlans/CreatePlanModal';
import { mockCleaningPlans } from '@/components/cleaningPlans/MockData';
import { PlanDetailSidebar } from '@/components/cleaningPlans/PlanDetailsSidebar';
import { CleaningPlan } from '@/components/cleaningPlans/types';
import React, { useState, useMemo } from 'react';
import { MdSearch } from 'react-icons/md';
import { TbClipboardList, TbClock, TbCamera, TbChecklist, TbUser, TbMapPin, TbDoor, TbPinned, TbTrash } from 'react-icons/tb';


export default function CleaningPlansPage() {
    const [plans, setPlans] = useState<CleaningPlan[]>(mockCleaningPlans);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<CleaningPlan | null>(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return plans.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.client.toLowerCase().includes(q) ||
                p.location.toLowerCase().includes(q)
        );
    }, [plans, search]);

    const handleAdd = (data: Omit<CleaningPlan, 'id'>) => {
        const newPlan: CleaningPlan = {
            ...data,
            id: `P${String(plans.length + 1).padStart(3, '0')}`,
        };
        setPlans((prev) => [...prev, newPlan]);
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        setPlans((prev) => prev.filter((p) => p.id !== id));
        if (selectedPlan?.id === id) setSelectedPlan(null);
    };

    return (
        <div className="min-h-screen">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-5">
                <div className="px-6">
                    <div className="relative">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search plans..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded text-sm w-64 focus:outline-none shadow-sm bg-gray-50 focus:bg-white transition-colors"
                        />
                    </div>
                </div>
                <div className="px-6">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded shadow-sm transition-colors cursor-pointer"
                    >
                        + Create Plan
                    </button>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="px-6">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <TbClipboardList className="text-5xl text-gray-300 mb-3" />
                        <p className="text-sm font-semibold text-gray-500">No cleaning plans found</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different search or create a new plan.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                onClick={() => setSelectedPlan(plan)}
                                isSelected={selectedPlan?.id === plan.id}
                                onDelete={() => handleDelete(plan.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <CreatePlanModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
            )}

            {selectedPlan && (
                <PlanDetailSidebar
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                    onDelete={handleDelete}
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
}

function PlanCard({ plan, onClick, isSelected, onDelete }: PlanCardProps) {
    return (
        <div
            onClick={onClick}
            className={`dashboard-card cursor-pointer transition-[border-color,box-shadow] hover:border-[#d7dbe4] hover:shadow-md ${isSelected ? 'border-[#0ea5e9]/50 shadow-md ring-1 ring-[#0ea5e9]/20' : ''
                }`}
        >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#e0f2fe] flex items-center justify-center shrink-0 mt-0.5">
                    <TbClipboardList className="text-[#0ea5e9] text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">{plan.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{plan.id}</p>
                </div>
                {/* Action icons */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1 text-gray-300 hover:text-[#0ea5e9] transition-colors cursor-pointer">
                        <TbPinned className="text-base" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                    >
                        <TbTrash className="text-base" />
                    </button>
                </div>
            </div>

            {/* Client + Location */}
            <div className="px-4 pb-3 space-y-1">
                <div className="flex items-center gap-1.5">
                    <TbUser className="text-gray-300 text-sm shrink-0" />
                    <p className="text-xs text-gray-500 truncate">{plan.client}</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <TbMapPin className="text-gray-300 text-sm shrink-0" />
                    <p className="text-xs text-gray-500 truncate">{plan.location}</p>
                </div>
                {plan.rooms.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                        <TbDoor className="text-gray-300 text-sm shrink-0" />
                        <div className="flex flex-wrap gap-1">
                            {plan.rooms.slice(0, 3).map((r) => (
                                <span key={r} className="text-[10px] font-medium text-[#0ea5e9] bg-[#e0f2fe] px-1.5 py-0.5 rounded">
                                    {r}
                                </span>
                            ))}
                            {plan.rooms.length > 3 && (
                                <span className="text-[10px] text-gray-400">+{plan.rooms.length - 3}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mx-4" />

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-100">
                <div className="py-3 flex flex-col items-center gap-1">
                    <TbClock className="text-gray-300 text-base" />
                    <p className="text-sm font-bold text-gray-800">{plan.duration}m</p>
                    <p className="text-[10px] text-gray-400">Duration</p>
                </div>
                <div className="py-3 flex flex-col items-center gap-1">
                    <TbCamera className="text-gray-300 text-base" />
                    <p className="text-sm font-bold text-gray-800">{plan.photos}</p>
                    <p className="text-[10px] text-gray-400">Photos</p>
                </div>
                <div className="py-3 flex flex-col items-center gap-1">
                    <TbChecklist className="text-gray-300 text-base" />
                    <p className="text-sm font-bold text-gray-800">{plan.tasks}</p>
                    <p className="text-[10px] text-gray-400">Tasks</p>
                </div>
            </div>
        </div>
    );
}

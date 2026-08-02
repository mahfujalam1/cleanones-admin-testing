"use client";

import React, { useState } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { TbClipboardList, TbClock, TbCamera, TbSparkles, TbMapPin, TbUser, TbDoor } from 'react-icons/tb';
import { CleaningPlan } from './types';

interface PlanDetailSidebarProps {
    plan: CleaningPlan;
    onClose: () => void;
    onDelete?: (id: string) => void;
}

export function PlanDetailSidebar({ plan, onClose }: PlanDetailSidebarProps) {
    const [checked, setChecked] = useState<Set<number>>(new Set());

    const toggleTask = (i: number) => {
        setChecked((prev) => {
            const next = new Set(prev);
            if (next.has(i)) next.delete(i);
            else next.add(i);
            return next;
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop fixed inset-0 z-[60] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[65] shadow flex flex-col animate-in slide-in-from-right duration-300">
                {/* Dark Header */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 bg-[#1A2332] shrink-0">
                    <div className="w-10 h-10 rounded bg-[#e0f2fe] flex items-center justify-center shrink-0">
                        <TbClipboardList className="text-[#0ea5e9] text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-white truncate">{plan.name}</h2>
                        <p className="text-xs text-white/60 mt-0.5">{plan.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white/70 transition-colors p-1 cursor-pointer shrink-0"
                    >
                        <MdOutlineClose className="text-xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
                    {/* Client */}
                    <div className="rounded border border-gray-100 bg-gray-50/60 px-4 py-3.5 flex items-start gap-3">
                        <TbUser className="text-[#0ea5e9] text-lg mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Client</p>
                            <p className="text-sm font-medium text-gray-800">{plan.client}</p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="rounded border border-gray-100 bg-gray-50/60 px-4 py-3.5 flex items-start gap-3">
                        <TbMapPin className="text-[#0ea5e9] text-lg mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Location</p>
                            <p className="text-sm font-medium text-gray-800">{plan.location}</p>
                        </div>
                    </div>

                    {/* Rooms */}
                    {plan.rooms.length > 0 && (
                        <div className="rounded border border-gray-100 bg-gray-50/60 px-4 py-3.5">
                            <div className="flex items-center gap-2 mb-2">
                                <TbDoor className="text-[#0ea5e9] text-lg shrink-0" />
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Rooms</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {plan.rooms.map((r) => (
                                    <span key={r} className="text-xs font-medium text-[#0ea5e9] bg-[#e0f2fe] px-2.5 py-1 rounded">
                                        {r}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats: Duration / Photos / AI Valid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded border border-gray-100 bg-gray-50/60 px-3 py-4 flex flex-col items-center gap-1.5">
                            <TbClock className="text-[#0ea5e9] text-lg" />
                            <p className="text-lg font-bold text-gray-900">{plan.duration}m</p>
                            <p className="text-[11px] text-gray-400">Duration</p>
                        </div>
                        <div className="rounded border border-gray-100 bg-gray-50/60 px-3 py-4 flex flex-col items-center gap-1.5">
                            <TbCamera className="text-pink-400 text-lg" />
                            <p className="text-lg font-bold text-gray-900">{plan.photos}</p>
                            <p className="text-[11px] text-gray-400">Photos</p>
                        </div>
                        <div className="rounded border border-gray-100 bg-gray-50/60 px-3 py-4 flex flex-col items-center gap-1.5">
                            <TbSparkles className="text-[#0ea5e9] text-lg" />
                            <p className="text-lg font-bold text-gray-900">{plan.aiValid ? 'On' : 'Off'}</p>
                            <p className="text-[11px] text-gray-400">AI Valid.</p>
                        </div>
                    </div>

                    {/* Checklist Tasks */}
                    {plan.checklistTasks.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-[#0ea5e9] mb-2">Checklist Tasks</p>
                            <div className="space-y-1.5">
                                {plan.checklistTasks.map((task, i) => {
                                    const isChecked = checked.has(i);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => toggleTask(i)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded border border-gray-100 bg-white cursor-pointer hover:bg-gray-50 transition-colors select-none"
                                        >
                                            {/* Custom radio/checkbox */}
                                            <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${isChecked ? 'border-[#0ea5e9] bg-[#0ea5e9]' : 'border-gray-300 bg-white'
                                                }`}>
                                                {isChecked && (
                                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-sm transition-colors ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'
                                                }`}>
                                                {task}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Photo Requirements */}
                    {plan.photoRequirements.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-[#0ea5e9] mb-2">Photo Requirements</p>
                            <div className="grid grid-cols-2 gap-2">
                                {plan.photoRequirements.map((req, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 px-3 py-2.5 rounded border border-gray-100 bg-white"
                                    >
                                        <TbCamera className="text-pink-400 text-sm shrink-0" />
                                        <span className="text-xs text-gray-700 truncate">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

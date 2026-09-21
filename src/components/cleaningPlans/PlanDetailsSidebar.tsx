"use client";

import React, { useEffect, useState } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import {
    TbClipboardList,
    TbClock,
    TbCamera,
    TbMapPin,
    TbUser,
    TbDoor,
    TbUsers,
    TbCalendar,
    TbNotes,
    TbPencil,
    TbTrash,
    TbRefresh,
    TbChecklist,
} from 'react-icons/tb';
import { CleaningPlan } from './types';
import { getCleaningPlan, type PlanDetails } from '@/services/actions/cleaningPlans';
import { DetailSkeleton } from '@/components/shared/SkeletonLoader';
import { usePathname } from 'next/navigation';
import { getLocale } from '@/lib/locale';
import { getDashboardTranslation } from '@/lib/translations';

interface PlanDetailSidebarProps {
    plan: CleaningPlan;
    onClose: () => void;
    onDelete?: (id: string) => void;
    onEdit?: () => void;
    onAssign?: () => void;
}

const titleCase = (value?: string) =>
    value
        ? value
            .replaceAll('_', ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : '';

export function PlanDetailSidebar({ plan, onClose, onDelete, onEdit, onAssign }: PlanDetailSidebarProps) {
    const t = getDashboardTranslation(getLocale(usePathname()));
    const [details, setDetails] = useState<PlanDetails | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        void getCleaningPlan(plan.id).then((result) => {
            setLoading(false);
            if (result.success) {
                setDetails(result.data);
            } else {
                setError(result.error);
            }
        });
    }, [plan.id]);

    const detailRooms = details?.rooms ?? [];
    const planRooms = plan.rooms ?? [];
    const additionalTasks = details?.additional_tasks ?? [];
    const workers = details?.workers ?? [];

    const formatFrequency = (freq?: string, days?: string[]) => {
        const type = (freq || 'daily').toLowerCase();
        if (type === 'weekly' && days && days.length > 0) {
            return `${t.roster.weekView}: ${days.join(', ')}`;
        }
        if (type === 'monthly') return t.reports.month;
        return t.reports.week;
    };

    return (
        <div
            onClick={onClose}
            className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
            
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
            >
                
                <header className="flex items-center gap-3 border-b border-slate-200 p-5 bg-white shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-500 shrink-0">
                        <TbClipboardList className="text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base font-semibold text-slate-900 truncate">
                                {details?.title || plan.name}
                            </h2>
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${plan.aiValid || details?.is_active
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                    }`}
                            >
                                {plan.aiValid || details?.is_active ? t.common.active : t.common.inactive}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>ID: <span className="font-mono text-slate-600">{plan.id}</span></span>
                            {details?.date && <span>• {details.date}</span>}
                            {details?.start_time && <span>({details.start_time} - {details.end_time || 'End'})</span>}
                        </p>
                    </div>

                    
                    <div className="flex items-center gap-2">
                        {onAssign && (
                            <button
                                onClick={onAssign}
                                className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-600 transition-colors shadow-sm cursor-pointer"
                            >
                                <TbUsers className="text-base" /> {t.common.assignWorkers}
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <TbPencil className="text-base" /> {t.common.edit}
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(plan.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                title={t.common.delete}
                            >
                                <TbTrash className="text-base" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            <MdOutlineClose className="text-xl" />
                        </button>
                    </div>
                </header>

                
                <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs bg-white">
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <DetailSkeleton blocks={8} />
                    ) : (
                        <>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-500 shrink-0">
                                        <TbClock className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{details?.duration_minutes || plan.duration}m</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t.common.duration}</p>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-500 shrink-0">
                                        <TbDoor className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{detailRooms.length || planRooms.length}</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t.common.rooms}</p>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-500 shrink-0">
                                        <TbChecklist className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{details?.total_tasks_count || plan.tasks}</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t.common.tasks}</p>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-500 shrink-0">
                                        <TbCamera className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{details?.total_photos_count || plan.photos}</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{t.common.photos}</p>
                                    </div>
                                </div>
                            </div>

                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                
                                <div className="lg:col-span-2 space-y-5">
                                    
                                    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                                        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                            {t.clients.title}
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500 shrink-0 mt-0.5">
                                                    <TbUser className="text-base" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-medium text-slate-400 uppercase">{t.extraServices.client}</p>
                                                    <p className="text-xs font-semibold text-slate-900">
                                                        {details?.company_name || details?.client_names?.join(', ') || plan.client || 'N/A'}
                                                    </p>
                                                    {details?.clients?.[0]?.primary_contact_name && (
                                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                                            {t.managerAccess.name}: {details.clients[0].primary_contact_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500 shrink-0 mt-0.5">
                                                    <TbMapPin className="text-base" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-medium text-slate-400 uppercase">{t.extraServices.location}</p>
                                                    <p className="text-xs font-semibold text-slate-900">
                                                        {details?.location_name || details?.location_names?.join(', ') || details?.locations?.[0]?.location_name || details?.locations?.[0]?.name || plan.location || 'Default Location'}
                                                    </p>
                                                    {details?.repeat_shift && (
                                                        <p className="text-[11px] text-sky-600 font-medium capitalize mt-0.5">
                                                            {t.roster.title}: {details.repeat_shift.replace('_', ' ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        
                                        {details?.shift_notes && (
                                            <div className="rounded-md border border-sky-100 bg-sky-50/60 p-3 flex items-start gap-2 text-xs">
                                                <TbNotes className="text-sky-600 text-base shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-slate-900">{t.roster.title}:</p>
                                                    <p className="text-slate-700 mt-0.5">{details.shift_notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                                <TbDoor className="text-sky-500 text-base" /> {t.common.rooms} & {t.common.tasks} ({detailRooms.length || planRooms.length})
                                            </h3>
                                        </div>

                                        {detailRooms.length > 0 ? (
                                            <div className="space-y-3">
                                                {detailRooms.map((room) => (
                                                    <div
                                                        key={room.room_id}
                                                        className="rounded-lg border border-slate-200 bg-white p-4 space-y-3"
                                                    >
                                                        
                                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500 font-semibold text-xs shrink-0">
                                                                    <TbDoor className="text-base" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-slate-900 text-xs">
                                                                        {room.room_name}
                                                                    </h4>
                                                                    <p className="text-[11px] text-sky-600 font-medium capitalize mt-0.5">
                                                                        {titleCase(room.room_type) || t.rooms.title} {room.floor ? `· ${t.common.floors} ${room.floor}` : ''}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 text-[11px]">
                                                                <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                                                                    ⏱ {room.duration || 0}m
                                                                </span>
                                                                <span className="rounded bg-sky-50 px-2 py-0.5 font-medium text-sky-600 border border-sky-100">
                                                                    📋 {room.task_number || (room.tasks || []).length} {t.common.tasks}
                                                                </span>
                                                                <span className="rounded bg-sky-50 px-2 py-0.5 font-medium text-sky-600 border border-sky-100">
                                                                    📷 {room.total_photos_required || 0} {t.common.photos}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        
                                                        {(room.tasks || []).length > 0 && (
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                                    {t.common.tasks}
                                                                </p>
                                                                <div className="grid gap-2 sm:grid-cols-2">
                                                                    {room.tasks.map((task, idx) => {
                                                                        const taskId = `${room.room_id}-${task.id || idx}-${task.name}`;
                                                                        return (
                                                                            <div
                                                                                key={taskId}
                                                                                className="flex items-start gap-2.5 p-2.5 rounded-md border border-slate-200 bg-slate-50/50 text-xs"
                                                                            >
                                                                                <div className="min-w-0 flex-1 space-y-1">
                                                                                    <p className="font-medium text-slate-800 leading-snug">
                                                                                        {task.name}
                                                                                    </p>
                                                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                                                        <span className="inline-flex items-center gap-1 rounded bg-sky-100/70 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">
                                                                                            <TbRefresh className="text-[10px]" />
                                                                                            {formatFrequency(task.frequency_type)}
                                                                                        </span>
                                                                                        {task.is_photo_req && (
                                                                                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200">
                                                                                                📷 {t.common.photos}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        
                                                        {(room.required_photos || []).length > 0 && (
                                                            <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                                    {t.common.required} {t.common.photos}
                                                                </p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {(room.required_photos || []).map((p, pIdx) => (
                                                                        <span
                                                                            key={p.id || pIdx}
                                                                            className="inline-flex items-center gap-1.5 rounded-md border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700"
                                                                        >
                                                                            <TbCamera className="text-xs text-sky-500" />
                                                                            {p.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-3">
                                                {planRooms.map((r, index) => (
                                                    <span
                                                        key={`${plan.id}-${index}-${r}`}
                                                        className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 border border-sky-100"
                                                    >
                                                        🚪 {r}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    
                                    {additionalTasks.length > 0 && (
                                        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2.5">
                                            <h3 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                                                {t.common.tasks} ({additionalTasks.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {additionalTasks.map((task, idx) => (
                                                    <div
                                                        key={task.id || idx}
                                                        className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-slate-900">{task.name}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                {task.fixed_date && (
                                                                    <span className="text-[11px] text-slate-500 font-medium">📅 {task.fixed_date}</span>
                                                                )}
                                                                {(task.duration_minutes || task.duration) && (
                                                                    <span className="text-[11px] text-slate-500 font-medium">
                                                                        ⏱️ {task.duration_minutes || task.duration}m
                                                                    </span>
                                                                )}
                                                                <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 uppercase">
                                                                    {(task.frequency_type || 'fixed_date').replaceAll('_', ' ')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {task.description && (
                                                            <p className="text-xs text-slate-600 bg-white rounded border border-slate-100 p-2 leading-relaxed">
                                                                {task.description}
                                                            </p>
                                                        )}

                                                        {task.is_photo_req && task.photo && task.photo.length > 0 && (
                                                            <div className="pt-1 flex flex-wrap items-center gap-1.5">
                                                                <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                                                    <TbCamera className="text-xs" /> {t.common.photos}:
                                                                </span>
                                                                {task.photo.map((p, pIdx) => (
                                                                    <span
                                                                        key={p.id || pIdx}
                                                                        className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-100"
                                                                    >
                                                                        {p.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                
                                <div className="space-y-5">
                                    
                                    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                                <TbUsers className="text-sky-500 text-base" /> {t.common.assignWorkers} ({workers.length})
                                            </h3>
                                            {onAssign && (
                                                <button
                                                    onClick={onAssign}
                                                    className="text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
                                                >
                                                    {t.common.edit}
                                                </button>
                                            )}
                                        </div>

                                        {workers.length === 0 ? (
                                            <div className="py-6 text-center border border-dashed rounded-lg bg-slate-50 space-y-1.5">
                                                <TbUsers className="mx-auto text-2xl text-slate-300" />
                                                <p className="text-xs font-medium text-slate-500">{t.common.noDataFound}</p>
                                                {onAssign && (
                                                    <button
                                                        onClick={onAssign}
                                                        className="mt-1 rounded-md bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600 cursor-pointer"
                                                    >
                                                        {t.common.assignWorkers}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {workers.map((w) => (
                                                    <div
                                                        key={w.worker_id}
                                                        className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50/70 p-2.5"
                                                    >
                                                        {w.profile_photo ? (
                                                            <img
                                                                src={w.profile_photo}
                                                                alt={w.name}
                                                                className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200"
                                                            />
                                                        ) : (
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white font-semibold text-xs shrink-0">
                                                                {w.name
                                                                    ?.split(' ')
                                                                    .map((p) => p[0])
                                                                    .join('')
                                                                    .slice(0, 2) || 'W'}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-slate-900 truncate">
                                                                {w.name}
                                                            </p>
                                                            <p className="text-[10px] font-medium text-slate-400 capitalize">
                                                                {w.position?.replace('_', ' ') || 'Cleaner'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    
                                    {details?.manager && (
                                        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                                            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                                {t.managerAccess.title}
                                            </h3>
                                            <div className="flex items-center gap-3 pt-1">
                                                {details.manager.profile_photo ? (
                                                    <img
                                                        src={details.manager.profile_photo}
                                                        alt={details.manager.name}
                                                        className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white font-semibold text-xs shrink-0">
                                                        {details.manager.name
                                                            ?.split(' ')
                                                            .map((p) => p[0])
                                                            .join('')
                                                            .slice(0, 2) || 'M'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-900">{details.manager.name}</p>
                                                    <p className="text-[10px] text-slate-400">{details.manager.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    
                                    <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2.5">
                                        <h3 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <TbCalendar className="text-sky-500" /> {t.roster.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                                                const isActive = (details?.working_days || []).includes(day);
                                                return (
                                                    <span
                                                        key={day}
                                                        className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${isActive
                                                                ? 'bg-sky-500 text-white shadow-xs'
                                                                : 'bg-slate-100 text-slate-400'
                                                            }`}
                                                    >
                                                        {day}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

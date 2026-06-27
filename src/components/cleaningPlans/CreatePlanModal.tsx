"use client";

import React, { useState, useEffect } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { TbClipboardList, TbPlus, TbTrash } from 'react-icons/tb';
import { CleaningPlan } from './types';
import { mockClients, mockLocations } from './MockData';

interface CreatePlanModalProps {
    onClose: () => void;
    onAdd: (plan: Omit<CleaningPlan, 'id'>) => void;
}

export function CreatePlanModal({ onClose, onAdd }: CreatePlanModalProps) {
    const [name, setName] = useState('');
    const [client, setClient] = useState(mockClients[0]);
    const [location, setLocation] = useState('');
    const [duration, setDuration] = useState('45');
    const [photos, setPhotos] = useState('4');
    const [checklistTasks, setChecklistTasks] = useState<string[]>(['']);
    const [photoRequirements, setPhotoRequirements] = useState<string[]>(['']);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const addTask = () => setChecklistTasks((p) => [...p, '']);
    const updateTask = (i: number, val: string) =>
        setChecklistTasks((p) => p.map((t, idx) => (idx === i ? val : t)));
    const removeTask = (i: number) =>
        setChecklistTasks((p) => p.filter((_, idx) => idx !== i));

    const addPhoto = () => setPhotoRequirements((p) => [...p, '']);
    const updatePhoto = (i: number, val: string) =>
        setPhotoRequirements((p) => p.map((t, idx) => (idx === i ? val : t)));
    const removePhoto = (i: number) =>
        setPhotoRequirements((p) => p.filter((_, idx) => idx !== i));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !location) return;
        const validTasks = checklistTasks.filter((t) => t.trim());
        const validPhotos = photoRequirements.filter((p) => p.trim());
        onAdd({
            name,
            client,
            location,
            rooms: [],
            duration: parseInt(duration),
            photos: parseInt(photos),
            tasks: validTasks.length,
            aiValid: false,
            checklistTasks: validTasks,
            photoRequirements: validPhotos,
        });
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[70]  flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200"
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-md shadow-2xl w-full max-w-[520px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-[#e0f2fe] flex items-center justify-center shrink-0">
                        <TbClipboardList className="text-[#0ea5e9] text-lg" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base font-bold text-gray-900">Create Cleaning Plan</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Assign client, location, rooms and tasks</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer">
                        <MdOutlineClose className="text-xl" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto scrollbar-hidden px-6 py-5 space-y-5">
                    {/* Plan Name */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Plan Name *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Standard Room Clean"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-10 rounded border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] focus:bg-white transition-colors"
                        />
                    </div>

                    {/* Assignment box */}
                    <div className="border border-gray-200 rounded p-4 space-y-3">
                        <p className="text-xs font-bold text-gray-800">Assignment</p>
                        {/* Client */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                                <TbClipboardList className="text-base" /> Client *
                            </label>
                            <select
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                                className="w-full h-10 rounded border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                            >
                                {mockClients.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        {/* Location */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
                                📍 Location *
                            </label>
                            <select
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full h-10 rounded border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                            >
                                <option value="">Select location...</option>
                                {mockLocations.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Duration + Photos */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Duration (min) *</label>
                            <input
                                type="number"
                                required
                                min={1}
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full h-10 rounded border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] focus:bg-white transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Required Photos *</label>
                            <input
                                type="number"
                                required
                                min={0}
                                value={photos}
                                onChange={(e) => setPhotos(e.target.value)}
                                className="w-full h-10 rounded border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Checklist Tasks */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Checklist Tasks *</label>
                        <div className="space-y-2">
                            {checklistTasks.map((task, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder={`Task ${i + 1}`}
                                        value={task}
                                        onChange={(e) => updateTask(i, e.target.value)}
                                        className="flex-1 h-10 rounded border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] focus:bg-white transition-colors"
                                    />
                                    {checklistTasks.length > 1 && (
                                        <button type="button" onClick={() => removeTask(i)} className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
                                            <TbTrash className="text-lg" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addTask}
                            className="mt-2 w-full h-10 rounded border border-dashed border-gray-300 text-sm text-gray-500 hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <TbPlus className="text-base" /> Add Task
                        </button>
                    </div>

                    {/* Photo Requirements */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Photo Requirements</label>
                        <div className="space-y-2">
                            {photoRequirements.map((req, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. Bathroom before"
                                        value={req}
                                        onChange={(e) => updatePhoto(i, e.target.value)}
                                        className="flex-1 h-10 rounded border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] focus:bg-white transition-colors"
                                    />
                                    {photoRequirements.length > 1 && (
                                        <button type="button" onClick={() => removePhoto(i)} className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
                                            <TbTrash className="text-lg" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addPhoto}
                            className="mt-2 w-full h-10 rounded border border-dashed border-gray-300 text-sm text-gray-500 hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <TbPlus className="text-base" /> Add Photo Requirement
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded shadow-sm transition-colors cursor-pointer"
                    >
                        + Create Plan
                    </button>
                </div>
            </form>
        </div>
    );
}
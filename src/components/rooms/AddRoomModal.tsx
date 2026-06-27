"use client";

import React, { useState, useEffect } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { TbDoor } from 'react-icons/tb';
import { CleaningPlan, Room, RoomType } from './types';
import { mockCleaningPlans, mockLocations } from './MockData';

interface AddRoomModalProps {
    onClose: () => void;
    onAdd: (room: Omit<Room, 'id'>) => void;
}

export function AddRoomModal({ onClose, onAdd }: AddRoomModalProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<RoomType>('Standard');
    const [location, setLocation] = useState(mockLocations[0]);
    const [floor, setFloor] = useState('');
    const [duration, setDuration] = useState('45');
    const [photos, setPhotos] = useState('4');
    const [tasks, setTasks] = useState('12');
    const [cleaningPlan, setCleaningPlan] = useState<CleaningPlan>('Standard Clean');

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !floor) return;
        onAdd({
            name,
            type,
            location,
            floor,
            duration: parseInt(duration),
            photos: parseInt(photos),
            tasks: parseInt(tasks),
            cleaningPlan,
        });
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200"
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-md shadow-2xl w-full max-w-[480px] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100 ">
                    <div className="w-9 h-9 rounded-lg bg-[#e0f2fe] flex items-center justify-center shrink-0">
                        <TbDoor className="text-[#0ea5e9] text-lg" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base font-bold text-gray-900">Add New Room</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Fill in the room details below</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer">
                        <MdOutlineClose className="text-xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Room Name */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Room Name *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Room 301"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                        />
                    </div>

                    {/* Room Type + Location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Room Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as RoomType)}
                                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                            >
                                <option value="Standard">Standard</option>
                                <option value="Deluxe">Deluxe</option>
                                <option value="Suite">Suite</option>
                                <option value="Junior Suite">Junior Suite</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Location</label>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                            >
                                {mockLocations.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Floor */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Floor *</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Floor 3"
                            value={floor}
                            onChange={(e) => setFloor(e.target.value)}
                            className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                        />
                    </div>

                    {/* Duration + Photos + Tasks */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Duration (min) *</label>
                            <input
                                type="number"
                                required
                                min={1}
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
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
                                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Tasks *</label>
                            <input
                                type="number"
                                required
                                min={0}
                                value={tasks}
                                onChange={(e) => setTasks(e.target.value)}
                                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Cleaning Plan */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Cleaning Plan</label>
                        <select
                            value={cleaningPlan}
                            onChange={(e) => setCleaningPlan(e.target.value as CleaningPlan)}
                            className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                        >
                            {mockCleaningPlans.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                        + Add Room
                    </button>
                </div>
            </form>
        </div>
    );
}
"use client";

import React, { useState, useEffect } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { MdOutlineLocationOn } from 'react-icons/md';
import { Location } from './types';
import { mockClients } from './MockData';

interface CreateLocationModalProps {
    onClose: () => void;
    onAdd: (location: Omit<Location, 'id'>) => void;
}

export function CreateLocationModal({ onClose, onAdd }: CreateLocationModalProps) {
    const [name, setName] = useState('');
    const [client, setClient] = useState(mockClients[0]);
    const [address, setAddress] = useState('');
    const [floors, setFloors] = useState('');
    const [rooms, setRooms] = useState('');
    const [requiredHours, setRequiredHours] = useState('');
    const [assignedEmployees, setAssignedEmployees] = useState<string[]>([]);
    const employees = ['Lisa Visser', 'Emma Smit', 'Noah Bos', 'Sophie de Boer', 'Lucas Meijer', 'Anna Mulder', 'Daan van den Berg', 'Milan Dekker'];

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !address || !floors || !rooms) return;
        onAdd({
            name,
            client,
            address,
            floors: parseInt(floors),
            rooms: parseInt(rooms),
            requiredHours: parseInt(requiredHours) || 0,
            assignedEmployees,
        });
    };

    return (
        <div
            onClick={onClose}
            className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4 scrollbar-hidden animate-in fade-in duration-200"
        >
            <form
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-md shadow w-full max-w-[480px] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
                    <div className="w-9 h-9 rounded bg-[#e0f2fe] flex items-center justify-center shrink-0">
                        <MdOutlineLocationOn className="text-[#0ea5e9] text-lg" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-base font-bold text-gray-900">Add New Location</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Fill in the location details below</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                    >
                        <MdOutlineClose className="text-xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Location Name */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Location Name *</label>
                        <input
                            type="text"
                            required
                            placeholder="bijv. NH Hotel Amsterdam - Vleugel B"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                        />
                    </div>

                    {/* Client */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Client</label>
                        <select
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors appearance-none cursor-pointer"
                        >
                            {mockClients.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Address *</label>
                        <input
                            type="text"
                            required
                            placeholder="bijv. Keizersgracht 123, Amsterdam"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                        />
                    </div>

                    {/* Floors + Rooms */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Number of Floors *</label>
                            <input
                                type="number"
                                required
                                min={1}
                                placeholder="e.g. 4"
                                value={floors}
                                onChange={(e) => setFloors(e.target.value)}
                                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Number of Rooms *</label>
                            <input
                                type="number"
                                required
                                min={1}
                                placeholder="e.g. 48"
                                value={rooms}
                                onChange={(e) => setRooms(e.target.value)}
                                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Required working hours / month *</label>
                        <input type="number" required min={1} placeholder="e.g. 240" value={requiredHours} onChange={(e) => setRequiredHours(e.target.value)} className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#0ea5e9]" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Assigned employees</label>
                        <div className="grid max-h-32 grid-cols-2 gap-1.5 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-2">
                            {employees.map((employee) => <label key={employee} className="flex cursor-pointer items-center gap-2 rounded bg-white px-2 py-1.5 text-[11px] text-gray-700"><input type="checkbox" checked={assignedEmployees.includes(employee)} onChange={() => setAssignedEmployees((items) => items.includes(employee) ? items.filter((item) => item !== employee) : [...items, employee])} className="accent-sky-500" />{employee}</label>)}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100">
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
                        + Add Location
                    </button>
                </div>
            </form>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { MdOutlineLocationOn } from 'react-icons/md';
import { createClientLocation, getClientOptions, type ClientOption } from '@/services/actions/locations';

interface CreateLocationModalProps {
    onClose: () => void;
    onAdd: () => void;
}

export function CreateLocationModal({ onClose, onAdd }: CreateLocationModalProps) {
    const [name, setName] = useState('');
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [client, setClient] = useState('');
    const [address, setAddress] = useState('');
    const [floor, setFloor] = useState('1');
    const [type, setType] = useState('office');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        void getClientOptions().then((result) => { if (result.success) { setClients(result.data.clients); setClient(result.data.clients[0]?.id ?? ''); } else setError(result.error); });
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !type || !address || floor === '' || !client) return;
        setSaving(true); setError(''); const result = await createClientLocation(client, { name, type, address, floor: Number(floor), description }); setSaving(false);
        if (!result.success) { setError(result.error); return; }
        onAdd();
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
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.company_name || c.primary_contact_name}</option>
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Floor *</label>
                            <input
                                type="number"
                                required
                                min={0}
                                placeholder="e.g. 1"
                                value={floor}
                                onChange={(e) => setFloor(e.target.value)}
                                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Type *</label>
                            <input value={type} onChange={(e) => setType(e.target.value)} required className="w-full h-10 rounded border border-gray-300 px-3 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded border border-gray-300 px-3 py-2 text-sm resize-none" />
                    </div>
                    {error && <p className="text-xs font-medium text-red-600">{error}</p>}
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
                        disabled={saving}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                    >
                        {saving ? 'Adding...' : '+ Add Location'}
                    </button>
                </div>
            </form>
        </div>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { MdOutlineLocationOn } from 'react-icons/md';
import { createClientLocation, getClientOptions, type ClientOption } from '@/services/actions/locations';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';
import { usePathname } from 'next/navigation';
import { getLocale } from '@/lib/locale';
import { getDashboardTranslation } from '@/lib/translations';
import { getPlaceholderTranslation } from '@/lib/translations';

interface CreateLocationModalProps {
    onClose: () => void;
    onAdd: () => void;
}

export function CreateLocationModal({ onClose, onAdd }: CreateLocationModalProps) {
    const t = getDashboardTranslation(getLocale(usePathname()));
    const p = getPlaceholderTranslation(getLocale(usePathname()));
    const [name, setName] = useState('');
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [client, setClient] = useState('');
    const [address, setAddress] = useState('');
    const [floor, setFloor] = useState('1');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
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
        if (latitude === null || longitude === null) {
            setError('Pick the address from the suggestion list so its coordinates are captured — required for geofenced worker check-in.');
            return;
        }
        setSaving(true); setError('');
        const result = await createClientLocation(client, { name, type, address, floor: Number(floor), description, latitude, longitude });
        setSaving(false);
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
                        <h2 className="text-base font-bold text-gray-900">{t.locations.addLocation}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{t.locations.title}</p>
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
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.locations.title} *</label>
                        <input
                            type="text"
                            required
                            placeholder={p.name}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                        />
                    </div>

                    {/* Client */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.extraServices.client}</label>
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

                    {/* Address — Google Places Autocomplete; picking a suggestion captures
                        lat/lng automatically, no separate coordinate fields needed. */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.settings.address} *</label>
                        <AddressAutocompleteInput
                            required
                            value={address}
                            onChange={setAddress}
                            onPlaceSelect={({ address: picked, latitude: lat, longitude: lng }) => { setAddress(picked); setLatitude(lat); setLongitude(lng); }}
                            placeholder={p.address}
                            className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                        />
                        <p className="mt-1 text-[11px] text-gray-400">
                            {latitude !== null && longitude !== null
                                ? `Coordinates set: ${latitude.toFixed(5)}, ${longitude.toFixed(5)} — workers must be within 50m to check in.`
                                : 'Pick a suggestion from the list to capture coordinates for geofenced worker check-in.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.common.floors} *</label>
                            <input
                                type="number"
                                required
                                min={0}
                                placeholder={p.number}
                                value={floor}
                                onChange={(e) => setFloor(e.target.value)}
                                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.common.status} *</label>
                            <input value={type} onChange={(e) => setType(e.target.value)} required className="w-full h-10 rounded border border-gray-300 px-3 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.extraServices.description}</label>
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
                        {t.common.cancel}
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                    >
                        {saving ? t.settings.saving : t.locations.addLocation}
                    </button>
                </div>
            </form>
        </div>
    );
}

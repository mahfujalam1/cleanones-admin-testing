"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MdSearch, MdAdd, MdBusinessCenter, MdMail, MdPhone, MdLocationOn } from 'react-icons/md';
import { AddClientModal } from '@/components/clients/AddClientModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addClient } from '@/store/slices/clients.slice';
import type { Client } from '@/components/clients/types';

export default function ClientsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const clients = useAppSelector((state) => state.clients.list);

  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return clients.filter((client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.mainContactName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, clients]);

  const getIndustryColor = (industry: string) => {
    switch (industry) {
      case 'Corporate': return 'text-[#0ea5e9]';
      case 'Healthcare': return 'text-[#ef4444]';
      case 'Hospitality': return 'text-[#6366f1]';
      default: return 'text-gray-500';
    }
  };

  const getContractColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-[#10b981]';
      case 'Expiring': return 'text-[#f59e0b]';
      case 'Expired': return 'text-[#ef4444]';
      default: return 'text-gray-500';
    }
  };

  const handleAddClient = (clientData: Omit<Client, 'id' | 'locationsCount' | 'contractStatus' | 'contractExpiryDate' | 'activeTasks' | 'contacts' | 'locations'>) => {
    dispatch(addClient(clientData));
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Search & Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm w-64 focus:outline-none shadow-sm bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1.5 h-9 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <MdAdd className="text-lg" />
          Add Client
        </button>
      </div>

      {/* Grid of Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((client) => (
          <div
            key={client.id}
            onClick={() => router.push(`/clients/${client.id}`)}
            className="dashboard-card flex cursor-pointer flex-col justify-between space-y-4 p-5 transition-[border-color,box-shadow] hover:border-[#d7dbe4] hover:shadow-md"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  client.industry === 'Healthcare' ? 'bg-[#fef2f2]' : 'bg-[#f0fdf4]'
                }`}>
                  <MdBusinessCenter className={`text-xl ${
                    client.industry === 'Healthcare' ? 'text-[#ef4444]' : 'text-[#10b981]'
                  }`} />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-gray-900 leading-snug">{client.name}</h3>
                  <span className={`text-[11px] font-semibold ${getIndustryColor(client.industry)}`}>
                    {client.industry}
                  </span>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                client.status === 'Active' ? 'bg-[#e0f2fe] text-[#0ea5e9]' : 'bg-gray-100 text-gray-500'
              }`}>
                {client.status}
              </span>
            </div>

            {/* Middle Contact Information */}
            <div className="space-y-2.5 pt-2 border-t border-gray-50">
              <div className="text-xs font-bold text-gray-800">{client.mainContactName}</div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MdMail className="text-gray-400 text-sm shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MdPhone className="text-gray-400 text-sm shrink-0" />
                <span>{client.phone}</span>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs">
              <div className="flex items-center gap-1 text-gray-400">
                <MdLocationOn className="text-sm" />
                <span>{client.locationsCount} {client.locationsCount === 1 ? 'location' : 'locations'}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold">
                <span className="text-gray-400">Contract:</span>
                <span className={getContractColor(client.contractStatus)}>{client.contractStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {addModalOpen && (
        <AddClientModal
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddClient}
        />
      )}
    </div>
  );
}

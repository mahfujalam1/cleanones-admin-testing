"use client";

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdArrowBack as ArrowBack,
  MdBusinessCenter as BusinessCenter,
  MdMail as Mail,
  MdPhone as Phone,
  MdLocationOn as LocationOn,
  MdAdd as AddIcon,
  MdUploadFile,
  MdDescription,
  MdAutorenew,
  MdCheckCircle,
  MdFileDownload,
  MdEmail,
  MdOutlineClose
} from 'react-icons/md';
import { CreateLocationModal } from '@/components/clients/CreateLocationModal';
import { AddContactModal } from '@/components/clients/AddContactModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Client, ClientContact, ClientLocation } from '@/components/clients/types';
import {
  addClientContact,
  deleteClientContact,
  addClientLocation,
  deleteClientLocation
} from '@/store/slices/clients.slice';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

type ClientTab = 'Overview' | 'Contacts' | 'Locations' | 'Contract' | 'Cleaning Plan' | 'Reports';

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);

  const clients = useAppSelector((state) => state.clients.list);
  const client = clients.find((c) => c.id === resolvedParams.id);
  
  const [activeTab, setActiveTab] = useState<ClientTab>('Overview');

  if (!client) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-bold text-gray-900">Client not found</h3>
        <button
          onClick={() => router.push('/clients')}
          className="mt-4 text-[#0ea5e9] hover:underline"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/clients')}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
          >
            <ArrowBack className="text-base" />
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded flex items-center justify-center ${
              client.industry === 'Healthcare' ? 'bg-[#fef2f2]' : 'bg-[#f0fdf4]'
            }`}>
              <BusinessCenter className={`text-xl ${
                client.industry === 'Healthcare' ? 'text-[#ef4444]' : 'text-[#10b981]'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 leading-none">{client.name}</h2>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  client.status === 'Active' ? 'bg-[#e0f2fe] text-[#0ea5e9]' : 'bg-gray-100 text-gray-500'
                }`}>
                  {client.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {client.industry} · Contract: {client.contractStatus}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none">
        {(['Overview', 'Contacts', 'Locations', 'Contract', 'Cleaning Plan', 'Reports'] as ClientTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-5 py-3.5 text-xs font-semibold transition-colors border-b-2 cursor-pointer ${
              activeTab === tab
                ? 'text-[#0ea5e9] border-[#0ea5e9]'
                : 'text-gray-400 hover:text-gray-600 border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'Overview' && <OverviewTab client={client} />}
        {activeTab === 'Contacts' && <ContactsTab client={client} />}
        {activeTab === 'Locations' && <LocationsTab client={client} />}
        {activeTab === 'Contract' && <ContractTab client={client} />}
        {activeTab === 'Cleaning Plan' && <CleaningPlanTab />}
        {activeTab === 'Reports' && <ReportsTab />}
      </div>
    </div>
  );
}

/* ─── Overview Tab ────────────────────────────────────── */

function OverviewTab({ client }: { client: Client }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Company Details */}
      <div className="bg-white rounded border border-gray-100 p-6 space-y-4 shadow-sm lg:col-span-1">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Company Details</h3>
        <div className="divide-y divide-gray-50 text-sm">
          <div className="flex justify-between py-3">
            <span className="text-gray-400">Company</span>
            <span className="font-semibold text-gray-900">{client.name}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-400">Industry</span>
            <span className="font-semibold text-gray-900">{client.industry}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-400">Status</span>
            <span className="font-semibold text-gray-900">{client.status}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-400">Contract Expiry</span>
            <span className="font-semibold text-gray-900">{client.contractExpiryDate}</span>
          </div>
        </div>
      </div>

      {/* Mini metric grid */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricBox label="Locations" value={client.locationsCount} />
        <MetricBox label="Contacts" value={client.contacts.length} />
        <MetricBox label="Active Tasks" value={client.activeTasks} />
        <MetricBox
          label="Contract"
          value={
            <span className={client.contractStatus === 'Active' ? 'text-[#10b981]' : 'text-[#f59e0b]'}>
              {client.contractStatus}
            </span>
          }
        />
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded p-6 flex flex-col justify-center min-h-[110px] shadow-sm">
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold text-[#0ea5e9]">{value}</div>
    </div>
  );
}

/* ─── Contacts Tab ────────────────────────────────────── */

function ContactsTab({ client }: { client: Client }) {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddContact = (contactData: Omit<ClientContact, 'id'>) => {
    dispatch(addClientContact({ clientId: client.id, contact: contactData }));
    setModalOpen(false);
  };

  const handleDeleteContact = (contactId: string) => {
    dispatch(deleteClientContact({ clientId: client.id, contactId }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {client.contacts.map((contact) => (
          <div key={contact.id} className="bg-white rounded border border-gray-100 p-6 space-y-4 shadow-sm relative group">
            <button
              onClick={() => handleDeleteContact(contact.id)}
              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
              title="Delete Contact"
            >
              <MdOutlineClose className="text-lg" />
            </button>
            <div>
              <h4 className="font-bold text-[15px] text-gray-900 leading-snug">{contact.name}</h4>
              <span className="inline-block mt-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#e0f2fe] text-[#0ea5e9]">
                {contact.role}
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-500 pt-2 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <Mail className="text-gray-400 text-base" />
                <a href={`mailto:${contact.email}`} className="hover:underline text-gray-700">
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-gray-400 text-base" />
                <span>{contact.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-1.5 h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
      >
        <AddIcon className="text-base" />
        Add Contact
      </button>

      {modalOpen && (
        <AddContactModal
          onClose={() => setModalOpen(false)}
          onSave={handleAddContact}
        />
      )}
    </div>
  );
}

/* ─── Locations Tab ───────────────────────────────────── */

function LocationsTab({ client }: { client: Client }) {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveLocation = (locationData: Omit<ClientLocation, 'id'>) => {
    dispatch(addClientLocation({ clientId: client.id, location: locationData }));
    setModalOpen(false);
  };

  const handleDeleteLocation = (locationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteClientLocation({ clientId: client.id, locationId }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {client.locations.map((loc) => (
          <div
            key={loc.id}
            className="bg-white rounded border border-gray-100 p-6 flex items-center justify-between shadow-sm hover:shadow transition-shadow cursor-pointer relative group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#e0f2fe] flex items-center justify-center shrink-0">
                <LocationOn className="text-[#0ea5e9] text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-gray-900 leading-tight">{loc.name}</h4>
                <div className="text-[11px] text-gray-400 mt-1">{loc.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500 font-semibold">
                {loc.roomsCount} rooms
              </div>
              <button
                onClick={(e) => handleDeleteLocation(loc.id, e)}
                className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                title="Delete Location"
              >
                <MdOutlineClose className="text-lg" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-1.5 h-9 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
      >
        <AddIcon className="text-base" />
        Add Location
      </button>

      {modalOpen && (
        <CreateLocationModal
          onClose={() => setModalOpen(false)}
          onSave={handleSaveLocation}
        />
      )}
    </div>
  );
}

/* ─── Contract Tab ────────────────────────────────────── */

function ContractTab({ client }: { client: Client }) {
  return (
    <div className="max-w-xl space-y-6">
      {/* Contract Details */}
      <div className="bg-white rounded border border-gray-100 p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Contract Details</h3>
        <div className="divide-y divide-gray-50 text-sm">
          <div className="flex justify-between py-3.5">
            <span className="text-gray-400">Status</span>
            <span className="font-semibold text-gray-900">{client.contractStatus}</span>
          </div>
          <div className="flex justify-between py-3.5">
            <span className="text-gray-400">Expiry Date</span>
            <span className="font-semibold text-gray-900">{client.contractExpiryDate}</span>
          </div>
          <div className="flex justify-between py-3.5">
            <span className="text-gray-400">Client</span>
            <span className="font-semibold text-gray-900">{client.name}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Upload Contract */}
        <button className="flex flex-col items-center justify-center p-5 rounded border border-[#bae6fd] bg-[#f0f9ff] text-[#0ea5e9] hover:bg-[#e0f2fe] transition-colors cursor-pointer gap-2 shadow-sm">
          <MdUploadFile className="text-2xl" />
          <span className="text-xs font-bold">Upload Contract</span>
        </button>

        {/* View Contract */}
        <button className="flex flex-col items-center justify-center p-5 rounded border border-[#a7f3d0] bg-[#ecfdf5] text-[#10b981] hover:bg-[#d1fae5] transition-colors cursor-pointer gap-2 shadow-sm">
          <MdDescription className="text-2xl" />
          <span className="text-xs font-bold">View Contract</span>
        </button>

        {/* Renew Contract */}
        <button className="flex flex-col items-center justify-center p-5 rounded border border-[#fde68a] bg-[#fffbeb] text-[#f59e0b] hover:bg-[#fef3c7] transition-colors cursor-pointer gap-2 shadow-sm">
          <MdAutorenew className="text-2xl" />
          <span className="text-xs font-bold">Renew Contract</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Cleaning Plan Tab ────────────────────────────────── */

function CleaningPlanTab() {
  const [tasks, setTasks] = useState<string[]>([
    'Vacuum Floor',
    'Clean Mirrors',
    'Empty Trash',
    'Replace Towels',
    'Mop Floor'
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleAddTask = () => {
    if (inputValue.trim()) {
      setTasks([...tasks, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  const handleDeleteTask = (indexToDelete: number) => {
    setTasks(tasks.filter((_, i) => i !== indexToDelete));
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white rounded border border-gray-100 p-6 space-y-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Task Builder</h3>
          <p className="text-xs text-gray-400 mt-1">Build the cleaning checklist. Workers receive these tasks automatically.</p>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded bg-gray-50 border border-gray-100 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-3">
                <MdCheckCircle className="text-[#0ea5e9] text-lg shrink-0" />
                <span>{task}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteTask(i)}
                className="text-gray-400 hover:text-red-500 cursor-pointer p-1 transition-colors"
                title="Delete Task"
              >
                <MdOutlineClose className="text-base" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Add a task and press Enter.."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-9 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
          />
          <button
            type="button"
            onClick={handleAddTask}
            className="flex items-center gap-1.5 h-9 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <AddIcon className="text-base" />
            Add Task
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button className="h-9 px-5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-bold rounded shadow-sm transition-colors cursor-pointer">
          Save Plan
        </button>
        <button className="h-9 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded shadow-sm transition-colors cursor-pointer">
          Assign to Location
        </button>
      </div>
    </div>
  );
}

/* ─── Reports Tab ─────────────────────────────────────── */

function ReportsTab() {
  const reports = [
    { title: 'May 2026 Service Report', date: '1 Jun 2026', status: 'Sent' },
    { title: 'April 2026 Service Report', date: '1 May 2026', status: 'Archived' },
    { title: 'Q1 2026 Summary', date: '1 Apr 2026', status: 'Archived' }
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Grid actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ReportActionBox
          icon={<MdDescription className="text-lg text-[#0ea5e9]" />}
          title="Generate Report"
          desc="Create a new client report"
          btnText="Generate"
        />
        <ReportActionBox
          icon={<MdFileDownload className="text-lg text-[#10b981]" />}
          title="Export PDF"
          desc="Download as PDF document"
          btnText="Export"
        />
        <ReportActionBox
          icon={<MdEmail className="text-lg text-[#f59e0b]" />}
          title="Email Report"
          desc="Send report to client"
          btnText="Send"
        />
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded border border-gray-100 p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Recent Reports</h3>
        <div className="divide-y divide-gray-100">
          {reports.map((rep, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 hover:bg-gray-50/50 px-2 rounded transition-colors">
              <div>
                <div className="text-sm font-semibold text-gray-800">{rep.title}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{rep.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  rep.status === 'Sent' ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-gray-100 text-gray-500'
                }`}>
                  {rep.status}
                </span>
                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                  <MdFileDownload className="text-base" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportActionBox({ icon, title, desc, btnText }: { icon: React.ReactNode; title: string; desc: string; btnText: string }) {
  return (
    <div className="bg-white rounded border border-gray-100 p-6 flex flex-col justify-between min-h-[140px] shadow-sm">
      <div>
        <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center mb-3">
          {icon}
        </div>
        <h4 className="text-sm font-bold text-gray-800 leading-snug">{title}</h4>
        <p className="text-[11px] text-gray-400 mt-1">{desc}</p>
      </div>
      <button className="mt-4 self-start px-4 h-7 bg-white border border-gray-200 hover:bg-gray-50 text-[11px] font-semibold rounded shadow-sm transition-colors cursor-pointer text-[#0ea5e9]">
        {btnText}
      </button>
    </div>
  );
}

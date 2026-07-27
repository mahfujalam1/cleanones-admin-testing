"use client";

import React, { useMemo, useState } from "react";
import {
  MdAttachFile,
  MdBusiness,
  MdEmail,
  MdLocationOn,
  MdMoreHoriz,
  MdPhone,
  MdSearch,
  MdSend,
} from "react-icons/md";

type Client = {
  id: string;
  name: string;
  company: string;
  initials: string;
  color: string;
  email: string;
  phone: string;
  location: string;
  unread: number;
  online: boolean;
  lastMessage: string;
  time: string;
};

type Message = {
  id: number;
  sender: "admin" | "client";
  text: string;
  time: string;
};

const clients: Client[] = [
  {
    id: "nh",
    name: "Sophie van Dijk",
    company: "NH Hotels",
    initials: "SV",
    color: "bg-sky-600",
    email: "sophie@nhhotels.nl",
    phone: "+31 20 556 7200",
    location: "Amsterdam",
    unread: 2,
    online: true,
    lastMessage: "Can we add an extra service next week?",
    time: "09:08",
  },
  {
    id: "hilton",
    name: "Mark de Jong",
    company: "Hilton Rotterdam",
    initials: "MJ",
    color: "bg-indigo-600",
    email: "mark@hilton.nl",
    phone: "+31 10 710 8000",
    location: "Rotterdam",
    unread: 0,
    online: true,
    lastMessage: "Thank you, the team did a great job.",
    time: "Yesterday",
  },
  {
    id: "umc",
    name: "Eva Jansen",
    company: "UMC Utrecht",
    initials: "EJ",
    color: "bg-emerald-600",
    email: "eva@umcutrecht.nl",
    phone: "+31 88 755 5555",
    location: "Utrecht",
    unread: 1,
    online: false,
    lastMessage: "Please confirm tomorrow's arrival time.",
    time: "Yesterday",
  },
  {
    id: "valk",
    name: "Thomas Bakker",
    company: "Van der Valk",
    initials: "TB",
    color: "bg-orange-500",
    email: "thomas@valk.com",
    phone: "+31 40 211 6033",
    location: "Eindhoven",
    unread: 0,
    online: false,
    lastMessage: "The updated cleaning plan looks good.",
    time: "Mon",
  },
  {
    id: "office",
    name: "Nora Visser",
    company: "Keizersgracht Offices",
    initials: "NV",
    color: "bg-purple-600",
    email: "nora@keizersgracht.nl",
    phone: "+31 20 320 4410",
    location: "Amsterdam",
    unread: 0,
    online: true,
    lastMessage: "Could you share the monthly report?",
    time: "Fri",
  },
];

const initialMessages: Record<string, Message[]> = {
  nh: [
    { id: 1, sender: "admin", text: "Good morning Sophie. How can I help you today?", time: "09:04" },
    { id: 2, sender: "client", text: "Good morning! Can we add an extra window-cleaning service next week?", time: "09:08" },
    { id: 3, sender: "admin", text: "Absolutely. I’ll check the available team and confirm a suitable time today.", time: "09:10" },
  ],
  hilton: [
    { id: 1, sender: "client", text: "Thank you, the team did a great job yesterday.", time: "Yesterday" },
    { id: 2, sender: "admin", text: "Glad to hear that, Mark. I’ll pass your feedback to the team.", time: "Yesterday" },
  ],
  umc: [
    { id: 1, sender: "client", text: "Please confirm tomorrow's arrival time.", time: "Yesterday" },
  ],
  valk: [
    { id: 1, sender: "client", text: "The updated cleaning plan looks good.", time: "Mon" },
    { id: 2, sender: "admin", text: "Great. The assigned team has received the updated checklist.", time: "Mon" },
  ],
  office: [
    { id: 1, sender: "client", text: "Could you share the monthly report?", time: "Fri" },
  ],
};

export default function AdminChatPage() {
  const [selectedId, setSelectedId] = useState(clients[0].id);
  const [query, setQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const selectedClient = clients.find((client) => client.id === selectedId) ?? clients[0];
  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        `${client.name} ${client.company}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const sendMessage = () => {
    const text = messageText.trim();
    if (!text) return;
    setMessages((current) => ({
      ...current,
      [selectedId]: [
        ...(current[selectedId] ?? []),
        { id: Date.now(), sender: "admin", text, time: "Now" },
      ],
    }));
    setMessageText("");
  };

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] min-h-[560px] flex-col gap-3">
      <header className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-800">Client conversations</h1>
          <p className="text-xs text-slate-500">Support clients and coordinate service requests.</p>
        </div>
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{clients.reduce((total, client) => total + client.unread, 0)}</span> unread messages
        </div>
      </header>

      <div className="grid min-h-0 flex-1 overflow-hidden rounded border border-gray-200 bg-white lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)_250px]">
        <aside className="flex min-h-0 flex-col border-b border-gray-200 lg:border-b-0 lg:border-r">
          <div className="border-b border-gray-200 p-3">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search clients..."
                className="h-9 w-full rounded border border-gray-200 bg-gray-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {filteredClients.map((client) => {
              const active = client.id === selectedId;
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedId(client.id)}
                  className={`mb-1 flex w-full items-start gap-3 rounded border p-2.5 text-left transition-colors ${
                    active ? "border-sky-200 bg-sky-50" : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <span className="relative h-9 w-9 shrink-0">
                    <img src="/avatar-placeholder.svg" alt={client.name} className="h-9 w-9 rounded-full border border-gray-200 object-cover" />
                    {client.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <strong className="truncate text-xs font-semibold text-slate-800">{client.name}</strong>
                      <small className="shrink-0 text-[9px] text-slate-400">{client.time}</small>
                    </span>
                    <span className="block truncate text-[10px] font-medium text-slate-500">{client.company}</span>
                    <span className="mt-1 flex items-center justify-between gap-2">
                      <small className="truncate text-[10px] text-slate-500">{client.lastMessage}</small>
                      {client.unread > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-white">
                          {client.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 px-4">
            <span className="relative h-9 w-9 shrink-0">
              <img src="/avatar-placeholder.svg" alt={selectedClient.name} className="h-9 w-9 rounded-full border border-gray-200 object-cover" />
              {selectedClient.online && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{selectedClient.name}</p>
              <p className="truncate text-[10px] text-slate-500">{selectedClient.company} · {selectedClient.online ? "Online" : "Offline"}</p>
            </div>
            <button aria-label="Conversation options" className="ml-auto flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-gray-100 hover:text-slate-700">
              <MdMoreHoriz className="text-lg" />
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f7f8fa] p-4 sm:p-5">
            <div className="text-center text-[10px] font-medium text-slate-400">Today</div>
            {(messages[selectedId] ?? []).map((message) => (
              <div key={message.id} className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded border px-3 py-2.5 text-xs leading-5 sm:max-w-[70%] ${
                  message.sender === "admin"
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-slate-700"
                }`}>
                  <p>{message.text}</p>
                  <p className={`mt-1 text-right text-[9px] ${message.sender === "admin" ? "text-white/75" : "text-slate-400"}`}>{message.time}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="shrink-0 border-t border-gray-200 bg-white p-3"
          >
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Attach file" className="flex h-7 w-9 shrink-0 items-center justify-center rounded border border-gray-200 text-slate-500 hover:bg-gray-50">
                <MdAttachFile className="text-base" />
              </button>
              <input
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder={`Message ${selectedClient.name}...`}
                className="h-9 min-w-0 flex-1 rounded border border-gray-200 bg-gray-50 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary focus:bg-white focus-visible:outline-none focus-visible:ring-0"
              />
              <button type="submit" aria-label="Send message" className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-primary bg-primary text-white hover:bg-[#008bc7]">
                <MdSend className="text-base" />
              </button>
            </div>
          </form>
        </section>

        <aside className="hidden min-h-0 overflow-y-auto border-l border-gray-200 bg-white p-4 xl:block">
          <div className="text-center">
            <img src="/avatar-placeholder.svg" alt={selectedClient.name} className="mx-auto h-14 w-14 rounded-full border border-gray-200 object-cover" />
            <h2 className="mt-3 text-sm font-semibold text-slate-800">{selectedClient.name}</h2>
            <p className="text-[10px] text-slate-500">{selectedClient.company}</p>
          </div>
          <div className="mt-5 space-y-2">
            <ProfileRow icon={<MdEmail />} label="Email" value={selectedClient.email} />
            <ProfileRow icon={<MdPhone />} label="Phone" value={selectedClient.phone} />
            <ProfileRow icon={<MdLocationOn />} label="Location" value={selectedClient.location} />
            <ProfileRow icon={<MdBusiness />} label="Client" value={selectedClient.company} />
          </div>
          <div className="mt-5 border-t border-gray-200 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Account status</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active client
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded border border-gray-200 bg-gray-50/70 p-3">
      <span className="mt-0.5 text-base text-slate-400">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <span className="mt-0.5 block break-words text-[11px] font-medium text-slate-700">{value}</span>
      </span>
    </div>
  );
}

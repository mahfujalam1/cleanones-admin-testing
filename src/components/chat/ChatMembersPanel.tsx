"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
import {
  MdBusiness,
  MdEngineering,
  MdGroups,
  MdPerson,
  MdShield,
} from "react-icons/md";
import {
  useGetChatMembersQuery,
  type ChatItem,
} from "@/redux/api/endpoints/chat.api";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function ChatMembersPanel({
  chat,
  onlineProfileIds,
}: {
  chat: ChatItem;
  onlineProfileIds: Set<string>;
}) {
  const ui = getUiTranslation(getLocale(usePathname()));
  const { data: members } = useGetChatMembersQuery(chat._id);

  const client = members?.client ?? chat.client;
  const workers = members?.workers ?? chat.workers ?? [];

  const isClientOnline = Boolean(client?._id && onlineProfileIds.has(client._id));

  return (
    <div className="flex h-full flex-col min-h-0 overflow-y-auto p-4 space-y-5">
      <div className="text-center pb-4 border-b border-slate-100">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xs">
          {chat.type === "group" ? (
            <MdGroups className="text-2xl text-white" />
          ) : chat.type === "client" ? (
            <MdBusiness className="text-2xl text-white" />
          ) : (
            <MdEngineering className="text-2xl text-white" />
          )}
        </div>
        <h2 className="mt-3 text-sm font-bold text-slate-800 break-words">
          {chat.display_name || chat.name || "Chat"}
        </h2>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold ${
              chat.type === "group"
                ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                : chat.type === "client"
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            }`}
          >
            {chat.type === "group"
              ? "Cleaning Plan Group"
              : chat.type === "client"
              ? "Client Direct Chat"
              : "Worker Direct Chat"}
          </span>
        </div>
      </div>

      {/* Client Section */}
      {client && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-slate-500">
            <MdBusiness className="text-sm" />
            <p className="text-[11px] font-bold uppercase tracking-wider">
              Client
            </p>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 p-2.5 transition-colors">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow-2xs">
              {client.user?.profile_photo ? (
                <img
                  src={client.user.profile_photo}
                  alt={client.name || "Client"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initials(client.name || client.company_name || "Client")
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                  isClientOnline ? "bg-emerald-500" : "bg-slate-300"
                }`}
                title={isClientOnline ? "Online" : "Offline"}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">
                {client.company_name || client.name || "Client"}
              </p>
              {client.email && (
                <p className="truncate text-[10px] text-slate-500">
                  {client.email}
                </p>
              )}
              {client.phone && (
                <p className="truncate text-[10px] text-slate-400">
                  {client.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Workers Section */}
      {workers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-1.5">
              <MdEngineering className="text-sm" />
              <p className="text-[11px] font-bold uppercase tracking-wider">
                Workers ({workers.length})
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            {workers.map((worker) => {
              const isWorkerOnline = Boolean(worker._id && onlineProfileIds.has(worker._id));
              return (
                <div
                  key={worker._id}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50/50 p-2.5 transition-colors"
                >
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow-2xs">
                    {worker.user?.profile_photo ? (
                      <img
                        src={worker.user.profile_photo}
                        alt={worker.name || "Worker"}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      initials(worker.name || "Worker")
                    )}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                        isWorkerOnline ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                      title={isWorkerOnline ? "Online" : "Offline"}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {worker.name || "Worker"}
                    </p>
                    <p className="truncate text-[10px] text-slate-500 capitalize">
                      {worker.worker_type || "Cleaning Staff"}
                    </p>
                    {worker.phone && (
                      <p className="truncate text-[10px] text-slate-400">
                        {worker.phone}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Managers Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-slate-500">
          <MdShield className="text-sm" />
          <p className="text-[11px] font-bold uppercase tracking-wider">
            Managers
          </p>
        </div>
        <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white text-xs">
              <MdPerson />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-800">
                {ui.systemManagers}
              </p>
              <p className="text-[10px] text-slate-400">
                {ui.systemManagersNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { TbClipboardList, TbMapPin, TbCalendar, TbUser } from "react-icons/tb";
import type { UnifiedServiceRequest } from "./types";

const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const statusColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  under_review: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  in_progress: "bg-sky-50 text-sky-700 border border-sky-200",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
};

interface ExtraServiceCardProps {
  item: UnifiedServiceRequest;
  onClick: () => void;
}

export function ExtraServiceCard({ item, onClick }: ExtraServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left shadow-xs transition-all hover:border-sky-300 hover:shadow-md cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <TbClipboardList className="text-lg" />
            </span>
            <h2 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h2>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              statusColor[item.status.toLowerCase()] ?? "bg-slate-50 text-slate-600 border border-slate-200"
            }`}
          >
            {label(item.status)}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
          {item.description || "No description provided."}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
        {item.client_name && (
          <div className="flex items-center gap-1.5 truncate">
            <TbUser className="text-slate-400 shrink-0" />
            <span className="truncate">{item.client_name}</span>
          </div>
        )}
        {item.location_name && (
          <div className="flex items-center gap-1.5 truncate">
            <TbMapPin className="text-slate-400 shrink-0" />
            <span className="truncate">
              {item.location_name}
              {item.room_name ? ` · ${item.room_name}` : ""}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <TbCalendar className="text-slate-400" />
            <span>{item.preferred_date || item.date_submitted || "On demand"}</span>
          </div>
          {item.planId && (
            <span className="font-mono text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
              Plan: {item.planId.slice(-8)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

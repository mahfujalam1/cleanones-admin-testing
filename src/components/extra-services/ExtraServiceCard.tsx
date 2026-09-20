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
      type="button"
      onClick={onClick}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl bg-white text-left ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:ring-slate-300 hover:shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]"
    >
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg text-slate-400 ring-1 ring-slate-200/70 transition-colors group-hover:bg-sky-50 group-hover:text-primary group-hover:ring-sky-100">
              <TbClipboardList className="text-lg" />
            </span>
            <h2 className="line-clamp-1 text-sm font-semibold text-slate-900 transition-colors group-hover:text-primary">
              {item.title}
            </h2>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
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

      <div className="space-y-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
        {item.client_name && (
          <div className="flex items-center gap-1.5 truncate">
            <TbUser className="shrink-0 text-slate-400" />
            <span className="truncate">{item.client_name}</span>
          </div>
        )}
        {item.location_name && (
          <div className="flex items-center gap-1.5 truncate">
            <TbMapPin className="shrink-0 text-slate-400" />
            <span className="truncate">
              {item.location_name}
              {item.room_name ? ` · ${item.room_name}` : ""}
            </span>
          </div>
        )}
        <div className="flex items-center pt-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <TbCalendar className="text-slate-400" />
            <span>{item.preferred_date || item.date_submitted || "On demand"}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

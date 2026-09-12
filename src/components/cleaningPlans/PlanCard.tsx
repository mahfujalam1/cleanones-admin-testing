"use client";

import React from "react";
import { TbClipboardList, TbClock, TbCamera, TbChecklist, TbUser, TbMapPin, TbDoor, TbTrash, TbPencil } from "react-icons/tb";
import type { CleaningPlan } from "./types";
import type { DashboardTranslationDict } from "@/lib/translations";

interface PlanCardProps {
  plan: CleaningPlan;
  t: DashboardTranslationDict;
  onClick: () => void;
  isSelected: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onAssign: () => void;
}

export function PlanCard({
  plan,
  t,
  onClick,
  isSelected,
  onDelete,
  onEdit,
  onAssign,
}: PlanCardProps) {
  return (
    <div
      onClick={onClick}
      className={`dashboard-card flex flex-col justify-between h-full cursor-pointer transition-[border-color,box-shadow] hover:border-[#d7dbe4] hover:shadow ${
        isSelected ? "border-[#0ea5e9]/50 shadow ring-1 ring-[#0ea5e9]/20" : ""
      }`}
    >
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-3.5 pt-3 pb-2 flex items-start gap-2.5">
          <div className="w-8 h-8 rounded bg-[#e0f2fe] flex items-center justify-center shrink-0 mt-0.5">
            <TbClipboardList className="text-[#0ea5e9] text-base" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-gray-900 leading-tight line-clamp-1">{plan.name}</p>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-semibold shrink-0 ${
                  plan.aiValid ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                }`}
              >
                {plan.aiValid ? t.common.active : t.common.inactive}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{plan.client || "No client"}</p>
          </div>
          {/* Action icons */}
          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onDelete}
              className="p-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
              title={t.common.delete}
            >
              <TbTrash className="text-sm" />
            </button>
            <button
              onClick={onEdit}
              className="p-1 text-gray-300 hover:text-[#0ea5e9] transition-colors cursor-pointer"
              title={t.common.edit}
            >
              <TbPencil className="text-sm" />
            </button>
          </div>
        </div>

        {/* Location, Schedule & Rooms */}
        <div className="px-3.5 pb-2.5 space-y-1.5">
          {/* Location */}
          <div className="flex items-center gap-1.5 min-w-0">
            <TbMapPin className={`text-sm shrink-0 ${plan.location ? "text-[#0ea5e9]" : "text-gray-300"}`} />
            <p
              className={`text-xs truncate ${plan.location ? "font-semibold text-gray-800" : "text-gray-400 italic"}`}
              title={plan.location || undefined}
            >
              {plan.location || "No location specified"}
            </p>
          </div>

          {/* Schedule Date & Time */}
          {plan.dateSchedule && (
            <div className="flex items-center gap-1.5 text-gray-400 min-w-0">
              <TbClock className="text-xs shrink-0" />
              <p className="text-[11px] truncate">{plan.dateSchedule}</p>
            </div>
          )}

          {/* Rooms */}
          {(plan.rooms ?? []).length > 0 && (
            <div className="flex items-center gap-1.5 pt-0.5 min-w-0">
              <TbDoor className="text-gray-400 text-xs shrink-0" />
              <div className="flex flex-wrap gap-1">
                {(plan.rooms ?? []).slice(0, 3).map((r, index) => (
                  <span
                    key={`${plan.id}-${index}-${r}`}
                    title={r}
                    className="max-w-[110px] truncate text-[10px] font-medium text-[#0ea5e9] bg-[#e0f2fe] px-1.5 py-0.5 rounded"
                  >
                    {r}
                  </span>
                ))}
                {(plan.rooms ?? []).slice(3).length > 0 && (
                  <span className="text-[10px] text-gray-400">+{(plan.rooms ?? []).length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic tasks */}
        {plan.periodicTasks && (
          <div className="mx-3.5 mb-2 rounded border border-sky-100 bg-sky-50 p-2 text-xs">
            <p className="text-[9px] font-bold uppercase tracking-wider text-sky-700">Dynamic tasks</p>
            <p className="mt-0.5 text-xs text-slate-600">
              {plan.periodicTasks.filter((task) => task.due).length} periodic task(s) due this week
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">Photos: {plan.photoRotation}</p>
          </div>
        )}

        {/* Stats */}
        <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100 mt-auto">
          <div className="py-2 flex flex-col items-center gap-0.5">
            <TbClock className="text-gray-300 text-sm" />
            <p className="text-xs font-bold text-gray-800">{plan.duration}m</p>
            <p className="text-[10px] text-gray-400">{t.common.duration}</p>
          </div>
          <div className="py-2 flex flex-col items-center gap-0.5">
            <TbCamera className="text-gray-300 text-sm" />
            <p className="text-xs font-bold text-gray-800">{plan.photos}</p>
            <p className="text-[10px] text-gray-400">{t.common.photos}</p>
          </div>
          <div className="py-2 flex flex-col items-center gap-0.5">
            <TbChecklist className="text-gray-300 text-sm" />
            <p className="text-xs font-bold text-gray-800">{plan.tasks}</p>
            <p className="text-[10px] text-gray-400">{t.common.tasks}</p>
          </div>
        </div>
      </div>

      {/* Assign Button at Bottom */}
      <div className="border-t border-gray-100 p-2.5 mt-auto" onClick={(event) => event.stopPropagation()}>
        <button
          onClick={onAssign}
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded border border-sky-200 bg-sky-50 text-xs font-semibold text-sky-600 transition hover:border-sky-400 hover:bg-sky-100 cursor-pointer"
        >
          <TbUser className="text-sm" /> {t.common.assignWorkers}
        </button>
      </div>
    </div>
  );
}

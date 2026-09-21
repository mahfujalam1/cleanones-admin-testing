"use client";

import React from "react";
import {
  MdDeleteOutline,
  MdModeEditOutline,
  MdOutlineAssignment,
  MdOutlineGroupAdd,
  MdOutlineMeetingRoom,
  MdOutlinePlace,
} from "react-icons/md";
import { planCounts, type CleaningPlan } from "@/redux/api/endpoints/cleaningPlans.api";
import { refDoc, refId } from "@/redux/api/types";
import { clientCompanyLabel, CLIENT_LOOKUP_ARGS, useGetClientsQuery, type Client } from "@/redux/api/endpoints/clients.api";
import type { Location } from "@/redux/api/endpoints/locations.api";

function MetaLine({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
      <span className="shrink-0 text-sm text-slate-400">{icon}</span>
      <span className="truncate">{children}</span>
    </p>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="min-w-0 px-2 py-2.5 text-center">
      <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

export function PlanCard({
  plan,
  onSelect,
  onEdit,
  onDelete,
  onAssign,
}: {
  plan: CleaningPlan;
  onSelect?: (plan: CleaningPlan) => void;
  onEdit?: (plan: CleaningPlan) => void;
  onDelete?: (plan: CleaningPlan) => void;
  onAssign?: (plan: CleaningPlan) => void;
}) {

  const { data: clientPage } = useGetClientsQuery(CLIENT_LOOKUP_ARGS);
  const populatedClient = refDoc<Client>(plan.client);
  const client =
    populatedClient ?? clientPage?.result.find((candidate) => candidate._id === refId(plan.client));

  const location = refDoc<Location>(plan.location);
  const counts = planCounts(plan);

  return (
    <div className="group relative h-full">
      <article
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={() => onSelect?.(plan)}
        onKeyDown={(event) => {
          if (onSelect && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onSelect(plan);
          }
        }}
        className={`flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/70 transition-all duration-200 ${onSelect
            ? "cursor-pointer hover:-translate-y-0.5 hover:ring-slate-300 hover:shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]"
            : ""
          }`}
      >
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg text-slate-400 ring-1 ring-slate-200/70 transition-colors group-hover:bg-sky-50 group-hover:text-primary group-hover:ring-sky-100"
            >
              <MdOutlineAssignment />
            </span>

            <div className="min-w-0 flex-1 pr-12">
              <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-primary">
                {plan.title}
              </h3>
              {client && <p className="mt-0.5 truncate text-xs text-slate-500">{clientCompanyLabel(client)}</p>}
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <MetaLine icon={<MdOutlinePlace />}>{location?.name}</MetaLine>
            <MetaLine icon={<MdOutlineMeetingRoom />}>
              {counts.rooms ? `${counts.rooms} ${counts.rooms === 1 ? "room" : "rooms"}` : null}
            </MetaLine>
          </div>
        </div>



        <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/60">
          <Stat
            value={plan.max_estimated_duration ? `${plan.max_estimated_duration}m` : "—"}
            label="Duration"
          />
          <Stat value={counts.tasks} label="Tasks" />
        </div>

        {onAssign && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAssign(plan);
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-slate-100 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-sky-50"
          >
            <MdOutlineGroupAdd className="text-sm" /> Assign workers
          </button>
        )}
      </article>

      {(onEdit || onDelete) && (
        <div className="absolute right-2.5 top-2.5 flex items-center gap-0.5 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
          {onEdit && (
            <button
              type="button"
              aria-label={`Edit ${plan.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(plan);
              }}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-slate-400 ring-1 ring-slate-200 backdrop-blur transition-colors hover:text-slate-800"
            >
              <MdModeEditOutline className="text-[15px]" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label={`Delete ${plan.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(plan);
              }}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-slate-400 ring-1 ring-slate-200 backdrop-blur transition-colors hover:text-red-600"
            >
              <MdDeleteOutline className="text-[15px]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

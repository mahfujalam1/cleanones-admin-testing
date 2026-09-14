"use client";

import Link from "next/link";
import {
  MdArrowForward,
  MdBadge,
  MdDelete,
  MdEdit,
  MdEventAvailable,
  MdMailOutline,
  MdPhone,
} from "react-icons/md";
import { clientLabel, type Client } from "@/redux/api/endpoints/clients.api";

const TONES = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Inactive: "bg-slate-100 text-slate-600 ring-slate-200",
} as const;

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null;

export function ClientCard({
  client,
  href,
  onEdit,
  onDelete,
}: {
  client: Client;
  href: string;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}) {
  const expiry = formatDate(client.licence_expiration_date);

  return (
    // `group` sits on the wrapper so the action buttons, which live outside the link, still
    // react to hovering the card.
    <div className="group relative h-full">
      <Link
        href={href}
        className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sm font-bold tracking-wide text-sky-600"
            >
              {initials(clientLabel(client))}
            </span>

            <div className="min-w-0 flex-1 pr-16">
              <h3 className="truncate text-[15px] font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary">
                {clientLabel(client)}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                <MdBadge className="shrink-0 text-sm text-slate-400" />
                <span className="truncate">{client.company_name || "Individual"}</span>
              </p>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <MdMailOutline className="shrink-0 text-sm text-slate-400" />
              <dd className="truncate">{client.email || "—"}</dd>
            </div>
            <div className="flex items-center gap-2">
              <MdPhone className="shrink-0 text-sm text-slate-400" />
              <dd className="truncate">{client.phone || "—"}</dd>
            </div>
            <div className="flex items-center gap-2">
              <MdEventAvailable className="shrink-0 text-sm text-slate-400" />
              <dd className="truncate">
                {expiry ? `Licence expires ${expiry}` : "No licence expiry"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          {client.contract_status ? (
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${TONES[client.contract_status] ?? TONES.Inactive}`}
            >
              {client.contract_status}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">No contract status</span>
          )}
          <MdArrowForward className="text-sm text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </Link>

      {/* Outside the link so the card itself stays one clickable target. */}
      <div className="absolute right-3 top-3 flex items-center gap-1 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
        <button
          type="button"
          aria-label={`Edit ${clientLabel(client)}`}
          onClick={() => onEdit(client)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-primary/40 hover:bg-sky-50 hover:text-primary"
        >
          <MdEdit className="text-base" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${clientLabel(client)}`}
          onClick={() => onDelete(client)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <MdDelete className="text-base" />
        </button>
      </div>
    </div>
  );
}

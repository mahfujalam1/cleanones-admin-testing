"use client";

import Link from "next/link";
import {
  MdArrowForward,
  MdDelete,
  MdEdit,
  MdEventAvailable,
  MdMailOutline,
  MdPhone,
} from "react-icons/md";
import { clientLabel, type Client } from "@/redux/api/endpoints/clients.api";

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
        className="flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:ring-slate-300 hover:shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 ring-1 ring-slate-200/70 transition-colors group-hover:bg-sky-50 group-hover:text-primary group-hover:ring-sky-100"
            >
              {initials(client.company_name || clientLabel(client))}
            </span>

            <div className="min-w-0 flex-1 pr-12">
              <h3 className="truncate text-base font-semibold text-slate-900 transition-colors group-hover:text-primary">
                {client.company_name?.trim() || "Individual"}
              </h3>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {clientLabel(client)}
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

        <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <MdArrowForward className="text-sm text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </Link>

      {/* Outside the link so the card itself stays one clickable target. */}
      <div className="absolute right-2.5 top-2.5 flex items-center gap-0.5 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
        <button
          type="button"
          aria-label={`Edit ${clientLabel(client)}`}
          onClick={() => onEdit(client)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-slate-400 ring-1 ring-slate-200 backdrop-blur transition-colors hover:text-slate-800"
        >
          <MdEdit className="text-[15px]" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${clientLabel(client)}`}
          onClick={() => onDelete(client)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-slate-400 ring-1 ring-slate-200 backdrop-blur transition-colors hover:text-red-600"
        >
          <MdDelete className="text-[15px]" />
        </button>
      </div>
    </div>
  );
}

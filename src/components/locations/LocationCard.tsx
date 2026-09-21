"use client";

import {
  MdDeleteOutline,
  MdModeEditOutline,
  MdOutlineLocationOn,
  MdOutlineMeetingRoom,
} from "react-icons/md";
import type { Location } from "@/redux/api/endpoints/locations.api";
import { refDoc } from "@/redux/api/types";
import { clientCompanyLabel, type Client } from "@/redux/api/endpoints/clients.api";

export function LocationCard({
  location,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  location: Location;
  selected?: boolean;

  onSelect?: (location: Location) => void;
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
}) {
  const client = refDoc<Client>(location.client);
  const rooms = location.total_room;

  return (
    <div className="group relative h-full">
      <article
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={() => onSelect?.(location)}
        onKeyDown={(event) => {
          if (onSelect && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onSelect(location);
          }
        }}
        className={`flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 transition-all duration-200 ${
          onSelect
            ? "cursor-pointer hover:-translate-y-0.5 hover:ring-slate-300 hover:shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]"
            : ""
        } ${selected ? "ring-2 ring-primary" : "ring-slate-200/70"}`}
      >
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">

            <span
              aria-hidden
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg text-slate-400 ring-1 ring-slate-200/70 transition-colors group-hover:bg-sky-50 group-hover:text-primary group-hover:ring-sky-100"
            >
              <MdOutlineLocationOn />
            </span>

            <div className="min-w-0 flex-1 pr-12">
              <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-primary">
                {location.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{location.address}</p>
            </div>
          </div>
        </div>

        <footer className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
            <MdOutlineMeetingRoom className="shrink-0 text-sm text-slate-400" />
            {typeof rooms === "number" ? (
              <>
                <span className="font-semibold text-slate-800">{rooms}</span>
                {rooms === 1 ? "room" : "rooms"}
              </>
            ) : (
              <span className="truncate text-slate-400">{client ? clientCompanyLabel(client) : "—"}</span>
            )}
          </span>
        </footer>
      </article>

      {(onEdit || onDelete) && (
        <div className="absolute right-2.5 top-2.5 flex items-center gap-0.5 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
          {onEdit && (
            <button
              type="button"
              aria-label={`Edit ${location.name}`}
              onClick={() => onEdit(location)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-slate-400 ring-1 ring-slate-200 backdrop-blur transition-colors hover:text-slate-800"
            >
              <MdModeEditOutline className="text-[15px]" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label={`Deactivate ${location.name}`}
              onClick={() => onDelete(location)}
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

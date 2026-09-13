"use client";

import { MdChecklist, MdDelete, MdEdit, MdOutlineMeetingRoom } from "react-icons/md";
import { roomTaskCount, type Room } from "@/redux/api/endpoints/rooms.api";
import { refDoc } from "@/redux/api/types";

export function RoomCard({
  room,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  room: Room;
  selected?: boolean;
  /** When given, the card drills into the room's tasks. */
  onSelect?: (room: Room) => void;
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
}) {
  return (
    <div className="group relative">
      <div
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onClick={() => onSelect?.(room)}
        onKeyDown={(event) => {
          if (onSelect && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onSelect(room);
          }
        }}
        className={`flex h-full flex-col rounded-xl border bg-white p-4 shadow-2xs transition-all duration-200 ${
          onSelect ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""
        } ${selected ? "border-primary ring-2 ring-primary/20" : "border-slate-200 hover:border-primary/40"}`}
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-lg text-slate-400 ring-1 ring-slate-200/70 transition-colors group-hover:bg-sky-50 group-hover:text-primary group-hover:ring-sky-100"
          >
            <MdOutlineMeetingRoom />
          </span>
          <div className="min-w-0 flex-1 pr-16">
            <h3 className="truncate text-[15px] font-bold leading-tight text-slate-900">{room.name}</h3>
            <p className="mt-1 truncate text-xs capitalize text-slate-500">{room.room_type}</p>
            {refDoc(room.location)?.name && <p className="mt-2 truncate text-xs text-primary">{refDoc(room.location)?.name}</p>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
          {room.cleaning_type && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {room.cleaning_type}
            </span>
          )}
          {roomTaskCount(room) !== null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
              <MdChecklist className="text-xs" />
              {roomTaskCount(room)} {roomTaskCount(room) === 1 ? "task" : "tasks"}
            </span>
          )}
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
              room.is_active
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-slate-100 text-slate-500 ring-slate-200"
            }`}
          >
            {room.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="absolute right-3 top-3 flex items-center gap-1 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
          {onEdit && (
            <button
              type="button"
              aria-label={`Edit ${room.name}`}
              onClick={() => onEdit(room)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-primary/40 hover:bg-sky-50 hover:text-primary"
            >
              <MdEdit className="text-base" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label={`Deactivate ${room.name}`}
              onClick={() => onDelete(room)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <MdDelete className="text-base" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

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
  
  onSelect?: (room: Room) => void;
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
}) {
  return (
    <div className="group relative h-full">
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
              <MdOutlineMeetingRoom />
            </span>
            <div className="min-w-0 flex-1 pr-12">
              <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-primary">
                {room.name}
              </h3>
              <p className="mt-1 truncate text-xs capitalize text-slate-500">{room.room_type}</p>
              {refDoc(room.location)?.name && (
                <p className="mt-1 truncate text-xs text-slate-400">{refDoc(room.location)?.name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
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
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="absolute right-2.5 top-2.5 flex items-center gap-0.5 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
          {onEdit && (
            <button
              type="button"
              aria-label={`Edit ${room.name}`}
              onClick={() => onEdit(room)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-slate-400 ring-1 ring-slate-200 backdrop-blur transition-colors hover:text-slate-800"
            >
              <MdEdit className="text-[15px]" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label={`Delete ${room.name}`}
              onClick={() => onDelete(room)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-slate-400 ring-1 ring-slate-200 backdrop-blur transition-colors hover:text-red-600"
            >
              <MdDelete className="text-[15px]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

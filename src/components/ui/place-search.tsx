"use client";

import { useEffect, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { ChevronDown, Search } from "lucide-react";
import { searchPlaces, type Place } from "@/lib/geonames";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function PlaceSearchSelect({
  value,
  onValueChange,
  placeholder = "Search a city or town…",
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const term = useDebouncedValue(query, 350);
  const configured = Boolean(process.env.NEXT_PUBLIC_GEONAMES_USERNAME);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);

    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open || term.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    void searchPlaces(term, controller.signal).then((places) => {
      if (controller.signal.aborted) return;
      setResults(places);
      setSearching(false);
    });

    return () => controller.abort();
  }, [open, term]);

  const pick = (label: string) => {
    onValueChange(label);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <Popover.Trigger
        disabled={disabled}
        className="flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm outline-none transition-colors hover:border-slate-400 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className={`truncate ${value ? "text-slate-900" : "text-slate-400"}`}>
          {value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={4} className="z-[120] w-[var(--anchor-width)]">
          <Popover.Popup className="w-full rounded-lg border border-slate-200 bg-white shadow-xl outline-none">
            <div className="relative border-b border-slate-100 p-2">
              <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {

                  if (event.key === "Enter") {
                    event.preventDefault();
                    pick(results[0]?.label ?? query.trim());
                  }
                }}
                placeholder="Search a place…"
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="max-h-56 overflow-y-auto p-1">
              {!configured ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">
                  Place search needs a GeoNames username.
                </p>
              ) : query.trim().length < 2 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">Type at least two letters</p>
              ) : searching ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">Searching…</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">No place found</p>
              ) : (
                results.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => pick(place.label)}
                    className="block w-full cursor-pointer rounded px-2.5 py-2 text-left transition-colors hover:bg-sky-50"
                  >
                    <span className="block truncate text-sm text-slate-800">{place.name}</span>
                    <span className="block truncate text-xs text-slate-400">{place.label}</span>
                  </button>
                ))
              )}
            </div>

            {value && (
              <div className="border-t border-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => pick("")}
                  className="w-full cursor-pointer rounded px-2.5 py-1.5 text-left text-xs text-slate-400 transition-colors hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

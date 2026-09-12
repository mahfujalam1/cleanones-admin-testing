"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { countries } from "@/lib/countries";

/**
 * Searchable country picker. The selected value is the country name itself, since that is
 * what gets stored on the record rather than a code.
 */
export function CountrySelect({
  value,
  onValueChange,
  placeholder = "Select country",
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      // Let the popup mount before stealing focus, so typing starts in the search box.
      const frame = requestAnimationFrame(() => searchRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
  }, [open]);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return countries;
    // Names starting with the term are the likelier intent, so float those to the top.
    const starts = countries.filter((country) => country.toLowerCase().startsWith(term));
    const contains = countries.filter((country) => !country.toLowerCase().startsWith(term) && country.toLowerCase().includes(term));
    return [...starts, ...contains];
  }, [query]);

  return (
    <Popover.Root open={open} onOpenChange={(next) => { if (!disabled) setOpen(next); }}>
      <Popover.Trigger
        disabled={disabled}
        className="flex h-10 w-full items-center justify-between gap-2 rounded border border-gray-300 bg-white px-3 text-left text-sm outline-none transition hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
      >
        <span className={`truncate ${value ? "text-gray-900" : "text-gray-400"}`}>{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={4} className="z-[120] min-w-[var(--anchor-width)]">
          <Popover.Popup className="w-[var(--anchor-width)] rounded border border-gray-200 bg-white shadow-lg outline-none">
            <div className="relative border-b border-gray-100 p-2">
              <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search country..."
                className="h-9 w-full rounded border border-gray-200 bg-white pl-8 pr-3 text-sm outline-none focus:border-sky-500"
              />
            </div>
            <div className="max-h-56 overflow-y-auto p-1">
              {matches.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-gray-400">No country found</p>
              ) : (
                matches.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => { onValueChange(country); setOpen(false); }}
                    className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors hover:bg-sky-50 hover:text-sky-700 ${country === value ? "font-semibold text-sky-700" : "text-gray-700"}`}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center">
                      {country === value && <Check className="h-4 w-4 text-sky-500" />}
                    </span>
                    <span className="truncate">{country}</span>
                  </button>
                ))
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

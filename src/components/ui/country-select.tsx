"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { loadCountries } from "@/lib/geonames";

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
  const [countries, setCountries] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    void loadCountries().then((names) => {
      if (active) setCountries(names);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");

    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return countries;

    const starts = countries.filter((country) => country.toLowerCase().startsWith(term));
    const contains = countries.filter(
      (country) => !country.toLowerCase().startsWith(term) && country.toLowerCase().includes(term),
    );
    return [...starts, ...contains];
  }, [countries, query]);

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
                placeholder="Search country…"
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="max-h-56 overflow-y-auto p-1">
              {countries.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">Loading countries…</p>
              ) : matches.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">No country found</p>
              ) : (
                matches.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => {
                      onValueChange(country);
                      setOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-left text-sm transition-colors hover:bg-sky-50 ${
                      country === value ? "font-medium text-primary" : "text-slate-700"
                    }`}
                  >

                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {country === value && <Check className="h-4 w-4 text-primary" />}
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

"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import {
  clientCompanyLabel,
  clientLabel,
  useGetClientQuery,
  useGetClientsQuery,
  type Client,
} from "@/redux/api/endpoints/clients.api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { FieldLabel } from "@/components/shared/Field";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

export interface ClientSearchSelectProps {
  value: string;
  onChange: (clientId: string) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  showCompanyName?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
  isCompanyAdmin?: boolean;
}

export function ClientSearchSelect({
  value,
  onChange,
  label,
  placeholder,
  searchPlaceholder,
  required = false,
  disabled = false,
  showCompanyName = true,
  showAllOption = false,
  allOptionLabel,
  className,
  isCompanyAdmin,
}: ClientSearchSelectProps) {
  const id = useId();
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Note: sort is intentionally omitted to avoid sending sort query parameter
  const { data, isFetching } = useGetClientsQuery({
    limit: 100,
    searchTerm: debouncedQuery || undefined,
    isCompanyAdmin,
  });

  const clients = data?.result ?? [];

  // If a client is selected, ensure we can show their name even if not in the current search query
  const hasSelectedInList = Boolean(value && clients.some((c) => c._id === value));
  const { data: singleClient } = useGetClientQuery(
    { id: value, isCompanyAdmin },
    { skip: !value || hasSelectedInList }
  );

  const selectedClient = useMemo(() => {
    if (!value) return null;
    return clients.find((c) => c._id === value) || singleClient || null;
  }, [value, clients, singleClient]);

  const labelOf = showCompanyName ? clientCompanyLabel : clientLabel;

  const displayLabel = useMemo(() => {
    if (!value) {
      if (showAllOption) {
        return allOptionLabel || t.common?.allClients || "All Clients";
      }
      return "";
    }
    if (selectedClient) {
      return labelOf(selectedClient);
    }
    return value;
  }, [value, showAllOption, allOptionLabel, t.common?.allClients, selectedClient, labelOf]);

  // Focus search input when popover opens
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Local instant filtering for fast responsive typing
  const filteredClients = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((c) => {
      const company = (c.company_name || "").toLowerCase();
      const name = (c.name || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      return company.includes(term) || name.includes(term) || email.includes(term);
    });
  }, [clients, query]);

  const defaultSearchPlaceholder = t.clients?.searchPlaceholder || "Search clients...";
  const defaultPlaceholder = showAllOption
    ? allOptionLabel || t.common?.allClients || "All Clients"
    : placeholder || "Select a client";

  const control = (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <Popover.Trigger
        id={id}
        disabled={disabled}
        className={`flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm font-medium outline-none transition-colors hover:border-slate-400 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${className ?? ""}`}
      >
        <span className={`truncate ${value || (showAllOption && !value) ? "text-slate-900" : "text-slate-400"}`}>
          {displayLabel || defaultPlaceholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="start"
          sideOffset={4}
          className="z-[120] w-[var(--anchor-width)] min-w-[260px] outline-none"
        >
          <Popover.Popup className="w-full rounded-lg border border-slate-200 bg-white shadow-xl outline-none">
            <div className="relative border-b border-slate-100 p-2">
              <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder || defaultSearchPlaceholder}
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-8 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto p-1">
              {showAllOption && !query && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-left text-sm transition-colors hover:bg-sky-50 ${
                    !value ? "bg-sky-50/60 font-medium text-primary" : "text-slate-700"
                  }`}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {!value && <Check className="h-4 w-4 text-primary" />}
                  </span>
                  <span className="truncate">{allOptionLabel || t.common?.allClients || "All Clients"}</span>
                </button>
              )}

              {isFetching && clients.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">Loading clients…</p>
              ) : filteredClients.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-slate-400">
                  {t.clients?.noClientsFound || "No clients found"}
                </p>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = client._id === value;
                  const company = client.company_name?.trim();
                  const contact = client.name?.trim();

                  return (
                    <button
                      key={client._id}
                      type="button"
                      onClick={() => {
                        onChange(client._id);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-left text-sm transition-colors hover:bg-sky-50 ${
                        isSelected ? "bg-sky-50/60 font-medium text-primary" : "text-slate-700"
                      }`}
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-900">
                          {labelOf(client)}
                        </div>
                        {showCompanyName && company && contact && company !== contact && (
                          <div className="truncate text-xs text-slate-400">
                            {contact} {client.email ? `• ${client.email}` : ""}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );

  if (!label) {
    return control;
  }

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />
      {control}
    </div>
  );
}

"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export function Select({ value, onValueChange, options, placeholder = "Select an option", disabled = false, required = false }: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return <BaseSelect.Root value={value || null} onValueChange={(next) => onValueChange(next ?? "")} items={options} disabled={disabled} required={required}>
    <BaseSelect.Trigger className="flex h-10 w-full items-center justify-between rounded border border-gray-300 bg-white px-3 text-left text-sm text-gray-800 outline-none transition hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400">
      <BaseSelect.Value placeholder={placeholder} />
      <BaseSelect.Icon><ChevronDown className="h-4 w-4 text-gray-400" /></BaseSelect.Icon>
    </BaseSelect.Trigger>
    <BaseSelect.Portal>
      <BaseSelect.Positioner side="bottom" align="start" sideOffset={4} className="z-[100] outline-none min-w-[var(--anchor-width)]">
        <BaseSelect.Popup className="max-h-64 w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded border border-gray-200 bg-white p-1 shadow-lg outline-none">
          {options.map((option) => <BaseSelect.Item key={option.value} value={option.value} disabled={option.disabled} className="flex cursor-default items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-sky-50 data-[highlighted]:text-sky-700 data-[disabled]:opacity-40">
            <BaseSelect.ItemIndicator className="flex h-4 w-4 items-center"><Check className="h-4 w-4 text-sky-500" /></BaseSelect.ItemIndicator>
            <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
          </BaseSelect.Item>)}
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  </BaseSelect.Root>;
}

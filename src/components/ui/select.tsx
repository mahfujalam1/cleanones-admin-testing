"use client";

import { useRef } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  className,
  scrollToValue,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  /** When the list opens with no selection, scroll this option into view. */
  scrollToValue?: string;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  const scrollToOption = (open: boolean) => {
    if (!open) return;
    const target = value || scrollToValue;
    if (!target) return;
    popupRef.current
      ?.querySelector<HTMLElement>(`[data-slot-value="${CSS.escape(target)}"]`)
      ?.scrollIntoView({ block: "center" });
  };

  return (
    <BaseSelect.Root
      value={value || null}
      onValueChange={(next) => onValueChange(next ?? "")}
      items={options}
      disabled={disabled}
      required={required}
      onOpenChangeComplete={scrollToOption}
    >
      <BaseSelect.Trigger className={`flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 text-left text-sm font-medium text-slate-900 outline-none transition-colors hover:border-slate-400 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${className ?? ""}`}>
        <BaseSelect.Value placeholder={placeholder} className="truncate data-[placeholder]:text-slate-400" />
        <BaseSelect.Icon>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner
          side="bottom"
          align="start"
          sideOffset={4}
          // Base UI defaults to overlapping the trigger so the chosen item's text lands on the
          // trigger's, the way a native macOS menu behaves. Here the list should simply drop
          // below the field and line up with its edges, so that behaviour is turned off.
          alignItemWithTrigger={false}
          className="z-[120] w-[var(--anchor-width)] outline-none"
        >
          <BaseSelect.Popup
            ref={popupRef}
            className="max-h-64 w-full origin-[var(--transform-origin)] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl outline-none"
          >
            {options.map((option) => (
              <BaseSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                data-slot-value={option.value}
                className="flex cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-sm font-medium text-slate-700 outline-none transition-colors data-[highlighted]:bg-sky-50 data-[highlighted]:text-primary data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
              >
                {/* The wrapper always occupies the tick's width; the indicator inside only
                    renders when selected. Without it, unselected labels shift left. */}
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  <BaseSelect.ItemIndicator>
                    <Check className="h-4 w-4 text-primary" />
                  </BaseSelect.ItemIndicator>
                </span>
                <BaseSelect.ItemText className="truncate">{option.label}</BaseSelect.ItemText>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

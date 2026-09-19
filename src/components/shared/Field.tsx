"use client";

import React, { useId, useState } from "react";
import { TbEye, TbEyeOff } from "react-icons/tb";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";

/** Shared control styling, exported so bespoke inputs (address search) can match the rest. */
export const CONTROL_CLASS =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400";

export function FieldLabel({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "password" | "number";
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function TextField({ label, value, onChange, type = "text", placeholder, ...rest }: TextFieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={rest.required} />
      <div className="relative">
        <input
          id={id}
          // A revealed password is a plain text box; the field keeps its own toggle state so one
          // password showing never unmasks the confirmation next to it.
          type={isPassword && revealed ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
          className={isPassword ? `${CONTROL_CLASS} pr-10` : CONTROL_CLASS}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((shown) => !shown)}
            aria-label={revealed ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={revealed}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            {revealed ? <TbEyeOff className="text-base" /> : <TbEye className="text-base" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function DateField({
  label,
  value,
  onChange,
  required,
  placeholder = "Select date",
  min,
  max,
}: {
  label: string;
  /** `YYYY-MM-DD`, the same shape a native date input uses. */
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
}) {
  const id = useId();
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <DatePicker value={value} onValueChange={onChange} placeholder={placeholder} clearable min={min} max={max} />
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  required,
  disabled,
  placeholder,
  scrollToValue,
}: {
  label: string;
  value: T | "";
  /** Either bare values (shown as-is) or `{ value, label }` pairs. */
  options: ReadonlyArray<T | { value: T; label: string; disabled?: boolean }>;
  onChange: (value: T) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  scrollToValue?: string;
}) {
  const id = useId();
  const items = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <Select
        value={value}
        options={items}
        required={required}
        disabled={disabled}
        placeholder={placeholder ?? `Select ${label.toLowerCase()}`}
        onValueChange={(next) => onChange(next as T)}
        scrollToValue={scrollToValue}
      />
    </div>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  required,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  const id = useId();
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <textarea
        id={id}
        value={value}
        rows={rows}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        // Height comes from `rows`, so the shared fixed height is dropped here.
        className={`${CONTROL_CLASS} h-auto resize-y py-2 leading-relaxed`}
      />
    </div>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 accent-primary"
      />
      {label}
    </label>
  );
}

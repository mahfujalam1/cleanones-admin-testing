import React from "react";

/**
 * The one button in the app.
 *
 * The press feedback is deliberate: a short scale-down on `:active` plus a shadow that softens
 * as it goes reads as the surface being pushed rather than a colour swapping. Everything
 * transitions on the same curve so a row of buttons reacts as one control set.
 */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const BASE =
  "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-sm shadow-primary/25 hover:bg-[#0284c7] hover:shadow-primary/35 active:shadow-none",
  secondary:
    "bg-white text-slate-700 ring-1 ring-slate-200 shadow-sm shadow-slate-900/5 hover:bg-slate-50 hover:ring-slate-300 active:shadow-none",
  ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "bg-red-600 text-white shadow-sm shadow-red-600/25 hover:bg-red-700 hover:shadow-red-600/35 active:shadow-none",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
  icon: "h-9 w-9 p-0",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;

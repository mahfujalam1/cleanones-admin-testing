import React from "react";

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "default" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
}

export function Button({
    children,
    className = "",
    variant = "default",
    size = "md",
    ...props
}: ButtonProps) {
    const variantClasses = {
        default: "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,.14),var(--shadow-xs)] hover:bg-[#3655d4]",
        ghost: "bg-transparent text-foreground hover:bg-muted/70",
        outline: "border border-border bg-white text-foreground shadow-[var(--shadow-xs)] hover:bg-muted/60",
    };
    const sizeClasses = {
        sm: "h-8 px-3 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "h-11 px-5 text-base",
    };

    return (
        <button
            className={`inline-flex items-center justify-center rounded-md font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;

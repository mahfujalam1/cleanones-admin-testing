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
        default: "border border-primary bg-primary text-primary-foreground hover:bg-[#008bc7]",
        ghost: "bg-transparent text-foreground hover:bg-muted/70",
        outline: "border border-border bg-white text-foreground hover:bg-muted/60",
    };
    const sizeClasses = {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-4 text-sm",
    };

    return (
        <button
            className={`inline-flex items-center justify-center rounded font-medium transition-colors duration-150 ease-[var(--ease-out)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;

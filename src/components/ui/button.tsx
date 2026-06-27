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
        default: "",
        ghost: "bg-transparent hover:bg-gray-100",
        outline: "border border-gray-300 bg-white hover:bg-gray-50",
    };
    const sizeClasses = {
        sm: "h-8 px-3 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "h-11 px-5 text-base",
    };

    return (
        <button
            className={`inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;

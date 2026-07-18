import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

export function Input({ className = "", icon, ...props }: InputProps) {
    return (
        <div className="relative flex items-center">
            {icon && (
                <div className="absolute left-3 text-gray-400 pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                className={`flex h-9 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${icon ? "pl-10" : ""} ${className}`}
                {...props}
            />
        </div>
    );
}

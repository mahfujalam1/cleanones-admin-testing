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
                className={`flex h-9 w-full rounded border border-border bg-white px-3 py-2 text-sm text-foreground transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none ${icon ? "pl-9" : ""} ${className}`}
                {...props}
            />
        </div>
    );
}

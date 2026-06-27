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
                className={`flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0ea5e9] focus-visible:border-[#0ea5e9] ${icon ? "pl-10" : ""} ${className}`}
                {...props}
            />
        </div>
    );
}

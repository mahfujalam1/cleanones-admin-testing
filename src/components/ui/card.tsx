import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({
    children,
    className = "",
    ...props
}: CardProps) {
    return (
        <div
            className={`bg-white rounded-lg border border-gray-200 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardContent({
    children,
    className = "",
    ...props
}: CardProps) {
    return (
        <div className={className} {...props}>
            {children}
        </div>
    );
}
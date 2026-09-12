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
            className={`dashboard-card text-card-foreground ${className}`}
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

import { ReviewStatus } from "./types";


interface StatusBadgeProps {
    status: ReviewStatus;
    className?: string;
}

const STATUS_CONFIG: Record<ReviewStatus, { dot: string; text: string }> = {
    "Pending Review": { dot: "bg-amber-400", text: "text-amber-500" },
    Approved: { dot: "bg-emerald-400", text: "text-emerald-500" },
    Rejected: { dot: "bg-red-400", text: "text-red-500" },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const { dot, text } = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${text} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
            {status}
        </span>
    );
}
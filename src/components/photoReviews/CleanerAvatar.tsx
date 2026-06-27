interface CleanerAvatarProps {
    name: string;
    initials: string;
    avatarColor: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const SIZE_MAP = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
};

export function CleanerAvatar({
    name,
    initials,
    avatarColor,
    size = "sm",
    className = "",
}: CleanerAvatarProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span
                className={`rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${SIZE_MAP[size]}`}
                style={{ backgroundColor: avatarColor }}
            >
                {initials}
            </span>
            <span className="text-sm font-medium text-gray-800 truncate">{name}</span>
        </div>
    );
}
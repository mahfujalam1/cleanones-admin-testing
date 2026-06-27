interface AIScoreBarProps {
    score: number;
    confidence: number;
    className?: string;
}

interface ScoreBarProps {
    label: string;
    value: number;
}

function getBarColor(value: number): string {
    if (value >= 80) return "bg-emerald-500";
    if (value >= 60) return "bg-amber-400";
    return "bg-red-500";
}

export function AIScoreBar({ score, confidence, className = "" }: AIScoreBarProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`} title={`AI Score: ${score}% | Confidence: ${confidence}%`}>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${getBarColor(confidence)}`}
                    style={{ width: `${confidence}%` }}
                />
            </div>
        </div>
    );
}

const SCORE_ROWS: { key: keyof Pick<ScoreBarProps, never>; label: string }[] = [];

export function ScoreBar({ label, value }: ScoreBarProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-36 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-6 text-right">{value}</span>
        </div>
    );
}
"use client";

import { X, Info, Check } from "lucide-react"; 
import { CleanerAvatar } from "./CleanerAvatar";
import { PhotoReview } from "./types";
import { ScoreBar } from "./Aiscorebar";

interface ReviewDetailProps {
    review: PhotoReview;
    onClose: () => void;
    onApprove: (review: PhotoReview) => void;
    onReject: (review: PhotoReview) => void;
}

const SCORE_ROWS = [
    { label: "Quality Score", key: "qualityScore" as const },
    { label: "Coverage Score", key: "coverageScore" as const },
    { label: "Image Quality Score", key: "imageQualityScore" as const },
    { label: "Brightness Score", key: "brightnessScore" as const },
];

const PHOTOS = [
    { key: "beforeImage" as const, label: "Before Cleaning" },
    { key: "afterImage" as const, label: "After Cleaning" },
];

const SUGGESTION_COLOR: Record<string, string> = {
    Approve: "text-emerald-500",
    Reject: "text-red-500",
    Review: "text-amber-500",
};

export function ReviewDetail({ review, onClose, onApprove, onReject }: ReviewDetailProps) {
    const ai = review.aiAnalysis;

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-hidden">
            {/* Top bar */}
            <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3 shrink-0">
                <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-3 py-1.5 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                    Close
                </button>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900 truncate">
                        {review.id} — {review.room}
                    </h2>
                    <p className="text-xs text-gray-400 truncate">
                        {review.client} · {review.location}
                        {review.shiftId && ` · Shift ${review.shiftId}`}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-amber-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {review.status}
                    </span>
                    <span className="hidden sm:block text-xs text-gray-400">{review.dateSubmitted}</span>
                </div>
            </header>

            {/* Body */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left panel */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    {/* Section A — Photo Comparison */}
                    <div className="bg-white rounded shadow-sm p-4 space-y-3">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Section A</p>
                            <h3 className="text-sm font-semibold text-gray-800">Photo Comparison</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {PHOTOS.map(({ key, label }) => (
                                <div key={key}>
                                    {review[key] ? (
                                        <img
                                            src={review[key] as string}
                                            alt={label}
                                            className="w-full h-44 sm:h-56 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-full h-44 sm:h-56 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                                            No image
                                        </div>
                                    )}
                                    <p className="text-center text-xs text-gray-400 mt-1.5">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section C — Service Quality Verification */}
                    <div className="bg-white rounded shadow-sm p-4 space-y-3">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Section C</p>
                            <h3 className="text-sm font-semibold text-gray-800">Service Quality Verification</h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Review the photos and AI analysis, then verify the service quality below.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                onClick={() => onApprove(review)}
                                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2.5 rounded transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                Approve Review
                            </button>
                            <button
                                onClick={() => onReject(review)}
                                className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium py-2.5 rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Reject Review
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right panel — AI Analysis */}
                {ai && (
                    <aside className="w-full lg:w-72 xl:w-80 bg-white shadow-sm overflow-y-auto p-5 space-y-4 shrink-0 lg:border-l border-gray-100">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Section B</p>
                            <div className="flex items-center gap-1">
                                <h3 className="text-sm font-semibold text-gray-800">AI Analysis</h3>
                                <Info className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                        </div>

                        {/* Overall score */}
                        <div className="bg-blue-50 rounded p-4 text-center">
                            <p className="text-4xl font-bold text-blue-600">{ai.overallScore}</p>
                            <p className="text-xs text-gray-500 mt-1">Overall Quality Score</p>
                            <p className={`text-xs font-semibold mt-1 ${SUGGESTION_COLOR[ai.suggestion] ?? "text-gray-500"}`}>
                                AI suggests: {ai.suggestion}
                            </p>
                        </div>

                        {/* Score breakdown */}
                        <div className="space-y-2.5">
                            {SCORE_ROWS.map(({ label, key }) => (
                                <ScoreBar key={key} label={label} value={ai[key]} />
                            ))}
                        </div>

                        {/* AI notes */}
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-gray-700">AI Notes</p>
                            <ul className="space-y-1">
                                {ai.notes.map((note, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                                        <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                                        &ldquo;{note}&rdquo;
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Submitted by */}
                        <div className="pt-2">
                            <CleanerAvatar
                                name={review.cleaner.name}
                                initials={review.cleaner.initials}
                                avatarColor={review.cleaner.avatarColor}
                            />
                            <p className="text-xs text-gray-400 mt-0.5 ml-9">{review.dateSubmitted}</p>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}

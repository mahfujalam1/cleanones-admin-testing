"use client";

import React from "react";
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

const SUGGESTION_COLOR: Record<string, string> = {
    Approve: "text-emerald-500",
    Reject: "text-red-500",
    Review: "text-amber-500",
};

export function ReviewDetail({ review, onClose, onApprove, onReject }: ReviewDetailProps) {
    const ai = review.aiAnalysis;

    const displayPhotos = review.photos && review.photos.length > 0
        ? review.photos
        : [
            { label: "Before Cleaning", url: review.beforeImage || null },
            { label: "After Cleaning", url: review.afterImage || null }
        ];

    const isApproved = review.status === "Approved";
    const isRejected = review.status === "Rejected";
    const isProcessed = isApproved || isRejected;

    const STATUS_BADGE_STYLE: Record<string, { bg: string; dot: string }> = {
        "Pending Review": { bg: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
        Approved: { bg: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
        Rejected: { bg: "text-red-700 bg-red-50 border-red-200", dot: "bg-red-500" },
    };

    const statusStyle = STATUS_BADGE_STYLE[review.status] ?? STATUS_BADGE_STYLE["Pending Review"];

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Top bar */}
            <header className="bg-white shadow-sm px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3 shrink-0">
                <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded px-3 py-1.5 transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                    Close
                </button>
                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-gray-900 truncate">
                        {review.id} — {review.room}
                    </h2>
                    <p className="text-xs text-gray-500 truncate">
                        {review.client} · {review.location}
                        {review.shiftId && ` · Shift ${review.shiftId}`}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusStyle.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
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
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">Section A</p>
                            <h3 className="text-base font-bold text-gray-900">Photo Comparison</h3>
                        </div>
                        <div className={`grid gap-4 ${displayPhotos.length === 1 ? "grid-cols-1 max-w-lg mx-auto" : "grid-cols-1 sm:grid-cols-2"}`}>
                            {displayPhotos.map((photo, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    {photo.url ? (
                                        <img
                                            src={photo.url}
                                            alt={photo.label}
                                            className="w-full h-52 sm:h-64 object-cover rounded-lg border border-gray-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-full h-52 sm:h-64 bg-slate-50 rounded-lg border border-gray-200 border-dashed flex flex-col items-center justify-center text-slate-400 text-xs">
                                            <span>No image uploaded</span>
                                        </div>
                                    )}
                                    <p className="text-center text-xs font-bold text-slate-700 mt-2 bg-slate-100 px-3 py-1 rounded-full">{photo.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section C — Service Quality Verification */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">Section C</p>
                            <h3 className="text-base font-bold text-gray-900">Service Quality Verification</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {isApproved
                                    ? "This review has been approved. No further action can be taken."
                                    : isRejected
                                    ? "This review has been rejected. No further action can be taken."
                                    : "Review the photos and AI analysis, then verify the service quality below."}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                disabled={isProcessed}
                                onClick={() => onApprove(review)}
                                className={`flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-sm ${
                                    isApproved
                                        ? "bg-emerald-600/70 text-white cursor-not-allowed opacity-80"
                                        : isRejected
                                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                        : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                }`}
                            >
                                <Check className="w-4 h-4" />
                                {isApproved ? "Approved" : "Approve Review"}
                            </button>
                            <button
                                disabled={isProcessed}
                                onClick={() => onReject(review)}
                                className={`flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-colors ${
                                    isRejected
                                        ? "bg-red-600/70 text-white cursor-not-allowed opacity-80"
                                        : isApproved
                                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                        : "bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 cursor-pointer"
                                }`}
                            >
                                <X className="w-4 h-4" />
                                {isRejected ? "Rejected" : "Reject Review"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right panel — AI Analysis */}
                {ai && (
                    <aside className="w-full lg:w-80 xl:w-96 bg-white shadow-sm overflow-y-auto p-5 space-y-5 shrink-0 lg:border-l border-gray-200">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">Section B</p>
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-base font-bold text-gray-900">AI Analysis</h3>
                                <Info className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Overall score */}
                        <div className="bg-sky-50/70 border border-sky-100 rounded-lg p-5 text-center">
                            <p className="text-4xl font-extrabold text-[#0ea5e9]">{ai.overallScore}%</p>
                            <p className="text-xs font-semibold text-slate-600 mt-1">Overall Quality Score</p>
                            <p className={`text-xs font-bold mt-2 ${SUGGESTION_COLOR[ai.suggestion] ?? "text-gray-600"}`}>
                                AI suggests: {ai.suggestion}
                            </p>
                        </div>

                        {/* Score breakdown */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Score Breakdown</h4>
                            {ai.breakdown && ai.breakdown.length > 0 ? (
                                ai.breakdown.map((item, idx) => (
                                    <ScoreBar key={idx} label={item.label} value={item.score} />
                                ))
                            ) : (
                                SCORE_ROWS.map(({ label, key }) => (
                                    <ScoreBar key={key} label={label} value={ai[key]} />
                                ))
                            )}
                        </div>

                        {/* AI notes */}
                        {ai.notes && ai.notes.length > 0 && (
                            <div className="space-y-2 border-t border-gray-100 pt-3">
                                <p className="text-xs font-bold text-slate-700">AI Notes</p>
                                <ul className="space-y-1.5">
                                    {ai.notes.map((note, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                                            &ldquo;{note}&rdquo;
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Submitted by */}
                        <div className="pt-3 border-t border-gray-100">
                            <CleanerAvatar
                                name={review.cleaner.name}
                                initials={review.cleaner.initials}
                                avatarColor={review.cleaner.avatarColor}
                            />
                            <p className="text-[11px] text-gray-400 mt-1 ml-9">{review.dateSubmitted}</p>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}

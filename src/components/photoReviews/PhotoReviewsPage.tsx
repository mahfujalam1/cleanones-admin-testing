"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CleanerAvatar } from "./CleanerAvatar";
import { ApproveModal } from "./ApproveModal";
import { RejectModal } from "./RejectModal";
import { ReviewDetail } from "./ReviewDetail";
import { ApproveFormData, PhotoReview, RejectFormData, ReviewStatus } from "./types";
import { AIScoreBar } from "./Aiscorebar";
import { approvePhotoReview, getPhotoReview, getPhotoReviews, rejectPhotoReview, type PhotoReviewApi } from "@/services/actions/photoReviews";
import { TableSkeleton } from "@/components/shared/SkeletonLoader";

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const FILTER_TABS: { label: string; value: ReviewStatus | "All" }[] = [
    { label: "All", value: "All" },
    { label: "Pending Review", value: "Pending Review" },
    { label: "Approved", value: "Approved" },
    { label: "Rejected", value: "Rejected" },
];

const TABLE_HEADERS = [
    "Review ID",
    "Cleaner",
    "Client",
    "Location",
    "Room",
    "Date Submitted",
    "AI Score",
    "AI Confidence",
    "Status",
    "Actions",
];

// ── Component ────────────────────────────────────────────────────────────────

import { useGetPhotoReviewsQuery } from "@/redux/api/photoReviewsApi";

export function PhotoReviewsPage() {
    const [activeFilter, setActiveFilter] = useState<ReviewStatus | "All">("All");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selectedReview, setSelectedReview] = useState<PhotoReview | null>(null);
    const [approveReview, setApproveReview] = useState<PhotoReview | null>(null);
    const [rejectReview, setRejectReview] = useState<PhotoReview | null>(null);
    const [error, setError] = useState("");

    const status = activeFilter === "All" ? undefined : activeFilter.toLowerCase().replaceAll(" ", "_");
    const { data: reviewsRes, isLoading: loading, refetch } = useGetPhotoReviewsQuery({
        search: search.trim() || undefined,
        status,
        page,
        limit: PAGE_SIZE,
    });

    const rawReviews = reviewsRes?.reviews ?? [];
    const pendingCount = reviewsRes?.pending_reviews_count ?? 0;
    const reviews: PhotoReview[] = rawReviews.map(mapReview);

    // ── Filtering & Pagination ──────────────────────────────────────────────

    const filtered = useMemo(() => {
        return reviews.filter((r) => {
            const matchStatus = activeFilter === "All" || r.status === activeFilter;
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                r.id.toLowerCase().includes(q) ||
                r.cleaner.name.toLowerCase().includes(q) ||
                r.location.toLowerCase().includes(q) ||
                r.room.toLowerCase().includes(q);
            return matchStatus && matchSearch;
        });
    }, [reviews, activeFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleFilterChange = (value: ReviewStatus | "All") => {
        setActiveFilter(value);
        setPage(1);
    };

    const handleSearch = (q: string) => {
        setSearch(q);
        setPage(1);
    };

    // ── Actions ─────────────────────────────────────────────────────────────

    const handleApproveConfirm = async (_data: ApproveFormData) => {
        if (!approveReview) return;
        const result = await approvePhotoReview(approveReview.id);
        if (!result.success) {
            setError(result.error);
            return;
        }
        setApproveReview(null);
        void refetch();
    };

    const handleRejectConfirm = async (data: RejectFormData) => {
        if (!rejectReview) return;
        const result = await rejectPhotoReview(rejectReview.id, data.managerComment || data.reason);
        if (!result.success) {
            setError(result.error);
            return;
        }
        setRejectReview(null);
        void refetch();
    };

    const openReview = async (review: PhotoReview) => {
        const result = await getPhotoReview(review.id);
        if (!result.success) return setError(result.error);
        setSelectedReview(mapReview(result.data));
    };

    // ── Review Detail view ───────────────────────────────────────────────────

    if (selectedReview) {
        // The list endpoint can return a lightweight review without its photo URLs.
        // Keep the full detail response selected above and only sync fields that can
        // change locally after an approve/reject action.
        const listReview = reviews.find((r) => r.id === selectedReview.id);
        const liveReview = listReview
            ? { ...selectedReview, status: listReview.status }
            : selectedReview;
        return (
            <>
                <ReviewDetail
                    review={liveReview}
                    onClose={() => setSelectedReview(null)}
                    onApprove={(r) => setApproveReview(r)}
                    onReject={(r) => setRejectReview(r)}
                />
                <ApproveModal
                    review={approveReview}
                    open={!!approveReview}
                    onClose={() => setApproveReview(null)}
                    onConfirm={handleApproveConfirm}
                />
                <RejectModal
                    review={rejectReview}
                    open={!!rejectReview}
                    onClose={() => setRejectReview(null)}
                    onConfirm={handleRejectConfirm}
                />
            </>
        );
    }

    // ── Main layout ──────────────────────────────────────────────────────────

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden space-y-4">
            {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1 max-w-2xl">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by ID, cleaner, location, room..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                        />
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-1 rounded border border-gray-200 bg-white p-1 shrink-0">
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => handleFilterChange(tab.value)}
                                className={`text-xs px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
                                    activeFilter === tab.value
                                        ? "bg-[#0ea5e9] text-white shadow-sm"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pending pill */}
                {pendingCount > 0 && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full whitespace-nowrap">
                        {pendingCount} pending review{pendingCount !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm border-collapse min-w-[720px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {TABLE_HEADERS.map((h, i) => (
                                    <th
                                        key={i}
                                        className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 px-4 py-3 whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={TABLE_HEADERS.length} className="p-0">
                                        <TableSkeleton rows={7} columns={TABLE_HEADERS.length} />
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={TABLE_HEADERS.length} className="text-center py-14 text-xs text-slate-400">
                                        No reviews found.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((review) => (
                                    <tr
                                        key={review.id}
                                        className="hover:bg-slate-50/80 transition-colors"
                                    >
                                        {/* REVIEW ID: Plain text */}
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-bold text-slate-800">
                                                {review.id}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <CleanerAvatar
                                                name={review.cleaner.name}
                                                initials={review.cleaner.initials}
                                                avatarColor={review.cleaner.avatarColor}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-600 max-w-[130px] truncate">
                                            {review.client}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-600 max-w-[150px] truncate">
                                            {review.location}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-bold text-slate-800 whitespace-nowrap">
                                            {review.room}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                                            {review.dateSubmitted}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                                            {review.aiScore}%
                                        </td>
                                        <td className="px-4 py-3">
                                            <AIScoreBar score={review.aiScore} confidence={review.aiConfidence} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={review.status} />
                                        </td>
                                        {/* Actions Column with View Icon Button */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => { void openReview(review); }}
                                                    className="flex items-center gap-1 text-xs font-semibold text-[#0ea5e9] bg-sky-50 border border-sky-200 hover:bg-sky-100 px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                                {review.status === "Pending Review" && (
                                                    <>
                                                        <button
                                                            onClick={() => setApproveReview(review)}
                                                            className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer"
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectReview(review)}
                                                            className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer"
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-slate-200 text-xs text-slate-500 bg-slate-50/50">
                        <p>
                            Showing {(page - 1) * PAGE_SIZE + 1}–
                            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} reviews
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition-colors cursor-pointer ${
                                        p === page
                                            ? "bg-[#0ea5e9] text-white shadow-sm"
                                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                aria-label="Next page"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ApproveModal
                review={approveReview}
                open={!!approveReview}
                onClose={() => setApproveReview(null)}
                onConfirm={handleApproveConfirm}
            />
            <RejectModal
                review={rejectReview}
                open={!!rejectReview}
                onClose={() => setRejectReview(null)}
                onConfirm={handleRejectConfirm}
            />
        </div>
    );
}

function resolveImageUrl(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:8000";
    const cleanBase = base.replace(/\/$/, "");
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
}

function mapReview(item: PhotoReviewApi): PhotoReview {
    const status: ReviewStatus = item.status?.toLowerCase().includes("approve")
        ? "Approved"
        : item.status?.toLowerCase().includes("reject")
        ? "Rejected"
        : "Pending Review";

    const rawConfidence = item.ai_confidence?.toLowerCase() ?? "";
    const confidence = rawConfidence === "high" ? 90 : rawConfidence === "medium" ? 70 : 40;

    const breakdown: Array<{ label: string; score: number }> = [];
    if (item.ai_feature_breakdown && typeof item.ai_feature_breakdown === "object") {
        Object.entries(item.ai_feature_breakdown).forEach(([key, rawVal]) => {
            const numVal = Number(rawVal);
            const score = numVal <= 1 && numVal > 0 ? Math.round(numVal * 100) : Math.round(numVal);
            const label = key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
            breakdown.push({ label, score });
        });
    }

    const dynamicPhotos: Array<{ label: string; url: string | null }> = [];
    if (Array.isArray((item as any).photos) && (item as any).photos.length > 0) {
        (item as any).photos.forEach((p: any, idx: number) => {
            const u = p.url || p.photo_url || p.after_photo_url || p.before_photo_url;
            const l = p.name || p.label || p.type || `Photo ${idx + 1}`;
            if (u) dynamicPhotos.push({ label: l, url: resolveImageUrl(u) });
        });
    }

    if (dynamicPhotos.length === 0) {
        if (item.before_photo_url) {
            dynamicPhotos.push({ label: "Before Cleaning", url: resolveImageUrl(item.before_photo_url) });
        }
        if (item.after_photo_url || item.photo_url) {
            const label = item.photo_name || "After Cleaning";
            dynamicPhotos.push({ label, url: resolveImageUrl(item.after_photo_url || item.photo_url) });
        }
    }

    const rawAiScore = Number(item.ai_score ?? 0);
    const normalizedAiScore = rawAiScore <= 1 && rawAiScore > 0 ? Math.round(rawAiScore * 100) : Math.round(rawAiScore);

    const qualityScore = breakdown[0]?.score ?? normalizedAiScore;
    const coverageScore = breakdown[1]?.score ?? normalizedAiScore;
    const imageQualityScore = breakdown[2]?.score ?? confidence;
    const brightnessScore = breakdown[3]?.score ?? confidence;

    return {
        id: item.review_id,
        shiftId: item.shift_id,
        cleaner: {
            name: item.cleaner?.name || "Unknown Cleaner",
            initials: (item.cleaner?.name || "C")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2),
            avatarColor: "bg-[#0ea5e9]",
        },
        client: item.client?.name || "N/A",
        location: item.location?.name || "N/A",
        room: item.room?.name || "N/A",
        dateSubmitted: item.date_submitted ? new Date(item.date_submitted).toLocaleString() : "N/A",
        aiScore: normalizedAiScore,
        aiConfidence: confidence,
        status,
        beforeImage: resolveImageUrl(item.before_photo_url) || undefined,
        afterImage: resolveImageUrl(item.after_photo_url || item.photo_url) || undefined,
        photos: dynamicPhotos,
        aiAnalysis: {
            overallScore: normalizedAiScore,
            qualityScore,
            coverageScore,
            imageQualityScore,
            brightnessScore,
            suggestion: status === "Approved" ? "Approve" : status === "Rejected" ? "Reject" : "Review",
            notes: item.rejection_reason ? [item.rejection_reason] : [],
            breakdown,
        },
    };
}

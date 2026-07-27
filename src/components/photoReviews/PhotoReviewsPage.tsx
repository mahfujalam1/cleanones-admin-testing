"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Bell,
    ChevronLeft,
    ChevronRight,
    Globe,
    Menu,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CleanerAvatar } from "./CleanerAvatar";
import { ApproveModal } from "./ApproveModal";
import { RejectModal } from "./RejectModal";
import { ReviewDetail } from "./ReviewDetail";
import { ApproveFormData, PhotoReview, RejectFormData, ReviewStatus } from "./types";
import { mockReviews } from "./MockData";
import { AIScoreBar } from "./Aiscorebar";

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

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
    "",
];

const NAV_ITEMS = [
    { label: "Dashboard", section: null },
    { label: "Roster", section: null },
    { label: "Shift Monitoring", section: null },
    { label: "Workers", section: null },
    { label: "Clients", section: null },
    { label: "Locations", section: null },
    { label: "Rooms", section: null },
    { label: "Cleaning Plans", section: null },
    { label: "Photo Reviews", section: "Quality Control" },
    { label: "Escalations", section: null },
    { label: "Reports", section: null },
    { label: "Notifications", section: null },
    { label: "Settings", section: null },
];

// ── Component ────────────────────────────────────────────────────────────────

export function PhotoReviewsPage() {
    const [reviews, setReviews] = useState<PhotoReview[]>(mockReviews);
    const [activeFilter, setActiveFilter] = useState<ReviewStatus | "All">("All");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selectedReview, setSelectedReview] = useState<PhotoReview | null>(null);
    const [approveReview, setApproveReview] = useState<PhotoReview | null>(null);
    const [rejectReview, setRejectReview] = useState<PhotoReview | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const pendingCount = reviews.filter((r) => r.status === "Pending Review").length;

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

    const handleApproveConfirm = (_data: ApproveFormData) => {
        if (!approveReview) return;
        setReviews((prev) =>
            prev.map((r) => (r.id === approveReview.id ? { ...r, status: "Approved" as ReviewStatus } : r))
        );
        setApproveReview(null);
        setSelectedReview(null);
    };

    const handleRejectConfirm = (_data: RejectFormData) => {
        if (!rejectReview) return;
        setReviews((prev) =>
            prev.map((r) => (r.id === rejectReview.id ? { ...r, status: "Rejected" as ReviewStatus } : r))
        );
        setRejectReview(null);
        setSelectedReview(null);
    };

    // ── Review Detail view ───────────────────────────────────────────────────

    if (selectedReview) {
        const liveReview = reviews.find((r) => r.id === selectedReview.id) ?? selectedReview;
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
        <div className="flex h-full min-h-0 overflow-hidden">


            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">


                {/* Content */}
                <main className="flex-1 overflow-y-auto space-y-4">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
                        {/* Search */}
                        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by ID, cleaner, location, room..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                            />
                        </div>

                        {/* Filter tabs */}
                        <div className="flex gap-1 flex-wrap">
                            {FILTER_TABS.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleFilterChange(tab.value)}
                                    className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${activeFilter === tab.value
                                            ? "bg-cyan-500 text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Pending pill */}
                        {pendingCount > 0 && (
                            <span className="sm:ml-auto text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded font-medium whitespace-nowrap">
                                {pendingCount} pending review{pendingCount !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    {/* Table */}
                    <div className="dashboard-card overflow-x-auto">
                        <table className="w-full text-sm border-collapse min-w-[720px]">
                            <thead>
                                <tr className="bg-gray-50">
                                    {TABLE_HEADERS.map((h, i) => (
                                        <th
                                            key={i}
                                            className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-4 py-3 whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={TABLE_HEADERS.length} className="text-center py-14 text-sm text-gray-400">
                                            No reviews found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((review) => (
                                        <tr
                                            key={review.id}
                                            className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => setSelectedReview(review)}
                                                    className="text-sm font-medium text-cyan-500 hover:text-cyan-600 hover:underline"
                                                >
                                                    {review.id}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <CleanerAvatar
                                                    name={review.cleaner.name}
                                                    initials={review.cleaner.initials}
                                                    avatarColor={review.cleaner.avatarColor}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-[130px] truncate">
                                                {review.client}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate">
                                                {review.location}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">
                                                {review.room}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                                                {review.dateSubmitted}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {review.aiScore}%
                                            </td>
                                            <td className="px-4 py-3">
                                                <AIScoreBar score={review.aiScore} confidence={review.aiConfidence} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={review.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                {review.status === "Pending Review" && (
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={() => setApproveReview(review)}
                                                            className="text-xs font-medium text-emerald-600 bg-white border border-emerald-200 hover:bg-emerald-50 px-2.5 py-1 rounded transition-colors whitespace-nowrap"
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectReview(review)}
                                                            className="text-xs font-medium text-red-500 bg-white border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded transition-colors whitespace-nowrap"
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
                            <p>
                                Showing {(page - 1) * PAGE_SIZE + 1}–
                                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} reviews
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${p === page
                                                ? "bg-cyan-500 text-white"
                                                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </main>
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

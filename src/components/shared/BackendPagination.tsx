"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export interface BackendPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
  showSummary?: boolean;
  itemLabel?: string;
  itemCount?: number;
}

type PageItem = number | "ellipsis-left" | "ellipsis-right";

export function BackendPagination({
  page,
  limit,
  total,
  onPageChange,
  className = "",
  showSummary = true,
  itemLabel = "items",
  itemCount,
}: BackendPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const [popoverPosition, setPopoverPosition] = useState<"left" | "right" | null>(null);
  const [jumpInput, setJumpInput] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  // If page exceeds totalPages (e.g. all items on the current page were deleted),
  // automatically redirect/fallback to the highest available page.
  useEffect(() => {
    if (total > 0 && page > totalPages && totalPages >= 1) {
      onPageChange(totalPages);
    } else if (total === 0 && page > 1) {
      onPageChange(1);
    } else if (typeof itemCount === "number" && itemCount === 0 && page > 1) {
      onPageChange(Math.max(1, page - 1));
    }
  }, [page, total, totalPages, itemCount, onPageChange]);

  // Close jump popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverPosition(null);
      }
    }
    if (popoverPosition) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [popoverPosition]);

  // If no items or only 1 page, hide pagination controls
  if (total <= limit || totalPages <= 1) {
    return null;
  }

  // Calculate items with ellipsis
  const getPageItems = (): PageItem[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, "ellipsis-right", totalPages];
    }

    if (page >= totalPages - 2) {
      return [1, "ellipsis-left", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "ellipsis-left", page - 1, page, page + 1, "ellipsis-right", totalPages];
  };

  const handleJumpSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
      setPopoverPosition(null);
      setJumpInput("");
    }
  };

  const openJumpPopover = (type: "left" | "right") => {
    setPopoverPosition(type);
    setJumpInput("");
  };

  const pageItems = getPageItems();
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 ${className}`}
    >
      {/* Summary info */}
      {showSummary && (
        <span className="text-slate-500 font-medium">
          Showing <span className="font-semibold text-slate-800">{startItem}</span>–
          <span className="font-semibold text-slate-800">{endItem}</span> of{" "}
          <span className="font-semibold text-slate-800">{total}</span> {itemLabel}
        </span>
      )}

      {/* Pagination Controls */}
      <nav
        role="navigation"
        aria-label="Pagination Navigation"
        className="flex items-center gap-1.5 ml-auto relative select-none"
      >
        {/* Previous Button */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shadow-2xs"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Buttons & Interactive Ellipsis */}
        <div className="flex items-center gap-1 relative">
          {pageItems.map((item, idx) => {
            if (typeof item === "number") {
              const isCurrent = item === page;
              return (
                <button
                  key={`page-${item}`}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all cursor-pointer select-none ${
                    isCurrent
                      ? "bg-sky-500 text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item}
                </button>
              );
            }

            const isLeft = item === "ellipsis-left";
            const isOpen = (isLeft && popoverPosition === "left") || (!isLeft && popoverPosition === "right");

            return (
              <div key={`ellipsis-${item}-${idx}`} className="relative inline-block">
                <button
                  type="button"
                  onClick={() => openJumpPopover(isLeft ? "left" : "right")}
                  title="Click to jump to page"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer ${
                    isOpen ? "border-sky-400 bg-sky-50 text-sky-600" : "border-transparent"
                  }`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {/* Jump to Page Popover */}
                {isOpen && (
                  <div
                    ref={popoverRef}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
                  >
                    <p className="text-[11px] font-bold text-slate-700 mb-1.5">
                      Go to page (1–{totalPages}):
                    </p>
                    <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        autoFocus
                        value={jumpInput}
                        onChange={(e) => setJumpInput(e.target.value)}
                        placeholder={`1-${totalPages}`}
                        className="h-7 w-full rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                      <button
                        type="submit"
                        disabled={!jumpInput || parseInt(jumpInput, 10) < 1 || parseInt(jumpInput, 10) > totalPages}
                        className="h-7 shrink-0 rounded-md bg-sky-500 px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-sky-600 disabled:opacity-40 cursor-pointer"
                      >
                        Go
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shadow-2xs"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </nav>
    </div>
  );
}

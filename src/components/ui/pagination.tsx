import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export interface PaginationProps extends React.ComponentProps<"nav"> {}

export function Pagination({ className = "", ...props }: PaginationProps) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={`mx-auto flex w-full justify-center ${className}`}
      {...props}
    />
  );
}

export function PaginationContent({
  className = "",
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
      {...props}
    />
  );
}

export function PaginationItem({
  className = "",
  ...props
}: React.ComponentProps<"li">) {
  return <li className={className} {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
} & React.ComponentProps<"button">;

export function PaginationLink({
  className = "",
  isActive,
  disabled,
  ...props
}: PaginationLinkProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      disabled={disabled}
      className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-3 text-xs font-medium transition-all select-none disabled:cursor-not-allowed disabled:opacity-40 ${
        isActive
          ? "bg-sky-500 text-white font-semibold shadow-xs hover:bg-sky-600"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
      } ${className}`}
      {...props}
    />
  );
}

export function PaginationPrevious({
  className = "",
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={`gap-1 pl-2.5 pr-3 ${className}`}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </PaginationLink>
  );
}

export function PaginationNext({
  className = "",
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={`gap-1 pl-3 pr-2.5 ${className}`}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({
  className = "",
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={`flex h-8 w-8 items-center justify-center text-slate-400 ${className}`}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

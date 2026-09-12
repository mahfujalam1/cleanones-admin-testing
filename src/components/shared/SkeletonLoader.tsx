import type { ReactNode } from "react";

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200/80 ${className}`} />;
}

export function TableSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full animate-pulse" aria-label="Loading content" role="status">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="grid min-h-14 items-center gap-4 border-b border-slate-100 px-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, column) => <Bar key={column} className={`h-3 ${column === 0 ? "w-4/5" : "w-3/5"}`} />)}
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading content" role="status">
      {Array.from({ length: cards }, (_, index) => (
        <div key={index} className="animate-pulse rounded border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3"><Bar className="h-10 w-10" /><div className="flex-1 space-y-2"><Bar className="h-4 w-2/3" /><Bar className="h-3 w-1/2" /></div></div>
          <div className="mt-5 space-y-3"><Bar className="h-3 w-full" /><Bar className="h-3 w-4/5" /><Bar className="h-8 w-full" /></div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function DetailSkeleton({ blocks = 5 }: { blocks?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading details" role="status">
      {Array.from({ length: blocks }, (_, index) => <div key={index} className="animate-pulse rounded border border-slate-100 bg-slate-50 p-4"><Bar className="h-3 w-1/3" /><Bar className="mt-3 h-4 w-3/4" /></div>)}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function ContentSkeleton({ children }: { children?: ReactNode }) {
  return <div className="animate-pulse" role="status" aria-label="Loading content">{children ?? <><Bar className="h-8 w-1/3" /><Bar className="mt-4 h-64 w-full" /></>}<span className="sr-only">Loading...</span></div>;
}

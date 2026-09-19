"use client";

import { useMemo, useState } from "react";
import { MdChevronLeft, MdChevronRight, MdEventNote } from "react-icons/md";
import type { ShiftAssignTarget } from "@/components/cleaningPlans/AssignWorkersModal";
import { PlanDetailModal } from "@/components/cleaningPlans/PlanDetailModal";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { ContentSkeleton } from "@/components/shared/SkeletonLoader";
import { SearchInput } from "@/components/shared/ListStates";
import { apiError } from "@/redux/api/apiError";
import {
  useGetPlanRosterQuery,
  type PlanRosterParams,
  type PlanRosterShift,
} from "@/redux/api/rosterApi";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PlanShiftCell } from "./PlanShiftCell";
import { canStaff, datesForView, roundedShiftEnd, shiftDateKey, toDateKey } from "./planShift";

const LIMIT = 10;
const PLAN_COL = 220;

export function ShiftManagementBoard() {
  const locale = getLocale(usePathname());
  const t = getDashboardTranslation(locale);

  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const [viewing, setViewing] = useState<{ planId: string; shift?: PlanRosterShift } | null>(null);

  const days = useMemo(() => datesForView(view, currentDate), [view, currentDate]);
  const compact = view === "month";
  const colWidth = view === "day" ? 360 : view === "week" ? 176 : 96;

  const params: PlanRosterParams = useMemo(() => {
    if (view === "month") {
      return {
        view: "month",
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        search: searchTerm || undefined,
        page,
        limit: LIMIT,
      };
    }
    return {
      view,
      date: toDateKey(currentDate),
      search: searchTerm || undefined,
      page,
      limit: LIMIT,
    };
  }, [view, currentDate, searchTerm, page]);

  const { data, isLoading, error, refetch } = useGetPlanRosterQuery(params);
  const plans = data?.cleaning_plans ?? [];

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (view === "week") next.setDate(next.getDate() - 7);
    else if (view === "month") next.setMonth(next.getMonth() - 1);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
    setPage(1);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (view === "week") next.setDate(next.getDate() + 7);
    else if (view === "month") next.setMonth(next.getMonth() + 1);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
    setPage(1);
  };

  const rangeLabel = () => {
    if (view === "month") return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (view === "week") {
      const start = days[0];
      const end = days[days.length - 1];
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const openPlan = (planId: string, shift?: PlanRosterShift) => {
    setViewing({ planId, shift });
  };

  const viewingShift = useMemo(() => {
    if (!viewing) return undefined;
    const rosterPlan = plans.find((item) => item.plan_id === viewing.planId);
    if (viewing.shift) {
      const key = shiftDateKey(viewing.shift.date);
      return (rosterPlan?.shifts ?? []).find((item) => shiftDateKey(item.date) === key) ?? viewing.shift;
    }
    return (rosterPlan?.shifts ?? []).find((item) => canStaff(item)) ?? rosterPlan?.shifts[0];
  }, [viewing, plans]);

  const viewingAssignTarget = useMemo((): ShiftAssignTarget | undefined => {
    if (!viewing || !viewingShift) return undefined;
    const rosterPlan = plans.find((item) => item.plan_id === viewing.planId);
    return {
      planId: viewing.planId,
      date: shiftDateKey(viewingShift.date),
      planTitle: rosterPlan?.plan_title,
      locationName: rosterPlan?.location_name ?? "",
      startTime: viewingShift.start_time ?? undefined,
      endTime: roundedShiftEnd(viewingShift),
      durationMinutes: viewingShift.duration_minutes,
      assignedWorkers: viewingShift.assigned_workers,
    };
  }, [viewing, viewingShift, plans]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded border border-sky-200 bg-sky-50 text-primary">
            <MdEventNote className="text-base" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-800">{t.nav.shiftManagement}</h1>
            <p className="text-xs text-slate-500">Staff each due date. Roster only shows workers after they are assigned here.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded border border-gray-200 bg-white px-2.5 py-1.5">
            <strong className="font-semibold text-slate-700">{data?.meta.total ?? 0}</strong> plans
          </span>
          <span className="rounded border border-gray-200 bg-white px-2.5 py-1.5">
            <strong className="font-semibold text-slate-700">{data?.meta.total_shifts ?? 0}</strong> due dates
          </span>
        </div>
      </div>

      <div className="sticky top-0 z-30 flex flex-col gap-3 rounded border border-gray-200 bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          <button
            type="button"
            onClick={() => { setCurrentDate(new Date()); setPage(1); }}
            className="h-8 rounded border border-gray-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-gray-50"
          >
            Today
          </button>
          <div className="flex shrink-0 overflow-hidden rounded border border-gray-300 bg-white">
            <button type="button" onClick={handlePrev} aria-label="Previous period" className="flex h-8 w-8 items-center justify-center border-r border-gray-300 text-gray-500 hover:bg-gray-50">
              <MdChevronLeft className="text-lg" />
            </button>
            <button type="button" onClick={handleNext} aria-label="Next period" className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-gray-50">
              <MdChevronRight className="text-lg" />
            </button>
          </div>
          <h2 className="min-w-[190px] truncate text-sm font-semibold text-slate-800">{rangeLabel()}</h2>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          <div className="w-56">
            <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search plan title…" />
          </div>
          <div className="flex overflow-x-auto rounded border border-gray-200 bg-gray-50 p-0.5 text-xs font-medium">
            {(["day", "week", "month"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => { setView(option); setPage(1); }}
                className={`h-7 rounded px-3 capitalize ${view === option ? "border border-gray-200 bg-white text-primary" : "border border-transparent text-gray-500 hover:text-gray-800"}`}
              >
                {option === "day" ? t.roster.dayView : option === "week" ? t.roster.weekView : t.roster.monthView}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {error ? <p className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{apiError(error)}</p> : null}
        {isLoading ? (
          <ContentSkeleton />
        ) : (
          <section className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-slate-200 bg-white">
            <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-sky-600 bg-primary px-5 text-white">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/75">
                  {view === "day" ? "Daily" : view === "week" ? "Weekly" : "Monthly"} shift management
                </p>
                <h2 className="mt-0.5 text-xl font-semibold tracking-tight">{rangeLabel()}</h2>
              </div>
              <div className="hidden items-center gap-4 text-[10px] text-white/75 sm:flex">
                <span><b className="text-sm text-white">{data?.meta.total ?? 0}</b> plans</span>
                <span className="h-6 w-px bg-white/25" />
                <span><b className="text-sm text-white">{data?.meta.total_shifts ?? 0}</b> due dates</span>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="flex min-h-full flex-col" style={{ minWidth: PLAN_COL + colWidth * days.length }}>
                <div className="sticky top-0 z-30 flex h-14 border-b border-slate-200 bg-white">
                  <div className="sticky left-0 z-40 flex shrink-0 items-center border-r border-slate-200 bg-white px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400" style={{ width: PLAN_COL }}>
                    Cleaning plan
                  </div>
                  {days.map((day) => {
                    const today = day.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={day.toISOString()}
                        className={`flex shrink-0 flex-col items-center justify-center border-r border-slate-200 last:border-r-0 ${today ? "bg-sky-50" : "bg-white"}`}
                        style={{ width: colWidth }}
                      >
                        <span className={`text-[9px] font-semibold uppercase ${today ? "text-primary" : "text-slate-400"}`}>
                          {day.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <b className={`mt-0.5 text-xs ${today ? "text-primary" : "text-slate-700"}`}>
                          {day.toLocaleDateString("en-GB", { day: "numeric", month: compact ? undefined : "short" })}
                        </b>
                      </div>
                    );
                  })}
                </div>

                {plans.length === 0 ? (
                  <p className="px-6 py-16 text-center text-sm text-slate-400">No cleaning plans due in this range.</p>
                ) : (
                  plans.map((plan, rowIndex) => (
                    <div
                      key={plan.plan_id}
                      className={`flex min-h-[88px] border-b border-slate-100 last:border-b-0 ${rowIndex % 2 ? "bg-slate-50/45" : "bg-white"}`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const key = toDateKey(currentDate);
                          const todayShift = (plan.shifts ?? []).find((item) => shiftDateKey(item.date) === key);
                          openPlan(plan.plan_id, todayShift);
                        }}
                        className={`sticky left-0 z-20 flex shrink-0 flex-col justify-center border-r border-slate-200 px-4 text-left transition-colors hover:bg-sky-50 ${rowIndex % 2 ? "bg-[#fafbfc]" : "bg-white"}`}
                        style={{ width: PLAN_COL }}
                      >
                        <b className="block truncate text-xs text-slate-800">{plan.plan_title}</b>
                        <small className="truncate text-[10px] text-slate-400">{plan.location_name}</small>
                      </button>
                      {days.map((day) => {
                        const key = toDateKey(day);
                        const shift = (plan.shifts ?? []).find((item) => shiftDateKey(item.date) === key);
                        return (
                          <div key={`${plan.plan_id}-${key}`} className="flex shrink-0 items-center border-r border-slate-200 p-1.5 last:border-r-0" style={{ width: colWidth }}>
                            <PlanShiftCell
                              shift={shift}
                              compact={compact}
                              onView={(item) => openPlan(plan.plan_id, item)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#0ea5e9]" /> Unassigned due date</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#0284c7]" /> Staffed</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#06a7df]" /> Completed</span>
            </div>
          </section>
        )}
      </div>

      <div className="shrink-0 pt-1">
        <BackendPagination
          page={page}
          limit={LIMIT}
          total={data?.meta.total ?? 0}
          onPageChange={setPage}
          itemLabel="plans"
          itemCount={plans.length}
        />
      </div>

      {viewing && (
        <PlanDetailModal
          planId={viewing.planId}
          shiftDate={viewingShift ? shiftDateKey(viewingShift.date) : toDateKey(currentDate)}
          assignTarget={viewingAssignTarget}
          assignedWorkers={viewingShift?.assigned_workers ?? []}
          shiftSchedule={{
            date: viewingShift ? shiftDateKey(viewingShift.date) : undefined,
            startTime: viewingShift?.start_time,
            endTime: roundedShiftEnd(viewingShift),
          }}
          onClose={() => setViewing(null)}
          onAssigned={() => {
            void refetch();
          }}
        />
      )}
    </div>
  );
}

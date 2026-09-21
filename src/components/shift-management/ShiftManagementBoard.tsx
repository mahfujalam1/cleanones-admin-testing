"use client";

import { useMemo, useState } from "react";
import {
  MdAccessTime,
  MdCheckCircle,
  MdChevronLeft,
  MdChevronRight,
  MdEventNote,
} from "react-icons/md";
import type { ShiftAssignTarget } from "@/components/cleaningPlans/AssignWorkersModal";
import { PlanDetailModal } from "@/components/cleaningPlans/PlanDetailModal";
import { PlanForm } from "@/components/cleaningPlans/PlanForm";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { ContentSkeleton } from "@/components/shared/SkeletonLoader";
import { SearchInput } from "@/components/shared/ListStates";
import { CatalogFilters } from "@/components/shared/CatalogFilters";
import { DatePicker } from "@/components/ui/date-picker";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { apiError } from "@/redux/api/apiError";
import {
  useGetPlanRosterQuery,
  type PlanRosterParams,
  type PlanRosterShift,
} from "@/redux/api/rosterApi";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import { getScreenCopy } from "@/lib/screen-copy";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { CleaningPlan } from "@/redux/api/endpoints/cleaningPlans.api";
import { PlanShiftCell } from "./PlanShiftCell";
import { canStaff, datesForView, shiftEndFromDuration, shiftDateKey, toDateKey } from "./planShift";

const LIMIT = 10;
const PLAN_COL = 200;

export function ShiftManagementBoard() {
  const locale = getLocale(usePathname());
  const t = getDashboardTranslation(locale);
  const copy = getScreenCopy(locale);

  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search.trim());
  const [clientId, setClientId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [viewing, setViewing] = useState<{ planId: string; shift?: PlanRosterShift } | null>(null);
  const [editingPlan, setEditingPlan] = useState<CleaningPlan | null>(null);

  const days = useMemo(() => datesForView(view, currentDate), [view, currentDate]);
  const compact = view === "month";
  const colWidth = view === "day" ? 360 : view === "week" ? 170 : 104;

  const params: PlanRosterParams = useMemo(() => {
    if (view === "month") {
      return {
        view: "month",
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        search: searchTerm || undefined,
        client: clientId || undefined,
        location: locationId || undefined,
        page,
        limit: LIMIT,
      };
    }
    return {
      view,
      date: toDateKey(currentDate),
      search: searchTerm || undefined,
      client: clientId || undefined,
      location: locationId || undefined,
      page,
      limit: LIMIT,
    };
  }, [view, currentDate, searchTerm, page, clientId, locationId]);

  const { data, isLoading, error, refetch } = useGetPlanRosterQuery(params);
  const plans = useMemo(() => data?.cleaning_plans ?? [], [data]);
  const visibleShifts = plans.flatMap((plan) => plan.shifts ?? []);
  const scheduledHours = visibleShifts.reduce(
    (total, shift) => total + (shift.duration_minutes ?? 0) / 60,
    0,
  );
  const unassignedCount = visibleShifts.filter(
    (shift) => !shift.assigned_workers?.length,
  ).length;

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
      endTime: shiftEndFromDuration(viewingShift),
      durationMinutes: viewingShift.duration_minutes,
      assignedWorkers: viewingShift.assigned_workers,
    };
  }, [viewing, viewingShift, plans]);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded border border-sky-200 bg-sky-50 text-primary">
            <MdEventNote className="text-lg" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-800">{t.nav.shiftManagement}</h1>
            <p className={`flex items-center gap-1 text-xs ${unassignedCount === 0 ? "text-emerald-600" : "text-amber-600"}`}>
              <MdCheckCircle />
              {unassignedCount === 0 ? "All shifts on schedule" : `${unassignedCount} shifts need staffing`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] text-slate-500">
            <b className="text-slate-700">{data?.meta.total_shifts ?? visibleShifts.length}</b> shifts
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] text-slate-500">
            <b className="text-slate-700">{scheduledHours.toFixed(1)}h</b> duration
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] text-slate-500">
            <b className="text-slate-700">{data?.meta.total ?? plans.length}</b> plans
          </span>
        </div>
      </div>

      <div className="sticky top-0 z-30 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className={`rounded-md px-2.5 py-1 text-[10px] font-semibold ${
            unassignedCount === 0 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}>
            {unassignedCount === 0 ? "On time" : `${unassignedCount} unassigned`}
          </span>
          <div className="flex shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white">
            <button type="button" onClick={handlePrev} aria-label="Previous period" className="flex h-8 w-8 items-center justify-center border-r border-gray-300 text-gray-500 hover:bg-gray-50">
              <MdChevronLeft className="text-lg" />
            </button>
            <button type="button" onClick={handleNext} aria-label="Next period" className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-gray-50">
              <MdChevronRight className="text-lg" />
            </button>
          </div>
          <span className="min-w-[170px] truncate text-xs font-semibold text-slate-700">{rangeLabel()}</span>
          <DatePicker
            value={toDateKey(currentDate)}
            iconOnly
            onValueChange={(value) => {
              const selected = new Date(`${value}T12:00:00`);
              if (!Number.isNaN(selected.getTime())) {
                setCurrentDate(selected);
                setView("day");
                setPage(1);
              }
            }}
          />
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <div className="grid w-full grid-cols-2 gap-2 sm:w-[280px]">
            <CatalogFilters
              clientId={clientId}
              locationId={locationId}
              onClient={(id) => {
                setClientId(id);
                if (id) setLocationId("");
                setPage(1);
              }}
              onLocation={(id) => {
                setLocationId(id);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-48">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search plan title…"
            />
          </div>
          <SlidingTabs
            compact
            value={view}
            options={[
              { value: "day", label: t.roster.dayView },
              { value: "week", label: t.roster.weekView },
              { value: "month", label: t.roster.monthView },
            ]}
            onValueChange={(next) => {
              setView(next as typeof view);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {error ? <p className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{apiError(error)}</p> : null}
        {isLoading ? (
          <ContentSkeleton />
        ) : (
          <section
            key={`${view}-${toDateKey(currentDate)}`}
            className="flex h-full min-h-0 animate-in flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs fade-in slide-in-from-bottom-1 duration-300"
          >
            <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-sky-600 bg-primary px-5 text-white">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/75">
                  {view === "day" ? "Daily" : view === "week" ? "Weekly" : "Monthly"} roster
                </p>
                <h2 className="mt-0.5 text-xl font-semibold tracking-tight">{rangeLabel()}</h2>
              </div>
              <div className="hidden items-center gap-4 text-[10px] text-white/75 sm:flex">
                <span><b className="text-sm text-white">{data?.meta.total_shifts ?? visibleShifts.length}</b> shifts</span>
                <span className="h-6 w-px bg-white/25" />
                <span><b className="text-sm text-white">{scheduledHours.toFixed(1)}h</b> scheduled</span>
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
                        className={`flex shrink-0 flex-col items-center justify-center border-r border-slate-200 last:border-r-0 ${today ? "bg-sky-50/70" : "bg-white"}`}
                        style={{ width: colWidth }}
                      >
                        <span className={`text-[10px] font-semibold uppercase ${today ? "text-primary" : "text-slate-400"}`}>
                          {day.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <b className={`mt-0.5 text-xs font-semibold ${today ? "text-primary" : "text-slate-700"}`}>
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
                      className={`flex min-h-[104px] border-b border-slate-100 last:border-b-0 ${rowIndex % 2 ? "bg-slate-50/30" : "bg-white"}`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const key = toDateKey(currentDate);
                          const todayShift = (plan.shifts ?? []).find((item) => shiftDateKey(item.date) === key);
                          openPlan(plan.plan_id, todayShift);
                        }}
                        className={`sticky left-0 z-20 flex shrink-0 flex-row items-center gap-2.5 border-r border-slate-200 px-3 text-left transition-colors hover:bg-sky-50 ${rowIndex % 2 ? "bg-[#fafbfc]" : "bg-white"}`}
                        style={{ width: PLAN_COL }}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[9px] font-semibold text-sky-600 ring-1 ring-sky-100">
                          {plan.plan_title.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <b className="block truncate text-[11px] font-semibold text-slate-800">{plan.plan_title}</b>
                          <small className="mt-0.5 block truncate text-[9px] text-slate-400">
                            {(plan.shifts ?? []).length} shifts this {view === "month" ? "month" : view === "day" ? "day" : "week"}
                          </small>
                        </span>
                      </button>
                      {days.map((day) => {
                        const key = toDateKey(day);
                        const shift = (plan.shifts ?? []).find((item) => shiftDateKey(item.date) === key);
                        return (
                          <div key={`${plan.plan_id}-${key}`} className="flex shrink-0 items-center border-r border-slate-200 p-1.5 last:border-r-0" style={{ width: colWidth }}>
                            <PlanShiftCell
                              shift={shift}
                              compact={compact}
                              planTitle={plan.plan_title}
                              locationName={plan.location_name}
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
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2 text-[9px] text-slate-400">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-400" /> Worker not assigned</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-sky-500" /> Staffed</span>
              <span className="ml-auto hidden items-center gap-1 sm:flex"><MdAccessTime /> {copy.scrollFullPeriod}</span>
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
            endTime: shiftEndFromDuration(viewingShift),
          }}
          onClose={() => setViewing(null)}
          onEditShiftPlan={(planId) => {
            const rosterPlan = plans.find((plan) => plan.plan_id === planId);
            setViewing(null);
            setEditingPlan({
              _id: planId,
              title: rosterPlan?.plan_title ?? "Cleaning plan",
              client: "",
              location: "",
            });
          }}
          onAssigned={() => {
            void refetch();
          }}
        />
      )}

      {editingPlan && (
        <PlanForm
          plan={editingPlan}
          onClose={() => {
            setEditingPlan(null);
            void refetch();
          }}
        />
      )}
    </div>
  );
}

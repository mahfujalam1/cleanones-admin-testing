"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MdAccessTime,
  MdChevronRight,
  MdClose,
  MdDeleteOutline,
  MdLocationOn,
  MdModeEditOutline,
  MdMoreVert,
  MdOutlineGroupAdd,
  MdSearch,
} from "react-icons/md";
import { TbActivity, TbClock, TbCalendarStats, TbCircleCheck } from "react-icons/tb";
import {
  useGetTodayLiveShiftMetaQuery,
  useGetTodayLiveShiftsQuery,
  type TodayLiveShiftItem,
} from "@/redux/api/shiftsApi";
import { EmployeeDetailsModal } from "@/components/shift-monitoring/EmployeeDetailsModal";
import type { WorkerInfo } from "@/components/shift-monitoring/types";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getLocale, localizePath } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import { getUiTranslation } from "@/lib/translations";

const formatShiftTime = (dateTimeStr?: string) => {
  if (!dateTimeStr) return "--:--";
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateTimeStr;
  }
};

const getStatusTone = (st: string) => {
  const s = (st || "").toLowerCase();
  if (s.includes("progress") || s === "in_progress" || s === "inprogress" || s.includes("late")) {
    return { chip: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500", label: "Inprogress" };
  }
  if (s.includes("upcoming") || s === "pending" || s === "scheduled" || s === "draft") {
    return { chip: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500", label: "Upcoming" };
  }
  if (s.includes("complete") || s === "completed") {
    return { chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500", label: "Complete" };
  }
  if (s.includes("cancel") || s.includes("missing")) {
    return { chip: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500", label: "Cancelled" };
  }
  return { chip: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-500", label: st || "Active" };
};

/** The four states the Live Status tabs can filter by; "" is every shift. */
type LiveStatusFilter = "" | "inprogress" | "upcoming" | "complete";

type UnifiedLiveShift = {
  id: string;
  shift_id?: string;
  worker_name?: string;
  worker_type?: string;
  worker_id?: string;
  profile_picture?: string;
  client_name?: string;
  location_name?: string;
  plan_title?: string;
  /** Present when the shift was generated from a cleaning plan; the quick actions need it. */
  plan_id?: string;
  start_time: string;
  duration_text?: string;
  status: string;
  progress: number;
  total_room?: number;
  completed_room?: number;
  total_task?: number;
  rawItem?: TodayLiveShiftItem;
};

export default function LiveStatusPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = getLocale(pathname);
  const router = useRouter();
  const ui = getUiTranslation(getLocale(usePathname()));
  /** Which row has its quick-actions menu open. */
  const [menuFor, setMenuFor] = useState("");

  /**
   * The quick actions hand off to the Cleaning Plans page rather than editing in place —
   * that page owns the plan modals, and `?plan=&action=` opens the right one on arrival.
   */
  const openPlanAction = (planId: string, action: "edit" | "assign" | "delete") => {
    setMenuFor("");
    if (action === "assign") {
      const today = new Date();
      const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      router.push(localizePath(`/roster?plan=${encodeURIComponent(planId)}&date=${date}&action=assign`, locale));
      return;
    }
    router.push(localizePath(`/cleaning-plans?plan=${encodeURIComponent(planId)}&action=${action}`, locale));
  };
  const t = getDashboardTranslation(locale);

  const [selected, setSelected] = useState<WorkerInfo | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LiveStatusFilter>(() => {
    const requested = searchParams.get("status");
    return requested === "inprogress" || requested === "upcoming" || requested === "complete"
      ? requested
      : "";
  });
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filterTabs: Array<{ value: LiveStatusFilter; label: string }> = [
    { value: "", label: ui.all },
    { value: "inprogress", label: ui.inProgress },
    { value: "upcoming", label: ui.upcoming },
    { value: "complete", label: ui.completed },
  ];

  // 1. Fetch Today's Live Shift Metadata
  const { data: todayMeta, refetch: refetchMeta } = useGetTodayLiveShiftMetaQuery();

  // 2. Fetch Today's Live Shifts List
  const statusParam =
    statusFilter === "inprogress"
      ? "in_progress"
      : statusFilter === "upcoming"
      ? "upcoming"
      : statusFilter === "complete"
      ? "completed"
      : undefined;

  const {
    data: todayShiftsRes,
    isFetching: loadingTodayShifts,
    refetch: refetchTodayShifts,
  } = useGetTodayLiveShiftsQuery({
    status: statusParam,
    limit: 100,
  });

  // `?? []` would be a fresh array each render and re-run every memo that depends on it.
  const todayShifts = useMemo(() => todayShiftsRes?.result ?? [], [todayShiftsRes]);

  // Refetch all endpoints
  const refetchAll = () => {
    void refetchMeta();
    void refetchTodayShifts();
  };

  // KPI Counters: prioritize /shift/today-live-shift-meta, otherwise count the list itself.
  const counts = useMemo(() => {
    if (todayMeta) {
      return {
        total: todayMeta.total_shift ?? 0,
        inprogress: todayMeta.in_progress ?? 0,
        upcoming: todayMeta.pending ?? 0,
        complete: todayMeta.completed_shift ?? 0,
      };
    }

    const statusOf = (shift: (typeof todayShifts)[number]) => (shift.status || "").toLowerCase();

    return {
      total: todayShifts.length,
      inprogress: todayShifts.filter((shift) => statusOf(shift).includes("progress")).length,
      upcoming: todayShifts.filter((shift) => {
        const st = statusOf(shift);
        return st.includes("upcoming") || st.includes("pending") || st.includes("scheduled");
      }).length,
      complete: todayShifts.filter((shift) => statusOf(shift).includes("complete")).length,
    };
  }, [todayMeta, todayShifts]);

  // Unified items for display
  const unifiedItems: UnifiedLiveShift[] = useMemo(() => {
    // If today's live shifts API returned data, use it
    if (todayShifts.length > 0) {
      return todayShifts.map((s) => ({
        id: s._id,
        shift_id: s._id,
        client_name: s.client?.name,
        location_name: s.location?.name,
        plan_title: typeof s.cleaning_plan === "object" ? s.cleaning_plan?.title : undefined,
        plan_id: typeof s.cleaning_plan === "object" ? s.cleaning_plan?._id : s.cleaning_plan,
        start_time: formatShiftTime(s.date_time || s.date),
        duration_text: s.duration_minutes ? `${s.duration_minutes}m` : undefined,
        status: s.status,
        progress: Math.min(100, Math.max(0, s.overall_progress_percent ?? 0)),
        total_room: s.total_room,
        completed_room: s.completed_room,
        total_task: s.total_task,
        rawItem: s,
      }));
    }

    return [];
  }, [todayShifts]);

  // Client-side search and status filter
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      if (statusFilter === "inprogress") {
        const s = (item.status || "").toLowerCase();
        const matches =
          s.includes("progress") ||
          s.includes("ontime") ||
          s.includes("on_time") ||
          s.includes("late") ||
          (item.progress > 0 && item.progress < 100);
        if (!matches) return false;
      } else if (statusFilter === "upcoming") {
        const s = (item.status || "").toLowerCase();
        const matches =
          s.includes("upcoming") ||
          s.includes("scheduled") ||
          s.includes("pending") ||
          s === "draft";
        if (!matches) return false;
      } else if (statusFilter === "complete") {
        const s = (item.status || "").toLowerCase();
        const matches = s.includes("complete") || item.progress === 100;
        if (!matches) return false;
      }

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          item.worker_name?.toLowerCase().includes(q) ||
          item.location_name?.toLowerCase().includes(q) ||
          item.plan_title?.toLowerCase().includes(q) ||
          item.client_name?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [unifiedItems, statusFilter, search]);

  const pagedItems = useMemo(() => {
    return filteredItems.slice((page - 1) * LIMIT, page * LIMIT);
  }, [filteredItems, page]);

  const loading = loadingTodayShifts;

  return (
    <div className="space-y-4 pb-10">
      {/* Header with Today's Live Shifts mention */}
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-600">
          <TbActivity className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold leading-tight text-slate-900">{ui.todaysLiveShifts}</h1>
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200/60 uppercase tracking-wide">
              {ui.liveToday}
            </span>
          </div>
          <p className="truncate text-xs text-slate-500">{ui.liveCheckInStatus}</p>
        </div>
      </div>

      {/* Stats Cards from /shift/today-live-shift-meta */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<TbActivity />}
          value={counts.total}
          label={ui.totalShift}
          tone="bg-slate-100 text-slate-700"
        />
        <StatCard
          icon={<TbClock />}
          value={counts.inprogress}
          label={ui.inProgress}
          tone="bg-amber-50 text-amber-600"
          accent="text-amber-700"
        />
        <StatCard
          icon={<TbCalendarStats />}
          value={counts.upcoming}
          label={ui.upcoming}
          tone="bg-blue-50 text-blue-600"
          accent="text-blue-700"
        />
        <StatCard
          icon={<TbCircleCheck />}
          value={counts.complete}
          label={ui.completed}
          tone="bg-emerald-50 text-emerald-600"
          accent="text-emerald-700"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.shiftMonitoring.searchPlaceholder || "Search worker or location..."}
            className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs outline-none transition-all focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          {search && (
            <button
              type="button"
              aria-label={ui.clearSearch}
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <MdClose />
            </button>
          )}
        </div>

        <SlidingTabs
          value={statusFilter}
          options={filterTabs.map((tab) => ({ value: tab.value, label: tab.label }))}
          onValueChange={(next) => setStatusFilter(next as LiveStatusFilter)}
        />
      </div>

      {/* Shifts List */}
      <div key={statusFilter || "all"} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100/70" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <TbActivity className="text-3xl" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t.shiftMonitoring.noLiveShifts}</h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            {search || statusFilter ? t.common.adjustFilters : ui.nothingIsRunning}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pagedItems.map((item) => {
            const tone = getStatusTone(item.status);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.worker_id) {
                    setSelected({
                      id: item.worker_id,
                      initials: "",
                      name: item.worker_name || item.client_name || "Worker",
                      role: item.worker_type?.toLowerCase() === "freelancer" ? "Freelancer" : "Employee",
                      shiftId: item.shift_id || "",
                      location: item.location_name || "",
                      checkIn: item.start_time || "",
                      status: item.status?.toLowerCase() === "late" ? "Late" : "On Time",
                      color: "bg-sky-500",
                      statusColor: "text-sky-500",
                      hoursWorked: 0,
                      totalShifts: 0,
                      lateDays: 0,
                      avgDuration: "0h",
                    });
                  }
                }}
                className={`group w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm ${
                  item.worker_id ? "cursor-pointer" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {item.profile_picture ? (
                    <img
                      src={item.profile_picture}
                      alt={item.worker_name || "Worker"}
                      className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 font-bold border border-sky-100">
                      <TbActivity className="text-lg" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-primary">
                        {item.worker_name || item.client_name || item.location_name || "Live Shift"}
                      </b>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${tone.chip}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                        {tone.label}
                      </span>
                      {item.worker_type && (
                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600">
                          {item.worker_type}
                        </span>
                      )}
                      {item.plan_title && (
                        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {item.plan_title}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {item.client_name && (
                        <span className="font-medium text-slate-700">{item.client_name}</span>
                      )}
                      {item.location_name && (
                        <span className="flex min-w-0 items-center gap-1">
                          <MdLocationOn className="shrink-0 text-sm text-slate-400" />
                          <span className="truncate">{item.location_name}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MdAccessTime className="shrink-0 text-sm text-slate-400" />
                        <span>{item.start_time}</span>
                        {item.duration_text ? <span className="text-slate-400">({item.duration_text})</span> : null}
                      </span>
                      {item.total_room !== undefined && item.total_room > 0 && (
                        <span className="text-slate-500">
                          🚪 {item.completed_room ?? 0}/{item.total_room} rooms
                        </span>
                      )}
                      {item.total_task !== undefined && item.total_task > 0 && (
                        <span className="text-slate-500">
                          📋 {item.total_task} tasks
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-bold text-slate-900">{item.progress}%</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">progress</p>
                  </div>

                  {item.plan_id && (
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        aria-label={ui.quickActions}
                        aria-expanded={menuFor === item.id}
                        onClick={(event) => {
                          // The row itself opens the worker modal, so the menu must not bubble.
                          event.stopPropagation();
                          setMenuFor((current) => (current === item.id ? "" : item.id));
                        }}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                      >
                        <MdMoreVert className="text-lg" />
                      </button>

                      {menuFor === item.id && (
                        <>
                          {/* Click-away target, under the menu but over the page. */}
                          <span
                            className="fixed inset-0 z-20 cursor-default"
                            onClick={(event) => {
                              event.stopPropagation();
                              setMenuFor("");
                            }}
                          />
                          <div
                            role="menu"
                            onClick={(event) => event.stopPropagation()}
                            className="absolute right-0 top-9 z-30 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                          >
                            <button
                              type="button"
                              onClick={() => openPlanAction(item.plan_id as string, "edit")}
                              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              <MdModeEditOutline className="text-base text-slate-400" /> {ui.editPlan}
                            </button>
                            <button
                              type="button"
                              onClick={() => openPlanAction(item.plan_id as string, "assign")}
                              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              <MdOutlineGroupAdd className="text-base text-slate-400" /> {ui.reassignWorkers}
                            </button>
                            <button
                              type="button"
                              onClick={() => openPlanAction(item.plan_id as string, "delete")}
                              className="flex w-full cursor-pointer items-center gap-2 border-t border-slate-100 px-3 py-2 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                              <MdDeleteOutline className="text-base" /> {ui.deletePlan}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {item.worker_id && (
                    <MdChevronRight className="mt-2 shrink-0 text-lg text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums text-slate-500">
                    {item.progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      <BackendPagination
        page={page}
        limit={LIMIT}
        total={filteredItems.length}
        onPageChange={setPage}
        itemLabel="shifts"
      />

      {selected && (
        <EmployeeDetailsModal
          worker={selected}
          onClose={() => setSelected(null)}
          onChanged={refetchAll}
        />
      )}
    </div>
  );
}

function StatCard({ icon, value, label, tone, accent }: { icon: React.ReactNode; value: number; label: string; tone: string; accent?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${tone}`}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`text-lg font-bold leading-tight ${accent ?? "text-slate-900"}`}>{value}</p>
      </div>
    </div>
  );
}

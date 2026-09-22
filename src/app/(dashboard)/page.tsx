"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetWorkerQuery } from "@/redux/api/endpoints/workers.api";
import { MdAccessTime, MdAdd, MdArrowForward, MdAssessment, MdBusiness, MdCalendarToday, MdCheckCircle, MdChevronRight, MdClose, MdEmail, MdGroups, MdLocationOn, MdPerson, MdPhone, MdPhotoCamera, MdReportProblem, MdViewWeek, MdWarningAmber } from "react-icons/md";
import {
  useGetTodayLiveShiftMetaQuery,
  useGetTodayLiveShiftsQuery,
  type TodayLiveShiftItem,
} from "@/redux/api/shiftsApi";
import { isPendingIssue, useGetEscalationsQuery } from "@/redux/api/escalationsApi";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation, getUiTranslation } from "@/lib/translations";
import { getScreenCopy } from "@/lib/screen-copy";
import { apiError } from "@/redux/api/apiError";
import { PlanDetailModal } from "@/components/cleaningPlans/PlanDetailModal";
import type { PlanRosterAssignedWorker } from "@/redux/api/rosterApi";



type AttentionPill = {
  worker_id: string;
  worker_name: string;
  late_duration_text: string;
  phone_number: string;
};

type LiveOperationsClient = {
  client_id: string;
  client_company_name: string;
  location_id: string;
  location_name: string;
  roster_count_text: string;
  workers: Array<{
    worker_id: string;
    name: string;
    profile_picture: string;
    shift_time_range: string;
    delay_reason: string;
    status: string;
    status_badge_label: string;
    can_call: boolean;
    phone_number: string;
  }>;
};


function planIdOfLiveShift(shift: TodayLiveShiftItem) {
  const plan = shift.cleaning_plan;
  if (typeof plan === "string") return plan;
  return plan?._id || "";
}

function dateOfLiveShift(shift: TodayLiveShiftItem) {
  return (shift.date || shift.date_time || "").slice(0, 10);
}

function crewOfLiveShift(shift: TodayLiveShiftItem): PlanRosterAssignedWorker[] {
  return (shift.assigned_workers ?? shift.workers ?? []).map((worker) => ({
    worker_id: worker.worker_id,
    name: worker.name,
    role: worker.shift_role || worker.worker_type,
  })).filter((worker) => worker.worker_id || worker.name);
}

function getInitials(name: string): string {
  if (!name) return "W";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTimeToHHMM(value?: string): string {
  if (!value) return "---";
  if (value.includes("T")) {
    const timePart = value.split("T")[1];
    if (timePart && timePart.length >= 5) {
      return timePart.slice(0, 5);
    }
  }
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hour = Number(match[1]);
    if (match[3]?.toUpperCase() === "PM" && hour < 12) hour += 12;
    if (match[3]?.toUpperCase() === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${match[2]}`;
  }
  return value.slice(0, 5);
}

function dialHref(phone?: string) {
  const digits = phone?.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

type LateWorkerChip = {
  id: string;
  name: string;
  detail: string;
  email?: string;
  phone?: string;
  photo?: string;
};

function nameInitials(name: string) {
  const cleaned = name.trim();
  if (!cleaned) return "W";
  return cleaned.slice(0, 2).toUpperCase();
}

export default function DashboardPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);
  const ui = getUiTranslation(locale);
  const copy = getScreenCopy(locale);

  const [liveTab, setLiveTab] = useState<"all" | "upcoming" | "in_progress" | "completed">("all");
  const [selectedLateWorker, setSelectedLateWorker] = useState<LateWorkerChip | null>(null);
  const [viewingLiveShift, setViewingLiveShift] = useState<{
    planId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    assignedWorkers?: PlanRosterAssignedWorker[];
  } | null>(null);
  const {
    data: selectedWorkerDetails,
    isFetching: loadingWorkerDetails,
    error: workerDetailsError,
  } = useGetWorkerQuery(selectedLateWorker?.id ?? "", {
    skip: !selectedLateWorker?.id || selectedLateWorker.id.startsWith("name:"),
  });

  const { data: todayLiveMeta, isFetching: loadingLiveMeta } = useGetTodayLiveShiftMetaQuery();
  const { data: issueReports = [] } = useGetEscalationsQuery();
  const { data: inProgressRes } = useGetTodayLiveShiftsQuery({
    status: "in_progress",
    page: 1,
    limit: 10,
    sort: "-date_time",
  });
  
  
  const { data: todayShiftsRes, isFetching: fetchingLiveShifts, refetch: refetchLiveShifts } = useGetTodayLiveShiftsQuery({
    limit: 100,
    page: 1,
    sort: "-date_time",
    status: liveTab === "all" ? undefined : liveTab,
  });

  
  
  const [greetingHour, setGreetingHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const id = setInterval(() => setGreetingHour(new Date().getHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  
  const todayLiveShifts = useMemo(() => todayShiftsRes?.result ?? [], [todayShiftsRes]);



  const safeOverview = {
    greeting: "",
    subtitle_date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    attention_banner: {
      people_need_attention_count: 0,
      badge_text: t.dashboard.allOnTime,
      banner_subtitle: t.dashboard.noWorkersRequireAttention,
      call_pills: [] as AttentionPill[],
    },
    summary_cards: {
      active_shifts_count: 0,
      workers_on_site_count: 0,
      late_no_show_count: 0,
      reviews_pending_count: 0,
    },
    live_operations_by_client: [] as LiveOperationsClient[],
  };

  const pendingEscalations = issueReports.filter((issue) => isPendingIssue(issue.status)).length;
  const inProgressShifts = inProgressRes?.result ?? [];
  const inProgressTotal = inProgressRes?.meta.total ?? inProgressShifts.length;
  const cards = safeOverview.summary_cards;



  const absentPills: LateWorkerChip[] = (todayLiveMeta?.absent_workers ?? [])
    .filter((worker) => worker.worker_id || worker.name)
    .map((worker) => ({
      id: worker.worker_id,
      name: worker.name?.trim() || "Worker",
      detail: t.dashboard.absent,
    }));
  const needAttentionCount = Math.max(
    todayLiveMeta?.total_absent ?? 0,
    absentPills.length,
  );

  const liveOperationsRows = useMemo(() => {
    if (todayLiveShifts.length > 0) {
      const rows: Array<{
        id: string;
        planId: string;
        date: string;
        startTime?: string;
        endTime?: string;
        assignedWorkers: PlanRosterAssignedWorker[];
        worker_name: string;
        initials: string;
        profile_picture?: string;
        location_name: string;
        check_in_time: string;
        progress: number;
        status: "on_time" | "late" | "missing";
      }> = [];

      for (const shift of todayLiveShifts) {
        const locationName =
          shift.location?.name ||
          shift.location?.location ||
          (typeof shift.location === "string" ? shift.location : "") ||
          shift.client?.name ||
          "CleanOnes Location";
        const progress = Math.min(100, Math.max(0, shift.overall_progress_percent ?? (shift.status === "completed" ? 100 : 0)));
        const planId = planIdOfLiveShift(shift);
        const date = dateOfLiveShift(shift);
        const assignedWorkers = crewOfLiveShift(shift);
        const shiftFields = {
          planId,
          date,
          startTime: shift.date_time,
          endTime: undefined as string | undefined,
          assignedWorkers,
        };

        if (shift.assigned_workers && shift.assigned_workers.length > 0) {
          for (const w of shift.assigned_workers) {
            const rawStatus = (w.attendance_status || w.status || shift.status || "").toLowerCase();
            let status: "on_time" | "late" | "missing" = "on_time";
            if (rawStatus.includes("late")) {
              status = "late";
            } else if (rawStatus.includes("missing") || rawStatus.includes("no_show") || rawStatus.includes("show")) {
              status = "missing";
            } else if (progress === 0 && shift.status !== "upcoming") {
              status = "missing";
            }

            const checkIn = w.check_in_time || w.checkin_time
              ? formatTimeToHHMM(w.check_in_time || w.checkin_time)
              : shift.status === "in_progress" || shift.status === "completed"
              ? formatTimeToHHMM(shift.date_time || shift.date)
              : "---";

            rows.push({
              id: `${shift._id}-${w.worker_id}`,
              ...shiftFields,
              worker_name: w.name,
              initials: getInitials(w.name),
              profile_picture: w.profile_picture || w.profile_photo,
              location_name: locationName,
              check_in_time: checkIn,
              progress,
              status,
            });
          }
        } else {
          const planTitle = typeof shift.cleaning_plan === "object" ? shift.cleaning_plan?.title : "Shift";
          rows.push({
            id: shift._id,
            ...shiftFields,
            worker_name: planTitle || "Unassigned Shift",
            initials: getInitials(planTitle || "US"),
            location_name: locationName,
            check_in_time: shift.date_time ? formatTimeToHHMM(shift.date_time) : "---",
            progress,
            status: shift.status === "late" ? "late" : "on_time",
          });
        }
      }
      return rows;
    }

    return [];
  }, [todayLiveShifts]);

  
  
  const displayLiveRows = liveOperationsRows.slice(0, 6);

  const translateGreeting = (greeting: string) => {
    const localGreeting =
      greetingHour < 12
        ? t.dashboard.goodMorning
        : greetingHour < 17
          ? t.dashboard.goodAfternoon
          : t.dashboard.goodEvening;
    
    const match = greeting.match(/^Good (?:morning|afternoon|evening)(.*)$/i);
    return match ? `${localGreeting}${match[1]}` : localGreeting;
  };

  const modalWorkerName = selectedWorkerDetails?.name || selectedLateWorker?.name || "Worker";
  const modalWorkerPhone = selectedWorkerDetails?.phone || selectedLateWorker?.phone;
  const modalWorkerEmail = selectedWorkerDetails?.email || selectedLateWorker?.email;
  const modalWorkerPhoto = selectedWorkerDetails?.profile_photo || selectedLateWorker?.photo;

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-sky-600">{t.dashboard.overview}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{translateGreeting(safeOverview.greeting)}</h1>
          <p className="mt-1 text-sm text-slate-500">{safeOverview.subtitle_date}</p>
        </div>
      </header>

      
      <section className={`rounded-xl border p-4 ${needAttentionCount > 0 ? "border-red-200 bg-red-50/80" : "border-slate-200 bg-white"}`}>
        <div className="flex flex-wrap items-center gap-4">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${needAttentionCount > 0 ? "bg-red-100 text-red-500" : "bg-emerald-100 text-emerald-600"}`}>
            {needAttentionCount > 0 ? <MdWarningAmber className="text-2xl" /> : <MdCheckCircle className="text-2xl" />}
          </span>
          <div className="min-w-48 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className={`font-bold ${needAttentionCount > 0 ? "text-red-950" : "text-slate-900"}`}>
                {needAttentionCount} {t.dashboard.peopleNeedAttention}
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${needAttentionCount > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>
                {needAttentionCount > 0 ? `${needAttentionCount} ${t.dashboard.absent.toLowerCase()}` : t.dashboard.allOnTime}
              </span>
            </div>
            <p className={`mt-0.5 text-xs sm:text-sm ${needAttentionCount > 0 ? "text-red-600" : "text-slate-500"}`}>
              {needAttentionCount > 0
                ? copy.contactThemNow
                : t.dashboard.noWorkersRequireAttention}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {absentPills.length > 0 ? (
              absentPills.map((worker) => (
                  <button
                    type="button"
                    key={worker.id || worker.name}
                    onClick={() => setSelectedLateWorker(worker)}
                    aria-label={`View ${worker.name || "absent worker"}`}
                    title={`${worker.name || "Worker"} · ${t.dashboard.absent}`}
                    className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-red-100 bg-white text-[11px] font-bold tracking-wide text-red-600 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    {nameInitials(worker.name)}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                  </button>
              ))
            ) : loadingLiveMeta && !todayLiveMeta ? (
              <span className="h-10 w-10 animate-pulse rounded-full border border-red-100 bg-white" />
            ) : (
              <span className="rounded-lg border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                {t.dashboard.allShiftsOnSchedule}
              </span>
            )}
          </div>
        </div>
      </section>

      
      <section className={`rounded-xl border p-4 ${inProgressShifts.length > 0 ? "border-sky-200 bg-sky-50/50" : "border-slate-200 bg-white"}`}>
        <div className="flex items-center gap-2">
          <MdAccessTime className={`text-lg ${inProgressShifts.length > 0 ? "text-sky-600" : "text-slate-400"}`} />
          <h2 className="font-bold text-sm sm:text-base text-slate-900">
            {t.dashboard.fallingBehindSchedule}
          </h2>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${inProgressShifts.length > 0 ? "bg-sky-100 text-sky-800 border border-sky-200" : "bg-slate-100 text-slate-600"}`}>
            {inProgressTotal} {t.dashboard.alerts}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {inProgressShifts.length > 0 ? t.dashboard.shiftNearlyOver : t.dashboard.allActiveShiftsProgressing}
        </p>
        {inProgressShifts.length > 0 && (
          <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
            {inProgressShifts.map((shift) => {
              const progress = Math.min(100, Math.max(0, shift.overall_progress_percent ?? 0));
              const planTitle =
                typeof shift.cleaning_plan === "object"
                  ? shift.cleaning_plan?.title
                  : shift.cleaning_plan || "Shift";
              const locationName = shift.location?.name || shift.client?.name || "—";
              const startTime = formatTimeToHHMM(shift.date_time || shift.date);
              const endTime = formatTimeToHHMM(shift.end_time);
              const planId = planIdOfLiveShift(shift);
              return (
                <button
                  type="button"
                  key={shift._id}
                  onClick={() => {
                    if (!planId) return;
                    setViewingLiveShift({
                      planId,
                      date: dateOfLiveShift(shift),
                      startTime: shift.date_time,
                      endTime: shift.end_time,
                      assignedWorkers: crewOfLiveShift(shift),
                    });
                  }}
                  className="cursor-pointer rounded-lg border border-sky-100 bg-white p-3 text-left shadow-2xs transition-colors hover:border-sky-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[11px] font-bold text-white">
                      {getInitials(planTitle || "S")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="block truncate text-sm text-slate-900">{planTitle}</b>
                      <p className="truncate text-xs text-slate-500">
                        {locationName} · {startTime}–{endTime}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-sky-600">{progress}%</span>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      
      <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Metric
          icon={<MdCalendarToday />}
          value={todayLiveMeta?.today_total_shift ?? todayLiveMeta?.total_shift ?? cards.active_shifts_count}
          label={ui.totalShifts}
          tone="bg-blue-50 text-blue-600"
          href="/shift-monitoring"
        />
        <Metric
          icon={<MdAccessTime />}
          value={todayLiveMeta?.today_total_in_progress_shift ?? todayLiveMeta?.in_progress ?? cards.active_shifts_count}
          label={ui.inProgress}
          tone="bg-sky-50 text-sky-600"
          href="/shift-monitoring?status=inprogress"
        />
        <Metric
          icon={<MdCheckCircle />}
          value={todayLiveMeta?.today_total_completed_shift ?? todayLiveMeta?.completed_shift ?? 0}
          label={ui.completed}
          tone="bg-emerald-50 text-emerald-600"
          href="/shift-monitoring?status=complete"
        />
        <Metric
          icon={<MdAccessTime />}
          value={todayLiveMeta?.today_total_pending_shift ?? todayLiveMeta?.pending ?? 0}
          label={ui.pendingShifts}
          tone="bg-indigo-50 text-indigo-600"
          href="/shift-monitoring?status=upcoming"
        />
        <Metric
          icon={<MdWarningAmber />}
          value={needAttentionCount}
          label={ui.absentWorkers}
          tone="bg-red-50 text-red-600"
          href="/shift-monitoring/attendance-and-time-tracking"
        />
        <Metric
          icon={<MdReportProblem />}
          value={pendingEscalations}
          label={ui.issueReports}
          tone="bg-amber-50 text-amber-600"
          href="/escalations"
        />
      </div>

      <section className="dashboard-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-base text-sky-500">⚡</span>
          <h2 className="text-sm font-bold text-slate-800">{ui.quickActions}</h2>
        </div>
        <div className="flex w-full flex-wrap gap-2">
          {[
            { label: t.plans.createPlan, href: "/cleaning-plans", icon: <MdAdd />, tone: "bg-sky-500 hover:bg-sky-600" },
            { label: t.nav.clients, href: "/clients", icon: <MdBusiness />, tone: "bg-violet-500 hover:bg-violet-600" },
            { label: t.nav.locations, href: "/locations", icon: <MdLocationOn />, tone: "bg-cyan-500 hover:bg-cyan-600" },
            { label: t.nav.photoReviews, href: "/photo-reviews", icon: <MdPhotoCamera />, tone: "bg-pink-500 hover:bg-pink-600" },
            { label: t.nav.roster, href: "/roster", icon: <MdViewWeek />, tone: "bg-emerald-500 hover:bg-emerald-600" },
            { label: t.nav.workers, href: "/workers", icon: <MdGroups />, tone: "bg-amber-500 hover:bg-amber-600" },
            { label: t.nav.reports, href: "/reports", icon: <MdAssessment />, tone: "bg-slate-600 hover:bg-slate-700" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`inline-flex h-9 min-w-[120px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${action.tone}`}
            >
              <span className="text-sm">{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      
      <section className="dashboard-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">{ui.liveOperations}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex max-w-full overflow-x-auto rounded border border-gray-200 bg-gray-50 p-0.5 text-xs font-medium">
              {(['all', 'upcoming', 'in_progress', 'completed'] as const).map((tab) => {
                const active = liveTab === tab;
                const label =
                  tab === 'all'
                    ? t.dashboard.all
                    : tab === 'in_progress'
                    ? ui.inProgress
                    : tab === 'upcoming'
                    ? ui.upcoming
                    : ui.completed;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setLiveTab(tab)}
                    disabled={fetchingLiveShifts}
                    className={`h-7 rounded px-3 transition-colors cursor-pointer disabled:cursor-wait ${
                      active
                        ? 'border border-gray-200 bg-white text-primary font-semibold shadow-2xs'
                        : 'border border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <Link
              href="/shift-monitoring"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline inline-flex items-center gap-0.5 ml-1"
            >
              {ui.viewAll} &gt;
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {displayLiveRows.map((row) => (
            <button
              type="button"
              key={row.id}
              onClick={() => {
                if (!row.planId) return;
                setViewingLiveShift({
                  planId: row.planId,
                  date: row.date,
                  startTime: row.startTime,
                  endTime: row.endTime,
                  assignedWorkers: row.assignedWorkers,
                });
              }}
              className="group flex w-full cursor-pointer items-center justify-between gap-3 p-3.5 text-left sm:px-5 hover:bg-slate-50/70 transition-colors"
            >
              
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {row.profile_picture ? (
                  <img
                    src={row.profile_picture}
                    alt={row.worker_name}
                    className="h-10 w-10 rounded-full object-cover shrink-0 border border-slate-100"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white shadow-2xs">
                    {row.initials}
                  </div>
                )}
                <div className="min-w-0">
                  <b className="block text-sm font-semibold truncate text-slate-900">{row.worker_name}</b>
                  <span className="flex items-center gap-1 text-xs text-slate-400 truncate">
                    <MdLocationOn className="text-xs shrink-0" />
                    {row.location_name}
                  </span>
                </div>
              </div>

              
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                
                <div className="text-right min-w-[50px] hidden xs:block sm:block">
                  <span className="block text-[10px] text-slate-400 font-medium">{ui.checkIn}</span>
                  <span className="block text-xs font-bold text-slate-800 mt-0.5">{row.check_in_time}</span>
                </div>

                
                <div className="w-24 sm:w-28 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-800">
                    <span className="text-[10px] text-slate-400 font-normal">{ui.progress}</span>
                    <span>{row.progress}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        row.status === 'late'
                          ? 'bg-amber-500'
                          : row.status === 'missing'
                          ? 'bg-red-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(row.progress, 0))}%` }}
                    />
                  </div>
                </div>

                
                <div className="min-w-[75px] flex items-center justify-start gap-1 text-xs font-semibold">
                  {row.status === 'late' ? (
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Late
                    </span>
                  ) : row.status === 'missing' ? (
                    <span className="flex items-center gap-1.5 text-red-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {ui.missing}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {ui.onTime}
                    </span>
                  )}
                </div>

                
                <MdChevronRight className="text-slate-300 text-lg group-hover:text-slate-600" />
              </div>
            </button>
          ))}

          {displayLiveRows.length === 0 && (
            <p className="py-12 text-center text-xs text-slate-400">{ui.noShiftsFound}</p>
          )}
        </div>
      </section>

      
      <Link href="/escalations" className="dashboard-card flex items-center gap-4 p-5 hover:border-amber-300 transition-colors">
        <MdWarningAmber className={`text-2xl ${pendingEscalations > 0 ? "text-amber-500" : "text-slate-400"}`} />
        <div>
          <p className="font-bold text-slate-900">{pendingEscalations} {t.dashboard.openEscalations}</p>
          <p className="text-xs text-slate-500">
            {pendingEscalations > 0
              ? `${pendingEscalations} pending ${pendingEscalations === 1 ? "report needs" : "reports need"} review.`
              : t.dashboard.allEscalationsResolved}
          </p>
        </div>
        <MdArrowForward className="ml-auto text-slate-400" />
      </Link>

      {viewingLiveShift && (
        <PlanDetailModal
          planId={viewingLiveShift.planId}
          shiftDate={viewingLiveShift.date || undefined}
          assignedWorkers={viewingLiveShift.assignedWorkers}
          shiftSchedule={{
            date: viewingLiveShift.date,
            startTime: viewingLiveShift.startTime,
            endTime: viewingLiveShift.endTime,
          }}
          onClose={() => setViewingLiveShift(null)}
          onAssigned={() => {
            void refetchLiveShifts();
          }}
        />
      )}

      {selectedLateWorker && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-[1px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedLateWorker(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Absent worker details"
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-sm font-bold text-slate-900">{t.dashboard.absent}</p>
                <p className="mt-0.5 text-xs font-medium text-red-500">{selectedLateWorker.detail || t.dashboard.absent}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLateWorker(null)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <MdClose className="text-lg" />
              </button>
            </div>

            <div className="p-5">
              {loadingWorkerDetails ? (
                <div className="mb-4 h-1 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full w-1/2 animate-pulse rounded-full bg-sky-400" />
                </div>
              ) : null}
              {workerDetailsError ? (
                <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] text-red-600">
                  {apiError(workerDetailsError)}
                </p>
              ) : null}

              <div className="flex items-center gap-3">
                {modalWorkerPhoto ? (
                  <img
                    src={modalWorkerPhoto}
                    alt={modalWorkerName}
                    className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                    {nameInitials(modalWorkerName)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-slate-900">{modalWorkerName}</p>
                  <p className="text-xs text-slate-500">
                    {[selectedWorkerDetails?.worker_type, selectedWorkerDetails?.position].filter(Boolean).join(" · ") || "Employee details"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                  <MdPerson className="shrink-0 text-slate-400" />
                  <span className="min-w-0 truncate text-xs font-medium text-slate-700">{modalWorkerName}</span>
                </div>
                {modalWorkerEmail ? (
                  <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                    <MdEmail className="shrink-0 text-slate-400" />
                    <span className="min-w-0 truncate text-xs font-medium text-slate-700">{modalWorkerEmail}</span>
                  </div>
                ) : null}
                {modalWorkerPhone ? (
                  <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                    <MdPhone className="shrink-0 text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">{modalWorkerPhone}</span>
                  </div>
                ) : null}
                {selectedWorkerDetails?.address ? (
                  <div className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                    <MdLocationOn className="mt-0.5 shrink-0 text-slate-400" />
                    <span className="text-xs font-medium leading-5 text-slate-700">{selectedWorkerDetails.address}</span>
                  </div>
                ) : null}
              </div>

              {dialHref(modalWorkerPhone) ? (
                <a
                  href={dialHref(modalWorkerPhone)}
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-600"
                >
                  <MdPhone className="text-lg" /> Call worker
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-5 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-semibold text-slate-400"
                >
                  <MdPhone className="text-lg" /> Phone number unavailable
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
  tone,
  href,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`View ${label}`}
      className="dashboard-card group min-h-32 cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-200"
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${tone}`}>{icon}</span>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
      <p className="flex items-center gap-1 text-xs text-slate-500">
        {label}
        <MdChevronRight className="translate-x-0 text-sm opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
      </p>
    </Link>
  );
}


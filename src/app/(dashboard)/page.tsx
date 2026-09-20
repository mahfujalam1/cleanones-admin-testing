"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetWorkerListQuery } from "@/redux/api/endpoints/workers.api";
import { MdAccessTime, MdArrowForward, MdCalendarToday, MdCheckCircle, MdChevronRight, MdClose, MdEmail, MdLocationOn, MdPerson, MdPhone, MdReportProblem, MdWarningAmber } from "react-icons/md";
import {
  useGetTodayLiveShiftMetaQuery,
  useGetTodayLiveShiftsQuery,
  useGetWorkerAttendanceListQuery,
} from "@/redux/api/shiftsApi";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation, getUiTranslation } from "@/lib/translations";

const normalizeStatus = (value: string) => value.toLowerCase().replaceAll(" ", "_");
/**
 * Shapes the dashboard's zero state is built from. The current API has no endpoint that fills
 * them, so these lists stay empty until one lands.
 */
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

type FallingBehindShift = {
  shift_id: string;
  worker_id: string;
  worker_name: string;
  worker_profile_picture: string;
  location_id: string;
  location_name: string;
  worker_checkin_time: string;
  shift_start_time: string;
  shift_end_time: string;
  progress: number;
  progress_percentage: string;
  checkin_status: string;
};

/**
 * Permanently empty until the endpoints that used to fill them land. They are module level so
 * their identity is stable across renders and the memos below do not re-run every time.
 */
const NO_ATTENTION_PILLS: readonly AttentionPill[] = [];
const NO_FALLING_BEHIND: readonly FallingBehindShift[] = [];


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

function formatLateDuration(start?: string, checkIn?: string): string {
  if (!start) return "Late";
  const from = new Date(start);
  if (Number.isNaN(from.getTime())) return "Late";
  const until = checkIn ? new Date(checkIn) : new Date();
  if (Number.isNaN(until.getTime()) || until.getTime() <= from.getTime()) return "Late";
  const totalMinutes = Math.floor((until.getTime() - from.getTime()) / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m late`;
  if (hours > 0) return `${hours}h late`;
  return `${minutes}m late`;
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

/** Merge late workers from attendance, overview pills, and live-shift status. */
function collectLateWorkers(
  attendanceToday: Array<{ worker_id: string; name: string; late_days: number }> | undefined,
  pills: AttentionPill[],
  behind: readonly FallingBehindShift[],
  liveShifts: Array<{
    date_time?: string;
    date?: string;
    assigned_workers?: Array<{
      worker_id: string;
      name: string;
      attendance_status?: string;
      status?: string;
      check_in_time?: string;
      checkin_time?: string;
      profile_picture?: string;
      profile_photo?: string;
      phone?: string;
      phone_number?: string;
    }>;
  }>,
  lateLabel: string,
): LateWorkerChip[] {
  const found = new Map<string, LateWorkerChip>();
  const remember = (
    id?: string,
    name?: string,
    detail?: string,
    extra?: { phone?: string; photo?: string },
  ) => {
    if (!id) return;
    const prev = found.get(id);
    found.set(id, {
      id,
      name: name || prev?.name || "",
      detail: detail || prev?.detail || lateLabel,
      phone: extra?.phone || prev?.phone,
      photo: extra?.photo || prev?.photo,
    });
  };

  (attendanceToday ?? [])
    .filter((row) => row.late_days > 0)
    .forEach((row) => remember(row.worker_id, row.name, lateLabel));
  pills.forEach((pill) =>
    remember(pill.worker_id, pill.worker_name, pill.late_duration_text, { phone: pill.phone_number }),
  );
  behind.forEach((shift) =>
    remember(shift.worker_id, shift.worker_name, shift.checkin_status, { photo: shift.worker_profile_picture }),
  );
  liveShifts.forEach((shift) =>
    (shift.assigned_workers ?? []).forEach((worker) => {
      const status = normalizeStatus(worker.attendance_status || worker.status || "");
      if (status.includes("late") || status.includes("show") || status.includes("missing")) {
        remember(
          worker.worker_id,
          worker.name,
          formatLateDuration(shift.date_time || shift.date, worker.check_in_time || worker.checkin_time),
          {
            phone: worker.phone || worker.phone_number,
            photo: worker.profile_picture || worker.profile_photo,
          },
        );
      }
    }),
  );

  return Array.from(found.values());
}

export default function DashboardPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = getDashboardTranslation(locale);
  const ui = getUiTranslation(locale);

  const [liveTab, setLiveTab] = useState<
    "all" | "upcoming" | "in_progress" | "completed" | "cancelled"
  >("all");
  const [selectedLateWorker, setSelectedLateWorker] = useState<LateWorkerChip | null>(null);

  const { data: todayLiveMeta } = useGetTodayLiveShiftMetaQuery();
  // Names the late workers the meta only counts.
  const { data: attendanceToday } = useGetWorkerAttendanceListQuery({ period: "today" });
  // The Live Operations tabs are sent to the API as `status`, so each tab is its own request
  // rather than a slice of one cached list.
  const { data: todayShiftsRes, isFetching: fetchingLiveShifts } = useGetTodayLiveShiftsQuery({
    limit: 100,
    page: 1,
    sort: "-date_time",
    status: liveTab === "all" ? undefined : liveTab,
  });
  const { data: todayAllShiftsRes } = useGetTodayLiveShiftsQuery({
    limit: 100,
    page: 1,
    sort: "-date_time",
  });

  // The API's greeting is built from the server clock, so the time of day is taken from the
  // viewer's own timezone instead and re-checked each minute in case a boundary passes.
  const [greetingHour, setGreetingHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const id = setInterval(() => setGreetingHour(new Date().getHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  // `?? []` would be a fresh array each render and re-run every memo that depends on it.
  const todayLiveShifts = useMemo(() => todayShiftsRes?.result ?? [], [todayShiftsRes]);
  const todayAllShifts = useMemo(() => todayAllShiftsRes?.result ?? [], [todayAllShiftsRes]);

  /**
   * The dashboard overview route was dropped from the backend and the current API has no
   * replacement for it, so the page renders its own zero state until one lands.
   */
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
    open_escalations_banner: {
      open_escalations_count: 0,
      subtitle: t.dashboard.allEscalationsResolved,
      action_url: "/escalations",
    }
  };

  const attentionPills = NO_ATTENTION_PILLS;
  const fallingBehind = NO_FALLING_BEHIND;
  /**
   * Three endpoints each know about late workers and none of them knows about all of them:
   * the overview returns call pills, the in-progress feed flags check-in status, and the live
   * shift list carries attendance per assigned worker. They are merged and de-duplicated by
   * worker id so the banner shows one chip per person, whichever source spotted them.
   */
  const lateWorkers = collectLateWorkers(
    attendanceToday,
    [...attentionPills],
    fallingBehind,
    todayAllShifts,
    t.dashboard.late,
  );

  const cards = safeOverview.summary_cards;
  /**
   * The roster fills in phone numbers so the call button can open Chrome's dialer.
   */
  const { data: workerRoster } = useGetWorkerListQuery(
    { page: 1, limit: 200 },
    { skip: lateWorkers.length === 0 },
  );

  const lateCallPills = lateWorkers.map((worker) => {
    const match = (workerRoster?.result ?? []).find(
      (item) => item._id === worker.id || item.user === worker.id,
    );
    return {
      ...worker,
      name: worker.name || match?.name || "",
      email: match?.email,
      phone: worker.phone || match?.phone,
      photo: worker.photo || match?.profile_photo,
    };
  });



  /**
   * The banner used to trust `people_need_attention_count` alone, while the Late Workers card
   * reads the live-shift meta. The two endpoints disagree, so a late worker could be counted
   * on the card and still show "All on time" above it. The banner now takes the highest of
   * every signal available: the overview count, the live late/no-show total, the pills the
   * overview itself returned, and the in-progress shifts flagged late or missing.
   */
  const lateWorkerCount = todayLiveMeta?.today_total_worker_late ?? cards.late_no_show_count ?? 0;
  const needAttentionCount = Math.max(
    safeOverview.attention_banner.people_need_attention_count ?? 0,
    lateWorkerCount,
    attentionPills.length,
    fallingBehind.length,
    lateWorkers.length,
  );

  const liveOperationsRows = useMemo(() => {
    if (todayLiveShifts.length > 0) {
      const rows: Array<{
        id: string;
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

  // The tabs are shift lifecycle statuses and the row badge is check-in punctuality, so there
  // is nothing to re-filter here — the request itself is already scoped by `status`.
  const displayLiveRows = liveOperationsRows.slice(0, 6);

  const translateGreeting = (greeting: string) => {
    const localGreeting =
      greetingHour < 12
        ? t.dashboard.goodMorning
        : greetingHour < 17
          ? t.dashboard.goodAfternoon
          : t.dashboard.goodEvening;
    // Whatever the API put after its own "Good …" (the manager's name, say) is kept.
    const match = greeting.match(/^Good (?:morning|afternoon|evening)(.*)$/i);
    return match ? `${localGreeting}${match[1]}` : localGreeting;
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-sky-600">{t.dashboard.overview}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{translateGreeting(safeOverview.greeting)}</h1>
          <p className="mt-1 text-sm text-slate-500">{safeOverview.subtitle_date}</p>
        </div>
      </header>

      {/* Red Attention Banner */}
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
                {needAttentionCount > 0 ? `${needAttentionCount} ${t.dashboard.late.toLowerCase()}` : t.dashboard.allOnTime}
              </span>
            </div>
            <p className={`mt-0.5 text-xs sm:text-sm ${needAttentionCount > 0 ? "text-red-600" : "text-slate-500"}`}>
              {needAttentionCount > 0
                ? "Contact them now or arrange a replacement."
                : t.dashboard.noWorkersRequireAttention}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {lateCallPills.length > 0 ? (
              lateCallPills.map((worker) => (
                  <button
                    type="button"
                    key={worker.id}
                    onClick={() => setSelectedLateWorker(worker)}
                    aria-label={`View ${worker.name || "late worker"}`}
                    title={`${worker.name || "Worker"} · ${worker.detail || t.dashboard.late}`}
                    className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-white shadow-sm ring-2 ring-red-100 transition-transform hover:-translate-y-0.5 hover:ring-red-200 focus:outline-none focus:ring-red-300"
                  >
                    {worker.photo ? (
                      <img
                        src={worker.photo}
                        alt={worker.name || "Late worker"}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-sky-100 text-[11px] font-bold text-sky-700">
                        {getInitials(worker.name)}
                      </span>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-red-500" />
                  </button>
              ))
            ) : needAttentionCount > 0 ? (
              <span className="rounded-lg border border-red-200/80 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
                {lateWorkerCount || needAttentionCount} {ui.lateWorkers}
              </span>
            ) : (
              <span className="rounded-lg border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                {t.dashboard.allShiftsOnSchedule}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Work in Progress Banner */}
      <section className={`rounded-xl border p-4 ${fallingBehind.length > 0 ? "border-sky-200 bg-sky-50/50" : "border-slate-200 bg-white"}`}>
        <div className="flex items-center gap-2">
          <MdAccessTime className={`text-lg ${fallingBehind.length > 0 ? "text-sky-600" : "text-slate-400"}`} />
          <h2 className="font-bold text-sm sm:text-base text-slate-900">
            {t.dashboard.fallingBehindSchedule}
          </h2>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${fallingBehind.length > 0 ? "bg-sky-100 text-sky-800 border border-sky-200" : "bg-slate-100 text-slate-600"}`}>
            {fallingBehind.length} {t.dashboard.alerts}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {fallingBehind.length > 0 ? t.dashboard.shiftNearlyOver : t.dashboard.allActiveShiftsProgressing}
        </p>
        {fallingBehind.length > 0 && (
          <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
            {fallingBehind.slice(0, 6).map((item) => {
              const progress = Number.parseFloat(item.progress_percentage) || item.progress;
              return (
                <div key={`${item.shift_id}-${item.worker_id}`} className="rounded-lg border border-sky-100 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <img src={item.worker_profile_picture || "/avatar-placeholder.svg"} alt={item.worker_name} className="h-9 w-9 rounded-full object-cover border border-slate-100" />
                    <div className="flex-1 min-w-0">
                      <b className="block text-sm truncate text-slate-900">{item.worker_name}</b>
                      <p className="text-xs text-slate-500 truncate">{item.location_name} · {item.shift_start_time}–{item.shift_end_time}</p>
                    </div>
                    <span className="text-xs font-bold text-sky-600 shrink-0">{item.progress_percentage || `${progress}%`}</span>
                  </div>
                  <div className="mt-2.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Summary Cards from /shift/today-live-shift-meta */}
      <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Metric
          icon={<MdCalendarToday />}
          value={todayLiveMeta?.today_total_shift ?? todayLiveMeta?.total_shift ?? cards.active_shifts_count}
          label={ui.totalShifts}
          tone="bg-blue-50 text-blue-600"
        />
        <Metric
          icon={<MdAccessTime />}
          value={todayLiveMeta?.today_total_in_progress_shift ?? todayLiveMeta?.in_progress ?? cards.active_shifts_count}
          label={ui.inProgress}
          tone="bg-sky-50 text-sky-600"
        />
        <Metric
          icon={<MdCheckCircle />}
          value={todayLiveMeta?.today_total_completed_shift ?? todayLiveMeta?.completed_shift ?? 0}
          label={ui.completed}
          tone="bg-emerald-50 text-emerald-600"
        />
        <Metric
          icon={<MdAccessTime />}
          value={todayLiveMeta?.today_total_pending_shift ?? todayLiveMeta?.pending ?? 0}
          label={ui.pendingShifts}
          tone="bg-indigo-50 text-indigo-600"
        />
        <Metric
          icon={<MdWarningAmber />}
          value={todayLiveMeta?.today_total_worker_late ?? cards.late_no_show_count}
          label={ui.lateWorkers}
          tone="bg-red-50 text-red-600"
        />
        <Metric
          icon={<MdReportProblem />}
          value={todayLiveMeta?.total_issue_report ?? cards.reviews_pending_count}
          label={ui.issueReports}
          tone="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Live Operations Widget */}
      <section className="dashboard-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">{ui.liveOperations}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex max-w-full overflow-x-auto rounded border border-gray-200 bg-gray-50 p-0.5 text-xs font-medium">
              {(['all', 'upcoming', 'in_progress', 'completed', 'cancelled'] as const).map((tab) => {
                const active = liveTab === tab;
                const label =
                  tab === 'all'
                    ? t.dashboard.all
                    : tab === 'in_progress'
                    ? ui.inProgress
                    : tab === 'upcoming'
                    ? ui.upcoming
                    : tab === 'completed'
                    ? ui.completed
                    : ui.cancelled;
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
              View all &gt;
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {displayLiveRows.map((row) => (
            <Link
              key={row.id}
              href="/shift-monitoring"
              className="flex items-center justify-between gap-3 p-3.5 sm:px-5 hover:bg-slate-50/70 transition-colors"
            >
              {/* Left: Avatar + Name + Location */}
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

              {/* Right side: Check-In, Progress, Status, Chevron */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                {/* Check-In */}
                <div className="text-right min-w-[50px] hidden xs:block sm:block">
                  <span className="block text-[10px] text-slate-400 font-medium">{ui.checkIn}</span>
                  <span className="block text-xs font-bold text-slate-800 mt-0.5">{row.check_in_time}</span>
                </div>

                {/* Progress */}
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

                {/* Status Badge */}
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

                {/* Arrow */}
                <MdChevronRight className="text-slate-300 text-lg hover:text-slate-600" />
              </div>
            </Link>
          ))}

          {displayLiveRows.length === 0 && (
            <p className="py-12 text-center text-xs text-slate-400">{ui.noShiftsFound}</p>
          )}
        </div>
      </section>

      {/* Escalations Banner */}
      <Link href="/escalations" className="dashboard-card flex items-center gap-4 p-5 hover:border-amber-300 transition-colors">
        <MdWarningAmber className="text-2xl text-amber-500" />
        <div>
          <p className="font-bold text-slate-900">{safeOverview.open_escalations_banner.open_escalations_count} {t.dashboard.openEscalations}</p>
          <p className="text-xs text-slate-500">{safeOverview.open_escalations_banner.subtitle || t.dashboard.allEscalationsResolved}</p>
        </div>
        <MdArrowForward className="ml-auto text-slate-400" />
      </Link>

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
            aria-label="Late worker details"
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Late worker</p>
                <p className="mt-0.5 text-xs font-medium text-red-500">{selectedLateWorker.detail || t.dashboard.late}</p>
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
              <div className="flex items-center gap-3">
                {selectedLateWorker.photo ? (
                  <img
                    src={selectedLateWorker.photo}
                    alt={selectedLateWorker.name}
                    className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                    {getInitials(selectedLateWorker.name)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-slate-900">{selectedLateWorker.name || "Worker"}</p>
                  <p className="text-xs text-slate-500">Employee details</p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                  <MdPerson className="shrink-0 text-slate-400" />
                  <span className="min-w-0 truncate text-xs font-medium text-slate-700">{selectedLateWorker.name || "Not available"}</span>
                </div>
                {selectedLateWorker.email ? (
                  <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                    <MdEmail className="shrink-0 text-slate-400" />
                    <span className="min-w-0 truncate text-xs font-medium text-slate-700">{selectedLateWorker.email}</span>
                  </div>
                ) : null}
                {selectedLateWorker.phone ? (
                  <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                    <MdPhone className="shrink-0 text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">{selectedLateWorker.phone}</span>
                  </div>
                ) : null}
              </div>

              {dialHref(selectedLateWorker.phone) ? (
                <a
                  href={dialHref(selectedLateWorker.phone)}
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

function Metric({ icon, value, label, tone }: { icon: React.ReactNode; value: number; label: string; tone: string }) {
  return (
    <div className="dashboard-card min-h-32 p-5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xl ${tone}`}>{icon}</span>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}


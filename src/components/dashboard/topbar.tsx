"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getLocale, localizePath, LOCALE_OPTIONS, setLocale, stripLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
import {
  MdChevronRight,
  MdClose,
  MdHelpOutline,
  MdKeyboardArrowDown,
  MdLanguage,
  MdLogout,
  MdMenu,
  MdNotificationsNone,
  MdOutlineEmail,
  MdOutlinePerson,
  MdOutlineSettings,
  MdSend,
  MdSupportAgent,
} from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSignOutModalOpen, toggleMobileSidebar } from "@/redux/slices/ui.slice";
import { useModalJump } from "@/hooks/useModalJump";
import {
  useGetNotificationsQuery,
  useSeeNotificationsMutation,
  type NotificationItem,
} from "@/redux/api/endpoints/notifications.api";
import { useGetManageFaqsQuery } from "@/redux/api/manageFaqApi";
import type { ManageFaq } from "@/services/actions/faqs";
import { resolveNotificationRoute } from "@/lib/notification-routes";
import { CountBadge } from "@/components/shared/CountBadge";
import { DetailSkeleton } from "@/components/shared/SkeletonLoader";

const prefetchRoutes = process.env.NODE_ENV === 'production';

const fallbackFaqs: ManageFaq[] = [
  "How do I assign a shift to a cleaner?",
  "How do I review and approve photos?",
  "What happens when a GPS alert is triggered?",
  "How do I add a new client or location?",
  "How do I change my password?",
].map((question, index) => ({ _id: String(index), question, answer: "" }));

import { getDashboardTranslation } from "@/lib/translations";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState(() => getLocale(pathname));
  const routePath = stripLocale(pathname);
  const t = getDashboardTranslation(currentLocale);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const handleLocaleChange = () => {
      setCurrentLocale(getLocale(pathname));
      router.refresh();
    };
    window.addEventListener("cleanones_locale_changed", handleLocaleChange);
    return () => window.removeEventListener("cleanones_locale_changed", handleLocaleChange);
  }, [pathname, router]);
  const {
    data: notifData,
    isLoading: notificationsLoading,
    refetch: refetchNotifs,
  } = useGetNotificationsQuery({
    page: 1,
    limit: 5,
    sort: "-createdAt",
  });
  const [seeNotificationsMutation] = useSeeNotificationsMutation();

  const notificationPreview: NotificationItem[] = notifData?.result ?? [];
  const unreadCount = notifData?.meta?.unreadCount ?? notificationPreview.filter((item) => !item.isRead).length;
  const languageRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const getTitle = () => {
    if (routePath === "/") return t.nav.dashboard;
    const path = routePath.split("/")[1];
    if (!path) return t.nav.dashboard;
    const keyMap: Record<string, string> = {
      roster: t.nav.roster,
      "shift-monitoring": t.nav.shiftMonitoring,
      users: t.nav.workers,
      clients: t.nav.clients,
      chat: t.nav.chat,
      locations: t.nav.locations,
      rooms: t.nav.rooms,
      "cleaning-plans": t.nav.cleaningPlans,
      "extra-services": t.nav.extraServices,
      "photo-reviews": t.nav.photoReviews,
      escalations: t.nav.escalations,
      reports: t.nav.reports,
      notifications: t.nav.notifications,
      settings: t.nav.settings,
      profile: "Admin Profile",
      "manager-access": t.nav.managerAccess,
    };
    return keyMap[path] || path.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const closeMenus = () => {
    setLanguageOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !languageRef.current?.contains(target) &&
        !notificationsRef.current?.contains(target) &&
        !profileRef.current?.contains(target)
      ) {
        closeMenus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenus();
        setHelpOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* The header owns a stacking context, so this value — not the z-[80] on the menus
          inside it — is what decides whether a dropdown paints over the page. Sticky
          table headers on Roster and Shift Monitoring sit at z-30/z-40, and modals start
          at z-[70], so the navbar belongs between them. */}
      <header className="relative z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border bg-sidebar px-3 shadow-none sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Mobile/tablet hamburger - always visible below lg */}
          <button
            type="button"
            onClick={() => dispatch(toggleMobileSidebar())}
            className="lg:hidden text-gray-500 hover:text-gray-700 cursor-pointer p-1 shrink-0"
          >
            <MdMenu className="text-2xl" />
          </button>

          <img src="/cleanones.png" className="hidden h-auto w-16 shrink-0 object-contain sm:block" alt="CleanOnes" />
          <span className="hidden h-6 w-px bg-border sm:block" />

          <h1 className="truncate text-sm font-semibold text-[var(--color-foreground)] sm:text-lg">
            {getTitle()}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
          <div ref={languageRef} className="relative hidden sm:block">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={languageOpen}
              onClick={() => {
                setLanguageOpen((open) => !open);
                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
              className={`flex h-8 cursor-pointer items-center gap-1.5 rounded border border-border bg-white px-2.5 text-[11px] font-semibold shadow-[var(--shadow-xs)] transition-colors hover:bg-muted/60 hover:text-foreground ${languageOpen ? "bg-muted/60 text-foreground" : "text-muted-foreground"}`}
            >
              <MdLanguage className="text-sm" />
              <span>{currentLocale.toUpperCase()}</span>
            </button>

            {/* Kept mounted so opening and closing both animate. */}
            <div
              role="menu"
              aria-hidden={!languageOpen}
              className={`shadow absolute right-0 top-10 z-[80] w-36 origin-top-right overflow-hidden rounded border border-border bg-white py-1 transition-all duration-150 ease-out ${languageOpen
                ? "visible translate-y-0 scale-100 opacity-100"
                : "invisible -translate-y-1 scale-95 opacity-0"
                }`}
            >
              {LOCALE_OPTIONS.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  role="menuitem"
                  tabIndex={languageOpen ? 0 : -1}
                  onClick={() => {
                    setLocale(language.code);
                    setLanguageOpen(false);
                    router.refresh();
                  }}
                  className={`block w-full cursor-pointer px-4 py-3 text-left text-sm transition-colors ${currentLocale === language.code
                    ? "bg-[#e0f2fe] text-[#0ea5e9]"
                    : "text-slate-800 hover:bg-gray-50"
                    }`}
                >
                  {language.label}
                </button>
              ))}
            </div>
          </div>

          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              onClick={() => {
                const nextOpen = !notificationsOpen;
                setNotificationsOpen(nextOpen);
                if (nextOpen) {
                  void refetchNotifs();
                }
                setLanguageOpen(false);
                setProfileOpen(false);
              }}
              className="relative flex h-8 w-8 items-center justify-center rounded border border-border bg-white text-muted-foreground shadow-[var(--shadow-xs)] transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <MdNotificationsNone className="text-lg" />
              <CountBadge
                count={unreadCount}
                label="unread notifications"
                className="absolute -right-1.5 -top-1.5"
              />
            </button>

            {notificationsOpen && (
              <NotificationsPopover
                locale={currentLocale}
                items={notificationPreview}
                loading={notificationsLoading}
                onItemClick={(item) => {
                  setNotificationsOpen(false);
                  const target = resolveNotificationRoute(item);
                  if (target) {
                    router.push(localizePath(target, currentLocale));
                  }
                }}
                onMarkAllRead={async () => {
                  try {
                    await seeNotificationsMutation().unwrap();
                    void refetchNotifs();
                  } catch {}
                }}
              />
            )}
          </div>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setLanguageOpen(false);
                setNotificationsOpen(false);
              }}
              className="flex h-8 items-center gap-2 rounded border border-transparent bg-transparent px-1.5 text-left transition-colors hover:bg-white/70"
            >
              <img src={user?.profilePhoto || "/avatar-placeholder.svg"} alt={user?.name ?? "User"} className="h-7 w-7 shrink-0 rounded-full border border-gray-200 object-cover" />
              <div className="hidden text-left md:block">
                <div className="text-xs font-semibold leading-none text-foreground">
                  {user?.name ?? 'User'}
                </div>
                <div className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{user?.role === 'ADMIN' ? 'Admin' : 'Manager'}</div>
              </div>
              <MdKeyboardArrowDown className="hidden text-sm text-muted-foreground sm:block" />
            </button>

            {profileOpen && (
              <ProfileMenu locale={currentLocale}
                onSignOut={() => {
                  closeMenus();
                  dispatch(setSignOutModalOpen(true));
                }}
              />
            )}
          </div>
        </div>
      </header>

      {helpOpen && <HelpCenterModal onClose={() => setHelpOpen(false)} />}
    </>
  );
}

function formatNotificationTime(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

function NotificationsPopover({
  locale,
  items,
  loading,
  onItemClick,
  onMarkAllRead,
}: {
  locale: string;
  items: NotificationItem[];
  loading: boolean;
  onItemClick: (item: NotificationItem) => void;
  onMarkAllRead: () => Promise<void>;
}) {
  const ui = getUiTranslation(locale);
  return (
    <div className="shadow-lg absolute -right-12 top-11 z-[80] w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white sm:right-0 sm:w-[380px]">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-gray-50/70">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
          {items.some((it) => !it.isRead) && (
            <button
              type="button"
              onClick={() => void onMarkAllRead()}
              className="text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline"
            >
              {ui.markAllAsRead}
            </button>
          )}
        </div>
        <Link
          prefetch={prefetchRoutes}
          href={localizePath("/notifications", locale)}
          className="text-xs font-semibold text-[#0ea5e9] hover:underline"
        >
          {ui.viewAll}
        </Link>
      </div>
      <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="p-3">
            <DetailSkeleton blocks={3} />
          </div>
        ) : items.map((item) => (
          <button
            type="button"
            onClick={() => onItemClick(item)}
            key={item._id}
            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
              !item.isRead ? "bg-sky-50/40" : ""
            }`}
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                item.isRead ? "bg-slate-300" : "bg-sky-500 ring-2 ring-sky-200"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className={`text-sm leading-snug truncate ${item.isRead ? "font-medium text-slate-700" : "font-semibold text-slate-950"}`}>
                {item.title || "Notification"}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                {item.message}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                {formatNotificationTime(item.createdAt)}
              </p>
            </div>
          </button>
        ))}
        {!loading && items.length === 0 && (
          <p className="p-6 text-center text-xs text-slate-400">{ui.noNotificationsFound}</p>
        )}
      </div>
    </div>
  );
}

function ProfileMenu({ locale, onSignOut }: { locale: string; onSignOut: () => void }) {
  const ui = getUiTranslation(locale);
  return (
    <div className="shadow absolute right-0 top-10 z-[80] w-44 overflow-hidden rounded border border-gray-200 bg-white py-1">
      <Link
        prefetch={prefetchRoutes}
        href={localizePath("/profile", locale)}
        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-800 hover:bg-gray-50"
      >
        <MdOutlinePerson className="text-base" />
        Profile
      </Link>
      <Link
        prefetch={prefetchRoutes}
        href={localizePath("/settings", locale)}
        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-800 hover:bg-gray-50"
      >
        <MdOutlineSettings className="text-base" />
        {ui.settings}
      </Link>
      <button
        type="button"
        onClick={onSignOut}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50"
      >
        <MdLogout className="text-base" />
        {ui.signOut}
      </button>
    </div>
  );
}

function HelpCenterModal({ onClose }: { onClose: () => void }) {
  const ui = getUiTranslation(getLocale(usePathname()));
  const [chatOpen, setChatOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const { triggerJump, jumpClassName } = useModalJump();
  const { data: apiFaqs = [] } = useGetManageFaqsQuery();

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerJump();
        }
      }}
    >
      <button
        type="button"
        aria-label={ui.closeHelpCenter}
        className="absolute inset-0 cursor-default"
        onClick={triggerJump}
      />

      <section className={`shadow relative z-10 flex max-h-[86vh] w-full max-w-[560px] flex-col overflow-hidden rounded-md bg-white ${jumpClassName}`}>
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded bg-[#e0f2fe] text-[#0ea5e9]">
              <MdHelpOutline className="text-2xl" />
            </span>
            <div>
              <h2 className="text-lg font-bold leading-none text-slate-950">
                {ui.helpCenter}
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                {ui.getSupportOrAnswers}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-600"
            aria-label="Close"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="flex min-h-[120px] flex-col items-center justify-center rounded border border-[#bae6fd] bg-[#e0f2fe] text-center shadow-sm transition-colors hover:bg-[#d8f1ff]"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded bg-white text-[#0ea5e9]">
                <MdSupportAgent className="text-2xl" />
              </span>
              <span className="text-sm font-bold text-slate-950">{ui.liveChat}</span>
              <span className="mt-2 text-xs text-slate-500">{ui.chatWithSupport}</span>
            </button>

            <button
              type="button"
              className="flex min-h-[120px] flex-col items-center justify-center rounded border border-[#ddd6fe] bg-[#f5f3ff] text-center transition-colors hover:bg-[#ede9fe]"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded bg-white text-[#8b5cf6]">
                <MdOutlineEmail className="text-2xl" />
              </span>
              <span className="text-sm font-bold text-slate-950">{ui.emailSupport}</span>
              <span className="mt-2 text-xs text-slate-500">support@cleanones.nl</span>
            </button>
          </div>

          {chatOpen && <SupportChat onClose={() => setChatOpen(false)} />}

          <h3 className="mt-5 text-sm font-bold text-slate-950">
            {ui.faq}
          </h3>
          <div className="mt-3 space-y-2">
            {(apiFaqs.length ? apiFaqs : fallbackFaqs).map((faq) => (
              <div key={faq._id} className="rounded border border-gray-200 bg-white">
                <button type="button" onClick={() => setOpenFaq((current) => current === faq._id ? null : faq._id)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-950 transition-colors hover:bg-gray-50">{faq.question}<MdChevronRight className={`text-xl text-slate-400 transition-transform ${openFaq === faq._id ? "rotate-90" : ""}`} /></button>
                {openFaq === faq._id && faq.answer && <p className="border-t border-gray-100 px-4 py-3 text-xs leading-5 text-slate-600">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-5 py-3 text-xs text-slate-400">
          CleanOnes Manager v2.4.1 - support@cleanones.nl
        </div>
      </section>
    </div>
  );
}

function SupportChat({ onClose }: { onClose: () => void }) {
  const ui = getUiTranslation(getLocale(usePathname()));
  return (
    <div className="mt-5 overflow-hidden rounded border border-[#0ea5e9]/30 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-[#0ea5e9] px-4 py-3 text-white">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="h-2 w-2 rounded-full bg-white" />
          {ui.supportChat}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={ui.closeSupportChat}
        >
          <MdClose className="text-lg" />
        </button>
      </div>

      <div className="min-h-[150px] bg-white p-3">
        <div className="inline-flex max-w-full rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm">
          {ui.helpGreeting}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 p-3">
        <input
          placeholder={ui.typeAMessage}
          className="h-10 min-w-0 flex-1 rounded border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
        />
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#0ea5e9] text-white transition-colors hover:bg-[#0284c7]"
          aria-label={ui.sendMessage}
        >
          <MdSend className="text-xl" />
        </button>
      </div>
    </div>
  );
}

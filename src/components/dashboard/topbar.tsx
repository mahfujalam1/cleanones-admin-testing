"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar, toggleMobileSidebar } from "@/store/slices/ui.slice";

const languages = ["English", "French", "Spanish"];

const notificationPreview = [
  {
    color: "bg-[#f59e0b]",
    text: "Schoonmaker Lisa Visser is 15 min te laat",
    time: "2m geleden",
  },
  {
    color: "bg-[#ef4444]",
    text: "Foto afgewezen voor Kamer 201 - NH Hotel Amsterdam",
    time: "5m geleden",
  },
  {
    color: "bg-[#3b82f6]",
    text: "Dienst #1043 voltooid bij Hilton Rotterdam",
    time: "12m geleden",
  },
  {
    color: "bg-[#10b981]",
    text: "Nieuwe escalatie opgelost door supervisor",
    time: "20m geleden",
  },
  {
    color: "bg-[#f59e0b]",
    text: "GPS-validatie mislukt voor Noah Bos",
    time: "35m geleden",
  },
];

const faqs = [
  "How do I assign a shift to a cleaner?",
  "How do I review and approve photos?",
  "What happens when a GPS alert is triggered?",
  "How do I add a new client or location?",
  "How do I change my password?",
];

export default function Topbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const getTitle = () => {
    if (pathname === "/") return "Dashboard";
    const path = pathname?.split("/")[1];
    if (!path) return "Dashboard";
    return path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const closeMenus = () => {
    setLanguageOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Mobile/tablet hamburger - always visible below lg */}
          <button
            type="button"
            onClick={() => dispatch(toggleMobileSidebar())}
            className="lg:hidden text-gray-500 hover:text-gray-700 cursor-pointer p-1 shrink-0"
          >
            <MdMenu className="text-2xl" />
          </button>

          {/* Desktop collapse-expand hamburger - only when sidebar collapsed at lg+ */}
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              className="hidden lg:block text-gray-500 hover:text-gray-700 cursor-pointer p-1"
            >
              <MdMenu className="text-2xl" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-[var(--color-foreground)] truncate">
            {getTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => {
                setLanguageOpen((open) => !open);
                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-100"
            >
              <MdLanguage className="text-lg" />
              <span>{selectedLanguage}</span>
              <MdKeyboardArrowDown className="text-base text-gray-500" />
            </button>

            {languageOpen && (
              <div className="absolute right-0 top-11 w-36 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
                {languages.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(language);
                      setLanguageOpen(false);
                    }}
                    className={`block w-full px-4 py-3 text-left text-sm transition-colors ${selectedLanguage === language
                        ? "bg-[#e0f2fe] text-[#0ea5e9]"
                        : "text-slate-800 hover:bg-gray-50"
                      }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setLanguageOpen(false);
                setProfileOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <MdNotificationsNone className="text-2xl" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white">
                5
              </span>
            </button>

            {notificationsOpen && <NotificationsPopover />}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setLanguageOpen(false);
                setNotificationsOpen(false);
              }}
              className="flex h-10 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-2 sm:px-3 shadow-sm transition-colors hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0ea5e9] text-xs font-bold text-white shadow-sm shrink-0">
                KP
              </div>
              <div className="hidden text-left md:block">
                <div className="text-sm font-semibold leading-none text-gray-700">
                  Kaz Putters
                </div>
                <div className="mt-1 text-[10px] text-gray-500">Admin</div>
              </div>
              <MdKeyboardArrowDown className="hidden text-base text-gray-400 sm:block" />
            </button>

            {profileOpen && (
              <ProfileMenu
                onHelp={() => {
                  closeMenus();
                  setHelpOpen(true);
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

function NotificationsPopover() {
  return (
    <div className="absolute right-0 top-11 w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-950">Notifications</h2>
        <Link
          href="/notifications"
          className="text-xs font-semibold text-[#0ea5e9] hover:underline"
        >
          View all
        </Link>
      </div>
      <div>
        {notificationPreview.map((item) => (
          <div
            key={item.text}
            className="flex gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0"
          >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.color}`} />
            <div>
              <p className="text-sm leading-snug text-slate-800">{item.text}</p>
              <p className="mt-1 text-xs text-slate-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileMenu({ onHelp }: { onHelp: () => void }) {
  return (
    <div className="absolute right-0 top-12 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-2xl">
      <button className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-800 hover:bg-gray-50">
        <MdOutlinePerson className="text-base" />
        Profile
      </button>
      <Link
        href="/settings"
        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-800 hover:bg-gray-50"
      >
        <MdOutlineSettings className="text-base" />
        Settings
      </Link>
      <button
        type="button"
        onClick={onHelp}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-800 hover:bg-gray-50"
      >
        <MdHelpOutline className="text-base" />
        Help Center
      </button>
      <Link
        href="/login"
        className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50"
      >
        <MdLogout className="text-base" />
        Sign Out
      </Link>
    </div>
  );
}

function HelpCenterModal({ onClose }: { onClose: () => void }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button
        type="button"
        aria-label="Close help center"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <section className="relative z-10 flex max-h-[86vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0ea5e9]">
              <MdHelpOutline className="text-2xl" />
            </span>
            <div>
              <h2 className="text-lg font-bold leading-none text-slate-950">
                Help Center
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                Get support or find answers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-600"
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
              className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-[#bae6fd] bg-[#e0f2fe] text-center shadow-sm transition-colors hover:bg-[#d8f1ff]"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0ea5e9]">
                <MdSupportAgent className="text-2xl" />
              </span>
              <span className="text-sm font-bold text-slate-950">Live Chat</span>
              <span className="mt-2 text-xs text-slate-500">Chat with support</span>
            </button>

            <button
              type="button"
              className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-[#ddd6fe] bg-[#f5f3ff] text-center transition-colors hover:bg-[#ede9fe]"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#8b5cf6]">
                <MdOutlineEmail className="text-2xl" />
              </span>
              <span className="text-sm font-bold text-slate-950">Email Support</span>
              <span className="mt-2 text-xs text-slate-500">support@cleanones.nl</span>
            </button>
          </div>

          {chatOpen && <SupportChat onClose={() => setChatOpen(false)} />}

          <h3 className="mt-5 text-sm font-bold text-slate-950">
            Frequently Asked Questions
          </h3>
          <div className="mt-3 space-y-2">
            {faqs.map((question) => (
              <button
                key={question}
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-950 transition-colors hover:bg-gray-50"
              >
                {question}
                <MdChevronRight className="text-xl text-slate-400" />
              </button>
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
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-[#0ea5e9]/30 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-[#0ea5e9] px-4 py-3 text-white">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="h-2 w-2 rounded-full bg-white" />
          Support Chat
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close support chat"
        >
          <MdClose className="text-lg" />
        </button>
      </div>

      <div className="min-h-[150px] bg-white p-3">
        <div className="inline-flex max-w-full rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm">
          Hi there! How can we help you today?
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 p-3">
        <input
          placeholder="Type a message..."
          className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#0ea5e9] focus:bg-white focus:ring-1 focus:ring-[#0ea5e9]"
        />
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0ea5e9] text-white transition-colors hover:bg-[#0284c7]"
          aria-label="Send message"
        >
          <MdSend className="text-xl" />
        </button>
      </div>
    </div>
  );
}
"use client";

import React, { useMemo, useState } from "react";
import { MdClose, MdNotificationsNone } from "react-icons/md";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread?: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Nieuwe Escalatie",
    message: "Spoed: Waterlek gemeld in Hilton Rotterdam Kamer 701 door Emma Smit",
    time: "2 min geleden",
    unread: true,
  },
  {
    id: "n2",
    title: "GPS Melding",
    message: "Noah Bos bevindt zich buiten het aangewezen gebied bij UMC Utrecht",
    time: "5 min geleden",
    unread: true,
  },
  {
    id: "n3",
    title: "Foto Afgewezen",
    message: "AI-analyse mislukt voor badkamerfoto Kamer 305 - scherpteScore 42/100",
    time: "12 min geleden",
    unread: true,
  },
  {
    id: "n4",
    title: "Dienst Voltooid",
    message: "Lucas Meijer voltooide dienst bij NH Hotel Groningen (100% kamers gedaan)",
    time: "18 min geleden",
    unread: true,
  },
  {
    id: "n5",
    title: "Te Laat Inchecken",
    message: "Anna Mulder is 15 minuten te laat voor dienst bij Keizersgracht Kantoren Amsterdam",
    time: "25 min geleden",
  },
  {
    id: "n6",
    title: "Foto's Wachten op Beoordeling",
    message: "12 foto's wachten op beoordeling door manager op 3 locaties",
    time: "35 min geleden",
  },
  {
    id: "n7",
    title: "Dienst Gestart",
    message: "Milan Dekker heeft ingecheckt bij Academisch Ziekenhuis Leiden en dienst #1048 gestart",
    time: "42 min geleden",
  },
  {
    id: "n8",
    title: "App Bijgewerkt",
    message: "Nieuwe schoonmaakplanner is gesynchroniseerd met alle apparaten",
    time: "1 uur geleden",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    [notifications]
  );

  const dismissNotification = (id: string) => {
    setNotifications((items) => items.filter((item) => item.id !== id));
  };

  const markAllRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, unread: false })));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div className="flex items-center gap-2">
          <MdNotificationsNone className="text-xl text-slate-800" />
          <h2 className="text-lg font-bold text-slate-950">Notification Center</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#ef4444] px-3 py-1 text-xs font-bold text-white">
              {unreadCount} new
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={markAllRead}
          className="text-sm font-semibold text-[#0ea5e9] hover:underline"
        >
          Mark all read
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map((item) => (
          <article
            key={item.id}
            className={`relative rounded-md border px-4 py-4 pr-12 shadow-sm ${
              item.unread
                ? "border-[#a5e9ff] bg-[#ecfdf5]"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
              {item.unread && <span className="h-1.5 w-1.5 rounded-full bg-[#0ea5e9]" />}
            </div>
            <p className="mt-1 text-sm text-slate-600">{item.message}</p>
            <p className="mt-2 text-xs text-slate-400">{item.time}</p>

            <button
              type="button"
              onClick={() => dismissNotification(item.id)}
              className="absolute right-4 top-4 rounded p-1 text-slate-300 transition-colors hover:bg-white/70 hover:text-slate-500"
              aria-label={`Dismiss ${item.title}`}
            >
              <MdClose className="text-lg" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

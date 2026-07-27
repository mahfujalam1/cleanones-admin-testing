"use client";

import React, { useMemo, useState } from "react";
import {
  MdClose,
  MdOutlinePerson,
  MdSearch,
  MdWarningAmber,
} from "react-icons/md";

type EscalationStatus = "Open" | "In Progress" | "Resolved";
type EscalationSeverity = "Emergency" | "High" | "Medium" | "Low";

interface Escalation {
  id: string;
  title: string;
  location: string;
  description: string;
  reporter: string;
  reporterInitials: string;
  status: EscalationStatus;
  severity: EscalationSeverity;
  assignedTo?: string;
}

const ESCALATIONS: Escalation[] = [
  {
    id: "I001",
    title: "Gebroken spiegel in Kamer 305",
    location: "NH Hotel Amsterdam - Kamer 305",
    description:
      "Een grote badkamerspiegel lijkt gebarsten. Onduidelijk of het bestaande schade betreft.",
    reporter: "Lisa Visser",
    reporterInitials: "LV",
    status: "Open",
    severity: "Emergency",
  },
  {
    id: "I002",
    title: "Waterlek in badkamer - Kamer 701",
    location: "Hilton Rotterdam - Kamer 701",
    description:
      "Actief waterlek vanuit de pijp onder de wastafel. Water verspreidt zich naar slaapkamer. Dringende onderhoud vereist.",
    reporter: "Emma Smit",
    reporterInitials: "ES",
    status: "In Progress",
    severity: "Emergency",
    assignedTo: "Kaz Putters",
  },
  {
    id: "I003",
    title: "Gast klaagde over gemiste gebieden",
    location: "NH Hotel Amsterdam - Kamer 203",
    description:
      "Gast uit Kamer 203 meldde dat achter de badkamerdeur niet schoongemaakt was.",
    reporter: "Lisa Visser",
    reporterInitials: "LV",
    status: "In Progress",
    severity: "High",
    assignedTo: "Jan de Vries",
  },
  {
    id: "I004",
    title: "Chemische morsen op corridorvloer",
    location: "UMC Utrecht - Verdieping 5 Gang",
    description:
      "Schoonmaakmiddel per ongeluk gemorst op de gang. Gebied gemarkeerd maar vereist proper schoonmaken en ventilatie.",
    reporter: "Noah Bos",
    reporterInitials: "NB",
    status: "Open",
    severity: "Emergency",
  },
  {
    id: "I005",
    title: "Gastbenodigdheden niet aangevuld",
    location: "Van der Valk Eindhoven - Opslag",
    description:
      "Shampoo en conditioner niet beschikbaar in de opslagruimte. Bestelling moet worden geplaatst.",
    reporter: "Sophie de Boer",
    reporterInitials: "SB",
    status: "Resolved",
    severity: "Low",
    assignedTo: "Marit Janssen",
  },
];

const severityStyles: Record<
  EscalationSeverity,
  { accent: string; iconBg: string; iconText: string; label: string }
> = {
  Emergency: {
    accent: "border-l-[#ef4444]",
    iconBg: "bg-[#fee2e2]",
    iconText: "text-[#ef4444]",
    label: "text-[#ef4444]",
  },
  High: {
    accent: "border-l-[#f59e0b]",
    iconBg: "bg-[#fef3c7]",
    iconText: "text-[#f59e0b]",
    label: "text-[#f59e0b]",
  },
  Medium: {
    accent: "border-l-[#0ea5e9]",
    iconBg: "bg-[#e0f2fe]",
    iconText: "text-[#0ea5e9]",
    label: "text-[#0ea5e9]",
  },
  Low: {
    accent: "border-l-[#10b981]",
    iconBg: "bg-[#d1fae5]",
    iconText: "text-[#10b981]",
    label: "text-[#10b981]",
  },
};

const statusStyles: Record<EscalationStatus, string> = {
  Open: "text-[#ef4444]",
  "In Progress": "text-[#f59e0b]",
  Resolved: "text-[#10b981]",
};

export default function EscalationsPage() {
  const [search, setSearch] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<Escalation | null>(null);

  const filteredEscalations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ESCALATIONS;

    return ESCALATIONS.filter((issue) =>
      [issue.title, issue.location, issue.description, issue.reporter, issue.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  return (
    <div className="space-y-6 pb-10">
      <div className="relative w-full max-w-[280px]">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Search issues..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-9 w-full rounded border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-700 shadow-sm transition-colors placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]"
        />
      </div>

      <div className="space-y-3">
        {filteredEscalations.map((issue) => (
          <EscalationCard
            key={issue.id}
            issue={issue}
            onClick={() => setSelectedIssue(issue)}
          />
        ))}
      </div>

      {filteredEscalations.length === 0 && (
        <div className="rounded border border-gray-200 bg-white py-16 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-500">No escalations found</p>
          <p className="mt-1 text-xs text-gray-400">Try a different search term.</p>
        </div>
      )}

      {selectedIssue && (
        <IssueDrawer
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onResolve={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}

function EscalationCard({
  issue,
  onClick,
}: {
  issue: Escalation;
  onClick: () => void;
}) {
  const style = severityStyles[issue.severity];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded border border-gray-200 border-l-4 ${style.accent} bg-white p-5 text-left shadow-sm transition-all hover:border-gray-300 hover:shadow`}
    >
      <div className="flex min-h-[96px] flex-col gap-4 md:flex-row md:justify-between cursor-pointer">
        <div className="flex gap-4">
          <div
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.iconBg}`}
          >
            <MdWarningAmber className={`text-xl ${style.iconText}`} />
          </div>

          <div className="min-w-0 space-y-3">
            <div>
              <h2 className="text-sm font-bold leading-snug text-gray-950">
                {issue.title}
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {issue.location}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              {issue.description}
            </p>

            <div className="flex items-center gap-2">
              <img src="/avatar-placeholder.svg" alt={issue.reporter} className="h-5 w-5 rounded-full border border-gray-200 object-cover" />
              <span className="text-xs font-medium text-slate-500">
                {issue.reporter}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-end justify-between gap-4 md:w-[190px] md:flex-col md:items-end">
          <span className={`text-xs font-medium ${statusStyles[issue.status]}`}>
            {issue.status}
          </span>

          {issue.assignedTo && (
            <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <MdOutlinePerson className="text-sm text-slate-400" />
              Assigned to {issue.assignedTo}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function IssueDrawer({
  issue,
  onClose,
  onResolve,
}: {
  issue: Escalation;
  onClose: () => void;
  onResolve: () => void;
}) {
  const style = severityStyles[issue.severity];

  return (
    <div className="modal-backdrop fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close issue details"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <aside className="relative z-10 flex h-full w-full max-w-[500px] flex-col bg-white shadow animate-in slide-in-from-right duration-200">
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Issue {issue.id}</h2>
            <p className={`mt-1 text-xs font-semibold ${style.label}`}>
              {issue.severity}
            </p>
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

        <div className="flex-1 px-6 py-6">
          <h3 className="text-base font-bold leading-snug text-slate-800">
            {issue.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {issue.description}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onResolve}
              className="h-10 rounded border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-100"
            >
              Resolve
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded border border-gray-300 bg-gray-50 text-sm font-semibold text-slate-500 transition-colors hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

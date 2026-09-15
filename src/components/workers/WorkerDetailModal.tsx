"use client";

import React, { useEffect, useState } from "react";
import { MdEdit, MdOpenInNew, MdOutlineClose } from "react-icons/md";
import { useGetWorkerQuery, workerName, type Worker, type WorkingDay } from "@/redux/api/endpoints/workers.api";
import { apiError } from "@/redux/api/apiError";
import { ErrorNotice } from "@/components/shared/ListStates";
import { WorkerAvatar } from "./WorkerAvatar";
import { InvoicesTab } from "./InvoicesTab";
import { PerformanceTab } from "./PerformanceTab";
import { AttendanceTab } from "./AttendanceTab";
import { useModalJump } from "@/hooks/useModalJump";

const TABS = [
  "General",
  "Performance",
  "Attendance",
  "Invoices",
  "Availability",
] as const;
type Tab = (typeof TABS)[number];

const WEEK: Array<{ key: WorkingDay; short: string }> = [
  { key: "monday", short: "Mon" },
  { key: "tuesday", short: "Tue" },
  { key: "wednesday", short: "Wed" },
  { key: "thursday", short: "Thu" },
  { key: "friday", short: "Fri" },
  { key: "saturday", short: "Sat" },
  { key: "sunday", short: "Sun" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      <dl className="divide-y divide-slate-100 rounded-md border border-slate-200">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  const empty = value === undefined || value === null || value === "";
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2.5">
      <dt className="shrink-0 text-xs text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-right text-xs font-medium text-slate-800">
        {empty ? <span className="font-normal text-slate-300">Not set</span> : value}
      </dd>
    </div>
  );
}

/**
 * Shown on the tabs whose data has no endpoint on the worker API yet. Saying which data is
 * missing beats an empty panel that reads as a bug.
 */
function AwaitingApi({ what }: { what: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-200 px-4 py-12 text-center">
      <p className="text-sm font-medium text-slate-600">No {what} to show</p>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-400">
        The worker API does not expose {what} yet. This tab fills in once that endpoint exists.
      </p>
    </div>
  );
}

function GeneralTab({ worker, onEdit }: { worker: Worker; onEdit?: () => void }) {
  return (
    <div className="space-y-5">
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <MdEdit className="text-sm" /> Edit Worker Details
        </button>
      )}

      <Section title="Contact">
        <Row
          label="Email"
          value={
            worker.email ? (
              <a href={`mailto:${worker.email}`} className="text-primary hover:underline">
                {worker.email}
              </a>
            ) : undefined
          }
        />
        <Row label="Phone" value={worker.phone} />
      </Section>

      <Section title="Work">
        <Row label="Worker type" value={worker.worker_type} />
        <Row label="Base location" value={worker.base_location} />
        <Row
          label="Hourly rate"
          value={typeof worker.hourly_rate === "number" ? `€${worker.hourly_rate.toFixed(2)} / hr` : undefined}
        />
        <Row
          label="Languages"
          value={worker.languages?.length ? worker.languages.join(", ") : undefined}
        />
      </Section>
    </div>
  );
}

function DocumentRow({ label, url }: { label: string; url?: string }) {
  return (
    <Row
      label={label}
      value={
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Open <MdOpenInNew className="text-[11px]" />
          </a>
        ) : undefined
      }
    />
  );
}

function DocumentsTab({ worker }: { worker: Worker }) {
  const certificates = worker.certificates ?? [];

  return (
    <div className="space-y-5">
      <Section title="Identity">
        <DocumentRow label="ID card front" url={worker.id_card_front} />
        <DocumentRow label="ID card back" url={worker.id_card_back} />
      </Section>

      <Section title="Contract">
        <DocumentRow label="Employee contract" url={worker.employee_contract_pdf} />
      </Section>

      <Section title={`Certificates (${certificates.length})`}>
        {certificates.length === 0 ? (
          <Row label="Certificates" value={undefined} />
        ) : (
          certificates.map((url, index) => (
            <DocumentRow key={url} label={`Certificate ${index + 1}`} url={url} />
          ))
        )}
      </Section>

      <p className="text-[11px] leading-relaxed text-slate-400">
        Documents are stored as links. Uploading a file from here needs an upload endpoint.
      </p>
    </div>
  );
}

function AvailabilityTab({ worker }: { worker: Worker }) {
  // The API returns `working_days` for freelancers as well as employees, so they are shown for
  // both. Only the form restricts who may edit them.
  const working = new Set(worker.working_days ?? []);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Working days</h3>
        <span className="text-[11px] text-slate-400">
          {working.size === 0 ? "None set" : `${working.size} of 7 scheduled`}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEK.map((day) => {
          const active = working.has(day.key);
          return (
            <div
              key={day.key}
              className={`rounded-md border py-3 text-center text-xs font-medium ${
                active
                  ? "border-primary/30 bg-sky-50 text-primary"
                  : "border-slate-200 bg-white text-slate-300"
              }`}
            >
              {day.short}
            </div>
          );
        })}
      </div>

      {worker.worker_type === "Freelancer" && (
        <p className="text-[11px] leading-relaxed text-slate-400">
          Freelancers set their own availability from the worker app.
        </p>
      )}
    </div>
  );
}

export function WorkerDetailModal({
  workerId,
  onClose,
  onEdit,
}: {
  workerId: string;
  onClose: () => void;
  onEdit?: (worker: Worker) => void;
}) {
  const [tab, setTab] = useState<Tab>("General");
  const { data: worker, isLoading, error } = useGetWorkerQuery(workerId);
  const { triggerJump, jumpClassName } = useModalJump();

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          triggerJump();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Worker details"
        // Fixed box: the tabs hold very different amounts of content, and sizing to it made
        // the modal jump on every switch. The body scrolls inside instead.
        className={`flex h-[85vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${jumpClassName}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pb-4 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <WorkerAvatar name={worker && workerName(worker)} src={worker?.profile_photo} size="lg" />
            <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="truncate text-base font-semibold text-slate-900">
                {worker ? workerName(worker) : "Worker"}
              </h2>
              {worker && (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {worker.worker_type}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {worker?.email || worker?.worker_type || "Details"}
            </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:text-slate-600"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </header>

        <nav className="overflow-x-auto border-b border-slate-100 px-6">
          <div className="flex min-w-max gap-1">
            {TABS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setTab(name)}
                aria-current={tab === name ? "page" : undefined}
                className={`cursor-pointer whitespace-nowrap border-b-2 px-3 py-2.5 text-xs transition-colors ${
                  tab === name
                    ? "border-primary font-semibold text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="h-9 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <ErrorNotice message={apiError(error)} />
          ) : worker ? (
            <>
              {tab === "General" && (
                <GeneralTab worker={worker} onEdit={onEdit && (() => onEdit(worker))} />
              )}
              {tab === "Performance" && <PerformanceTab worker={worker} />}
              {tab === "Attendance" && <AttendanceTab worker={worker} />}
              {tab === "Invoices" && <InvoicesTab worker={worker} />}
              {tab === "Availability" && <AvailabilityTab worker={worker} />}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

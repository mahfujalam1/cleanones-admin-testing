"use client";

import React, { useState, useEffect } from "react";
import { MdOutlineClose } from "react-icons/md";
import { Worker } from "./types";
import { CountrySelect } from "@/components/ui/country-select";
import type { WorkerAvailabilitySlot } from "@/services/actions/workers";
import { WeeklyAvailabilitySelector, WEEK_DAYS } from "./WeeklyAvailabilitySelector";
import { WorkerLanguagesSelector } from "./WorkerLanguagesSelector";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import { getPlaceholderTranslation } from "@/lib/translations";

export type NewWorker = Omit<
  Worker,
  | "id"
  | "code"
  | "completedShifts"
  | "avgPhotoScore"
  | "weeklyAvailability"
  | "monthlyHours"
  | "lateDays"
  | "absentDays"
  | "attendanceRecords"
  | "documents"
  | "invoices"
  | "shiftRecords"
> & {
  weekly_availability?: WorkerAvailabilitySlot[];
  weeklyAvailability?: boolean[];
  idCardFront?: File;
  idCardBack?: File;
  contractFile?: File;
  certificateFiles?: File[];
};

interface AddWorkerModalProps {
  onClose: () => void;
  onAdd: (worker: NewWorker) => Promise<string | boolean | void> | void;
  error?: string;
}

export function AddWorkerModal({ onClose, onAdd, error: externalError }: AddWorkerModalProps) {
  const t = getDashboardTranslation(getLocale(usePathname()));
  const p = getPlaceholderTranslation(getLocale(usePathname()));
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Nederlands", "Engels"]);
  const [name, setName] = useState("");
  const [workerType, setWorkerType] = useState<"Employee" | "Freelancer">("Employee");
  const [position, setPosition] = useState("Cleaner");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number | "">(25);
  const [status, setStatus] = useState<Worker["status"]>("Active");
  const [location, setLocation] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "monday", "tuesday", "wednesday", "thursday", "friday"
  ]);
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleDay = (dayKey: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;
    setModalError("");
    setSubmitting(true);

    try {
      const isEmployee = workerType === "Employee";
      const weekly_availability: WorkerAvailabilitySlot[] | undefined = isEmployee
        ? selectedDays.map((day) => ({
          day,
          start_time: "08:00 AM",
          end_time: "05:00 PM",
          is_available: true,
        }))
        : undefined;

      const weeklyAvailabilityBooleans = WEEK_DAYS.map((d) => selectedDays.includes(d.key));

      const err = await onAdd({
        name,
        initials: name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
        avatarColor: "bg-[#0ea5e9]",
        workerType,
        position,
        location,
        hourlyRate: typeof hourlyRate === "number" ? hourlyRate : 0,
        languages: selectedLanguages,
        hours: "0h",
        status,
        email,
        phone,
        totalEarned: 0,
        totalPaid: 0,
        remaining: 0,
        weekly_availability,
        weeklyAvailability: weeklyAvailabilityBooleans,
      });
      if (typeof err === "string" && err) setModalError(err);
    } catch {
      setModalError(t.common.noDataFound);
    } finally {
      setSubmitting(false);
    }
  };

  const activeError = modalError || externalError;

  return (
    <div
      onClick={onClose}
      className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4 animate-in fade-in duration-200"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-md shadow w-full max-w-[560px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-7 pt-7 pb-2 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t.workers.addWorker}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t.workers.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors p-1 -mt-1 -mr-1"
          >
            <MdOutlineClose className="text-xl" />
          </button>
        </div>

        {activeError && (
          <div className="mx-7 mt-2 rounded border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 animate-in fade-in">
            {activeError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.managerAccess.name} *</label>
            <input
              type="text"
              required
              placeholder={p.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.managerAccess.role}</label>
              <select
                value={workerType}
                onChange={(e) => setWorkerType(e.target.value as "Employee" | "Freelancer")}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors cursor-pointer"
              >
                <option value="Employee">Employee</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.managerAccess.permissions}</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors cursor-pointer"
              >
                <option value="Cleaner">Cleaner</option>
                <option value="Senior Cleaner">Senior Cleaner</option>
                <option value="Team Leader">Team Leader</option>
                <option value="Specialist Cleaner">Specialist Cleaner</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.managerAccess.email} *</label>
              <input
                type="email"
                required
                placeholder={p.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.settings.phoneNumber} *</label>
              <input
                type="tel"
                required
                placeholder={p.phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Hourly Rate (€/hr) *</label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                placeholder={p.number}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.common.status}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Worker["status"])}
                className="w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] transition-colors cursor-pointer"
              >
                {/* "On Shift"/"Off Duty" are runtime-computed once a worker is checked in/out of
                    a shift, not a state that can be assigned when creating the account — the
                    backend's create-worker validation only accepts these 3. */}
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Banned">Banned</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{t.locations.title}</label>
              <CountrySelect value={location} onValueChange={setLocation} placeholder={p.search} />
            </div>
          </div>

          <WorkerLanguagesSelector
            selectedLanguages={selectedLanguages}
            onToggleLanguage={toggleLanguage}
          />

          {workerType === "Employee" && (
            <WeeklyAvailabilitySelector
              selectedDays={selectedDays}
              onToggleDay={toggleDay}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t.common.cancel}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
          >
            {submitting ? t.settings.saving : t.workers.addWorker}
          </button>
        </div>
      </form>
    </div>
  );
}

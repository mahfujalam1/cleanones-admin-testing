"use client";

import React from "react";
import {
  TbClock,
  TbDoor,
  TbChecklist,
  TbCamera,
  TbUser,
  TbMapPin,
  TbUsers,
  TbCalendar,
  TbRefresh,
  TbNotes,
} from "react-icons/tb";
import type { PlanDetails } from "@/services/actions/cleaningPlans";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

interface ExtraServicePlanSectionProps {
  plan: PlanDetails | null;
  loading: boolean;
  planId?: string;
}

const ALL_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function ExtraServicePlanSection({ plan, loading, planId }: ExtraServicePlanSectionProps) {
  const t = getDashboardTranslation(getLocale(usePathname()));
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 animate-pulse">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-400">
        {planId ? `${t.plans.title} (${planId})` : t.plans.noPlansFound}
      </div>
    );
  }

  const rooms = plan.rooms || [];
  const additionalTasks = plan.additional_tasks || [];
  const workers = plan.workers || [];
  const totalTasks =
    plan.total_tasks_count ||
    rooms.reduce((acc, r) => acc + (r.tasks?.length || 0), 0) + additionalTasks.length;
  const totalPhotos =
    plan.total_photos_count ||
    rooms.reduce((acc, r) => acc + (r.total_photos_required || 0), 0) +
    additionalTasks.reduce((acc, t) => acc + (t.total_photos_required || (t.photo?.length || 0)), 0);

  const clientInfo = plan.clients?.[0] || {
    company_name: plan.company_name || (plan as any).client_name || t.extraServices.client,
    primary_contact_name: (plan as any).primary_contact_name || "",
  };

  const workingDaysSet = new Set((plan.working_days || []).map((d) => d.toLowerCase()));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 text-xs">
      {/* Plan Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{plan.title || "Cleaning Plan"}</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${plan.is_active
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
            >
              {plan.is_active ? t.common.active : t.common.inactive}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ID: <span className="font-mono text-slate-600">{plan.id}</span>
            {plan.date && <span className="ml-2">• {plan.date}</span>}
            {plan.start_time && (
              <span className="ml-1">
                ({plan.start_time} - {plan.end_time || "End"})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 text-lg">
            <TbClock />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">{plan.duration_minutes || 0}m</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">{t.common.duration}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 text-lg">
            <TbDoor />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">{rooms.length}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">{t.common.rooms}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 text-lg">
            <TbChecklist />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">{totalTasks}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">{t.common.tasks}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 text-lg">
            <TbCamera />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">{totalPhotos}</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase">{t.common.photos}</p>
          </div>
        </div>
      </div>

      {/* Main Breakdown Layout (2 columns) */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column (2/3) */}
        <div className="space-y-4 lg:col-span-2">
          {/* Plan Details & Client Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t.clients.title}
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 shrink-0">
                  <TbUser />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">{t.extraServices.client}</p>
                  <p className="font-bold text-slate-900">{clientInfo.company_name}</p>
                  {clientInfo.primary_contact_name && (
                    <p className="text-[11px] text-slate-500">{t.managerAccess.name}: {clientInfo.primary_contact_name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 shrink-0">
                  <TbMapPin />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">{t.extraServices.location}</p>
                  <p className="font-bold text-slate-900">{plan.location_name || "Location"}</p>
                  <p className="text-[11px] text-sky-600 font-medium">
                    {t.roster.title}: {(plan.repeat_shift || "Does not repeat").replaceAll("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            {plan.shift_notes && (
              <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-2.5 flex items-start gap-2 text-xs">
                <TbNotes className="text-sky-600 text-sm mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900">{t.roster.title}: </span>
                  <span className="text-slate-700">{plan.shift_notes}</span>
                </div>
              </div>
            )}
          </div>

          {/* Rooms & Tasks Breakdown */}
          {rooms.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TbDoor className="text-sky-600 text-sm" /> {t.common.rooms} & {t.common.tasks} ({rooms.length})
              </h4>
              <div className="space-y-3">
                {rooms.map((room) => (
                  <div key={room.room_id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded bg-sky-100/70 text-sky-700">
                          <TbDoor />
                        </span>
                        <div>
                          <h5 className="font-bold text-slate-900">{room.room_name}</h5>
                          <p className="text-[10px] text-sky-600 font-medium capitalize">
                            {room.clean_type || room.room_type || "Standard"}{" "}
                            {room.floor ? `· Floor ${room.floor}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                        <span className="rounded bg-white px-2 py-0.5 text-slate-600 border border-slate-200">
                          ⏱ {room.duration || 0}m
                        </span>
                        <span className="rounded bg-sky-50 px-2 py-0.5 text-sky-700 border border-sky-100">
                          📋 {room.tasks?.length || 0} {t.common.tasks}
                        </span>
                        <span className="rounded bg-sky-50 px-2 py-0.5 text-sky-700 border border-sky-100">
                          📷 {room.total_photos_required || 0} {t.common.photos}
                        </span>
                      </div>
                    </div>

                    {/* Room Tasks */}
                    {room.tasks && room.tasks.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Room Tasks</p>
                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {room.tasks.map((task, idx) => (
                            <div
                              key={task.id || idx}
                              className="rounded border border-slate-200 bg-white p-2 text-xs flex items-center justify-between"
                            >
                              <span className="font-medium text-slate-800">{task.name}</span>
                              <div className="flex items-center gap-1 text-[9px]">
                                <span className="rounded bg-sky-50 px-1.5 py-0.5 font-semibold text-sky-700 border border-sky-100">
                                  {task.frequency_type || "Daily"}
                                </span>
                                {task.is_photo_req && (
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">
                                    Photo
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Required Photos in Room */}
                    {room.required_photos && room.required_photos.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <TbCamera /> Required Photos:
                        </span>
                        {room.required_photos.map((p, pIdx) => (
                          <span
                            key={p.id || pIdx}
                            className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-100"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Plan Tasks (Approved) */}
          {additionalTasks.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Additional Plan Tasks ({additionalTasks.length})
              </h4>
              <div className="space-y-2">
                {additionalTasks.map((t, idx) => (
                  <div key={t.id || idx} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{t.name}</span>
                      <div className="flex items-center gap-1.5">
                        {t.fixed_date && <span className="text-[11px] text-slate-500 font-medium">📅 {t.fixed_date}</span>}
                        {(t.duration_minutes || t.duration) && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            ⏱️ {t.duration_minutes || t.duration}m
                          </span>
                        )}
                        <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 uppercase">
                          {(t.frequency_type || "fixed_date").replaceAll("_", " ")}
                        </span>
                      </div>
                    </div>

                    {t.description && (
                      <p className="text-xs text-slate-600 bg-white rounded border border-slate-100 p-2 leading-relaxed">
                        {t.description}
                      </p>
                    )}

                    {t.is_photo_req && t.photo && t.photo.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                          <TbCamera /> Photos:
                        </span>
                        {t.photo.map((p, pIdx) => (
                          <span
                            key={p.id || pIdx}
                            className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-100"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-4">
          {/* Assigned Workers */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TbUsers className="text-sky-600" /> Assigned Workers ({workers.length})
            </h4>
            {workers.length === 0 ? (
              <div className="py-6 text-center border border-dashed rounded-lg bg-slate-50 space-y-1">
                <TbUsers className="mx-auto text-2xl text-slate-300" />
                <p className="text-xs font-medium text-slate-500">No workers assigned</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workers.map((w) => (
                  <div key={w.worker_id} className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2">
                    {w.profile_photo ? (
                      <img
                        src={w.profile_photo}
                        alt={w.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white font-bold text-xs">
                        {w.name?.slice(0, 2).toUpperCase() || "W"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate">{w.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{w.position || "Cleaner"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Manager */}
          {plan.manager && (
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Assigned Manager
              </h4>
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2">
                {plan.manager.profile_photo ? (
                  <img
                    src={plan.manager.profile_photo}
                    alt={plan.manager.name}
                    className="h-8 w-8 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-white font-bold text-xs">
                    {plan.manager.name?.slice(0, 2).toUpperCase() || "M"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">{plan.manager.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{plan.manager.email || "Manager"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Working Days */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TbCalendar className="text-sky-600" /> Working Days
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((day) => {
                const isActive = workingDaysSet.has(day);
                return (
                  <span
                    key={day}
                    className={`rounded px-2.5 py-1 text-[10px] font-bold capitalize transition-colors ${isActive
                        ? "bg-sky-50 text-sky-700 border border-sky-200"
                        : "bg-slate-50 text-slate-400 border border-slate-100"
                      }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useEffect, useState } from 'react';
import { MdAccessTime, MdLocationOn, MdOutlineClose, MdTag, MdPerson, MdBusinessCenter, MdEventNote, MdCamera, MdChecklist, MdDeleteOutline } from 'react-icons/md';
import { TbDoor, TbUsers, TbClipboardList } from 'react-icons/tb';
import { Shift, planIdFromShift } from './types';
import { deleteRosterShift, getRosterShift } from '@/services/actions/roster';
import { getCleaningPlan, type PlanDetails } from '@/services/actions/cleaningPlans';
import { DetailSkeleton } from '@/components/shared/SkeletonLoader';

interface ShiftModalProps {
  shift: Shift;
  onClose: () => void;
  onDeleted?: (id: string) => void;
}

type ShiftDetails = {
  worker_name: string;
  worker_profile_photo?: string | null;
  assignment_label: string;
  location_name: string;
  location_address?: string | null;
  client_name?: string;
  date?: string;
  time_range?: string;
  status?: string;
};

const titleCase = (value?: string) =>
  value ? value.replaceAll('_', ' ').split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '';

export function ShiftModal({ shift, onClose, onDeleted }: ShiftModalProps) {
  const [details, setDetails] = useState<ShiftDetails | null>(null);
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const planId = planIdFromShift(shift.id);

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    const result = await deleteRosterShift(shift.id);
    setDeleting(false);
    if (!result.success) {
      setConfirmDelete(false);
      setError(result.error);
      return;
    }
    onDeleted?.(shift.id);
    onClose();
  };

  useEffect(() => {
    void getRosterShift(shift.id).then((result) => result.success ? setDetails(result.data) : setError(result.error));
  }, [shift.id]);

  useEffect(() => {
    if (!planId) return;
    setPlanLoading(true);
    void getCleaningPlan(planId).then((result) => {
      setPlanLoading(false);
      if (result.success) setPlan(result.data);
    });
  }, [planId]);

  const getAccentColor = (theme: string) => {
    switch (theme) {
      case 'pink': return 'bg-pink-500';
      case 'blue': return 'bg-primary';
      case 'orange': return 'bg-orange-500';
      case 'purple': return 'bg-purple-500';
      case 'green': return 'bg-emerald-500';
      case 'teal': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={onClose}>
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-gray-200 bg-white animate-in fade-in zoom-in-95 duration-150"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={`h-1 w-full shrink-0 ${getAccentColor(shift.theme)}`} />
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${getAccentColor(shift.theme)}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Shift details</span>
              {details?.status && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-slate-600">
                  {titleCase(details.status)}
                </span>
              )}
            </div>
            <h3 className="truncate text-base font-semibold text-slate-800">{plan?.title || details?.worker_name || shift.workerName}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{details?.assignment_label ?? 'Scheduled assignment'}</p>
          </div>
          <button onClick={onClose} aria-label="Close shift details" className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-700 cursor-pointer">
            <MdOutlineClose className="text-lg" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {!details && !error ? <DetailSkeleton blocks={4} /> : (
            <div className="space-y-5">
              {error && <p className="rounded bg-red-50 p-2 text-xs text-red-700">{error}</p>}

              {/* Shift facts */}
              <div className="grid gap-2 sm:grid-cols-2">
                <Fact icon={<MdBusinessCenter />} label="Client" value={plan?.company_name || details?.client_name} />
                <Fact icon={<MdPerson />} label="Worker" value={details?.worker_name ?? shift.workerName} />
                <Fact
                  icon={<MdLocationOn />}
                  label="Location"
                  value={details?.location_name ?? shift.location}
                  hint={details?.location_address ?? undefined}
                />
                <Fact icon={<MdEventNote />} label="Date" value={details?.date || shift.date} />
                <Fact icon={<MdAccessTime />} label="Time" value={details?.time_range || `${shift.startTime} – ${shift.endTime}`} />
                <Fact icon={<MdTag />} label="Shift ID" value={shift.id} />
              </div>

              {planLoading && <DetailSkeleton blocks={5} />}



              {plan && (
                <>
                  {/* Plan summary */}
                  <Section icon={<TbClipboardList />} title="Cleaning plan">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Row label="Plan title" value={plan.title} />
                      <Row label="Status" value={titleCase(plan.status)} />
                      <Row label="Schedule" value={`${plan.date} · ${plan.start_time} – ${plan.end_time}`} />
                      <Row label="Duration" value={plan.duration_minutes ? `${plan.duration_minutes} min` : undefined} />
                      <Row label="Repeat" value={plan.repeat_shift} />
                      <Row label="Repeat until" value={plan.repeat_until} />
                      <Row label="Working days" value={(plan.working_days ?? []).map(titleCase).join(', ')} />
                      <Row label="Timezone" value={plan.timezone} />
                      <Row label="Active" value={plan.is_active ? 'Yes' : 'No'} />
                      <Row label="Manager" value={plan.manager?.name} />
                    </div>
                    {plan.shift_notes && (
                      <p className="mt-2 rounded border border-gray-100 bg-white p-3 text-xs text-slate-600">{plan.shift_notes}</p>
                    )}
                  </Section>

                  {/* Totals */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat label="Rooms" value={plan.rooms_count ?? plan.rooms?.length ?? 0} />
                    <Stat label="Workers" value={plan.workers_count ?? plan.workers?.length ?? 0} />
                    <Stat label="Tasks" value={plan.total_tasks_count ?? 0} />
                    <Stat label="Photos" value={plan.total_photos_count ?? 0} />
                  </div>

                  {/* Rooms with their tasks */}
                  {(plan.rooms ?? []).length > 0 && (
                    <Section icon={<TbDoor />} title={`Rooms (${plan.rooms.length})`}>
                      <div className="space-y-2">
                        {plan.rooms.map((room) => (
                          <div key={room.room_id} className="rounded border border-gray-200 bg-white p-3">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <b className="text-sm text-slate-800">{room.room_name}</b>
                              <span className="text-[11px] text-slate-400">
                                {[titleCase(room.room_type), room.floor ? `Floor ${room.floor}` : '', room.duration ? `${room.duration}m` : '', titleCase(room.clean_type)].filter(Boolean).join(' · ')}
                              </span>
                            </div>
                            {(room.tasks ?? []).length > 0 && (
                              <ul className="mt-2 space-y-1.5">
                                {room.tasks.map((task) => (
                                  <li key={task.id} className="flex flex-wrap items-center gap-2 rounded bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">
                                    <MdChecklist className="shrink-0 text-sm text-sky-500" />
                                    <span className="font-medium">{task.name}</span>
                                    <span className="text-[10px] text-slate-400">{titleCase(task.frequency_type)}</span>
                                    {(task.photo ?? []).map((photo) => (
                                      <span key={photo.id ?? photo.name} className="flex items-center gap-1 rounded bg-pink-50 px-1.5 py-0.5 text-[10px] font-medium text-pink-600">
                                        <MdCamera className="text-[11px]" /> {photo.name}
                                      </span>
                                    ))}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Additional tasks */}
                  {(plan.additional_tasks ?? []).length > 0 && (
                    <Section icon={<MdChecklist />} title={`Additional tasks (${plan.additional_tasks.length})`}>
                      <ul className="space-y-1.5">
                        {plan.additional_tasks.map((task) => (
                          <li key={task.id} className="flex flex-wrap items-center gap-2 rounded border border-gray-200 bg-white px-2.5 py-2 text-xs text-slate-700">
                            <span className="font-medium">{task.name}</span>
                            <span className="text-[10px] text-slate-400">{titleCase(task.frequency_type)}</span>
                            {(task.photo ?? []).map((photo) => (
                              <span key={photo.id ?? photo.name} className="flex items-center gap-1 rounded bg-pink-50 px-1.5 py-0.5 text-[10px] font-medium text-pink-600">
                                <MdCamera className="text-[11px]" /> {photo.name}
                              </span>
                            ))}
                          </li>
                        ))}
                      </ul>
                    </Section>
                  )}

                  {/* Assigned workers */}
                  {(plan.workers ?? []).length > 0 && (
                    <Section icon={<TbUsers />} title={`Assigned workers (${plan.workers.length})`}>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {plan.workers.map((worker) => (
                          <div key={worker.worker_id} className="flex items-center gap-2 rounded border border-gray-200 bg-white p-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700">
                              {worker.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'W'}
                            </span>
                            <span className="min-w-0">
                              <b className="block truncate text-xs text-slate-700">{worker.name}</b>
                              <span className="text-[10px] capitalize text-slate-400">{titleCase(worker.position) || 'Normal'}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t px-5 py-3">
          <button
            onClick={() => setConfirmDelete(true)}
            className="mr-auto flex items-center gap-1.5 rounded border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
          >
            <MdDeleteOutline className="text-sm" /> Delete shift
          </button>

          <button
            onClick={onClose}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-gray-50 cursor-pointer"
          >
            Close
          </button>
        </footer>
      </div>

      {confirmDelete && (
        <div className="modal-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4" onMouseDown={() => !deleting && setConfirmDelete(false)}>
          <div className="w-full max-w-sm rounded-md border border-gray-200 bg-white p-5" onMouseDown={(event) => event.stopPropagation()}>
            <h4 className="text-sm font-bold text-slate-900">Delete this shift?</h4>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              This shift is removed from the roster. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={() => void handleDelete()}
                className="rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 cursor-pointer disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value?: string; hint?: string }) {
  return (
    <div className="flex items-start gap-3 rounded border border-gray-200 bg-gray-50/70 p-3">
      <span className="mt-0.5 shrink-0 text-base text-slate-400">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="mt-0.5 break-words text-sm font-medium text-slate-700">{value || '—'}</div>
        {hint && <div className="text-xs text-slate-400">{hint}</div>}
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-gray-200 bg-gray-50/70 p-4">
      <h4 className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className="text-sm text-sky-500">{icon}</span> {title}
      </h4>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded border border-gray-100 bg-white px-3 py-2">
      <span className="shrink-0 text-xs text-slate-500">{label}</span>
      <span className="break-words text-right text-xs font-semibold text-slate-800">
        {value === undefined || value === null || value === '' ? <span className="font-normal italic text-slate-400">Not set</span> : value}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-3 text-center">
      <div className="text-lg font-bold text-slate-800">{value}</div>
      <div className="text-[10px] font-semibold text-slate-400">{label}</div>
    </div>
  );
}

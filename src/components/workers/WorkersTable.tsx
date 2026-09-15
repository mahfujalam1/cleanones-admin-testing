"use client";

import { MdDeleteOutline, MdEdit, MdVisibility } from "react-icons/md";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";
import { getDashboardTranslation } from "@/lib/translations";
import { workerName, type Worker } from "@/redux/api/endpoints/workers.api";
import { WorkerAvatar } from "./WorkerAvatar";

const typeTone = (type: Worker["worker_type"]) =>
  type === "Employee" ? "bg-[#0ea5e9]/10 text-[#0ea5e9]" : "bg-[#8b5cf6]/10 text-[#8b5cf6]";

/** Columns the API cannot fill yet render this, rather than an empty cell. */
const Unavailable = () => <span className="text-gray-300">&mdash;</span>;

export function WorkersTable({
  workers,
  onViewWorker,
  onEditWorker,
  onDeleteWorker,
}: {
  workers: Worker[];
  onViewWorker: (worker: Worker) => void;
  onEditWorker: (worker: Worker) => void;
  onDeleteWorker: (worker: Worker) => void;
}) {
  const t = getDashboardTranslation(getLocale(usePathname()));
  const ui = getUiTranslation(getLocale(usePathname()));

  return (
    <div className="dashboard-card overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[820px]">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.1fr_1fr] gap-2 border-b border-gray-100 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <div>{t.managerAccess.name}</div>
            <div>{t.managerAccess.role}</div>
            <div>{ui.hourlyRate}</div>
            <div>{ui.workingHours}</div>
            <div>{ui.totalEarning}</div>
            <div className="text-right">{ui.actions}</div>
          </div>

          <div className="divide-y divide-gray-50">
            {workers.map((worker) => (
              <div
                key={worker._id}
                className="group grid grid-cols-[2fr_1fr_1fr_1fr_1.1fr_1fr] items-center gap-2 px-6 py-4 transition-colors hover:bg-gray-50/60"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <WorkerAvatar name={workerName(worker)} src={worker.profile_photo} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{workerName(worker)}</p>
                    <p className="truncate text-xs text-gray-400">{worker.email}</p>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${typeTone(worker.worker_type)}`}
                  >
                    {worker.worker_type}
                  </span>
                </div>

                <div className="text-sm text-gray-700">
                  {typeof worker.hourly_rate === "number" ? (
                    <>
                      <span className="font-semibold text-gray-900">&euro;{worker.hourly_rate.toFixed(2)}</span>
                      <span className="text-xs text-gray-400">/hr</span>
                    </>
                  ) : (
                    <Unavailable />
                  )}
                </div>

                <div className="text-sm text-gray-700">
                  {(() => {
                    const hours = worker.total_completed_work_hours ?? worker.worked_hours;
                    if (typeof hours === "number") {
                      return (
                        <>
                          <span className="font-semibold text-gray-900">{hours}</span>
                          <span className="text-xs text-gray-400"> {hours === 1 ? "hr" : "hrs"}</span>
                        </>
                      );
                    }
                    if (typeof hours === "string" && hours.trim()) {
                      return (
                        <span className="font-semibold text-gray-900">
                          {hours.endsWith("h") || hours.endsWith("hrs") ? hours : `${hours} hrs`}
                        </span>
                      );
                    }
                    return <Unavailable />;
                  })()}
                </div>

                <div className="text-sm text-gray-700">
                  {typeof worker.total_earning === "number" ? (
                    <span className="font-semibold text-gray-900">&euro;{worker.total_earning.toFixed(2)}</span>
                  ) : (
                    <Unavailable />
                  )}
                </div>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onViewWorker(worker)}
                    title={t.topbar.viewAll}
                    aria-label={`${t.topbar.viewAll} ${workerName(worker)}`}
                    className="cursor-pointer rounded p-1 text-gray-400 transition-colors hover:bg-sky-50 hover:text-[#0ea5e9]"
                  >
                    <MdVisibility className="text-base" />
                  </button>
                  <button
                    onClick={() => onEditWorker(worker)}
                    title={ui.editWorker}
                    aria-label={`Edit ${workerName(worker)}`}
                    className="cursor-pointer rounded p-1 text-gray-400 transition-colors hover:bg-sky-50 hover:text-[#0ea5e9]"
                  >
                    <MdEdit className="text-base" />
                  </button>
                  <button
                    onClick={() => onDeleteWorker(worker)}
                    title={ui.deleteWorker}
                    aria-label={`Delete ${workerName(worker)}`}
                    className="cursor-pointer rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <MdDeleteOutline className="text-base" />
                  </button>
                </div>
              </div>
            ))}

            {workers.length === 0 && (
              <p className="py-12 text-center text-xs text-slate-400">{t.common.noDataFound}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

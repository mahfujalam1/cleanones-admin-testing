"use client";

import React from "react";
import { TbPlus, TbTrash } from "react-icons/tb";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type { PlanTaskInput } from "@/services/actions/cleaningPlans";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";
import { getPlaceholderTranslation } from "@/lib/translations";

const controlClass =
  "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100";

interface TaskCardProps {
  task: PlanTaskInput;
  taskIndex: number;
  minDate?: string;
  maxDate?: string;
  updateTask: (index: number, update: Partial<PlanTaskInput>) => void;
  onRemove: () => void;
}

export function TaskCard({
  task,
  taskIndex,
  minDate,
  maxDate,
  updateTask,
  onRemove,
}: TaskCardProps) {
  const t = getDashboardTranslation(getLocale(usePathname()));
  const p = getPlaceholderTranslation(getLocale(usePathname()));
  const scheduleType = "fixed_date";

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header row: Task # + Remove */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <strong className="text-xs font-bold text-slate-700">{t.common.tasks} {taskIndex + 1}</strong>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-white text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          title="Remove task"
        >
          <TbTrash className="text-sm" />
        </button>
      </div>

      {/* Row 1: Task name & Schedule type */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">{t.common.tasks} *</label>
          <input
            required
            value={task.name}
            onChange={(e) => updateTask(taskIndex, { name: e.target.value })}
            placeholder={t.common.tasks}
            className={controlClass}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">{t.roster.title} *</label>
          <Select
            value="fixed_date"
            onValueChange={() => { }}
            options={[
              { value: "fixed_date", label: "Fixed date (one-time)" },
            ]}
          />
        </div>
      </div>

      {/* Row 2: Fixed date & Duration */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">{t.roster.date} *</label>
          <DatePicker
            value={task.fixed_date || ""}
            onValueChange={(val) =>
              updateTask(taskIndex, {
                fixed_date: val,
                schedule_type: "fixed_date",
                frequency_type: "fixed_date",
              })
            }
            min={minDate}
            max={maxDate}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">{t.common.duration}</label>
          <input
            type="number"
            min={1}
            value={task.duration ?? ""}
            onChange={(e) =>
              updateTask(taskIndex, { duration: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder={t.common.duration}
            className={controlClass}
          />
        </div>
      </div>

      {/* Photo Required Checkbox (Optional, not mandatory) */}
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={task.is_photo_req}
          onChange={(e) =>
            updateTask(taskIndex, {
              is_photo_req: e.target.checked,
              photo:
                e.target.checked && (!task.photo || task.photo.length === 0)
                  ? [{ name: "" }]
                  : task.photo,
            })
          }
          className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
        />
        {t.common.required}
      </label>

      {/* Photo List (Optional, photo not mandatory) */}
      {task.is_photo_req && (
        <div className="space-y-2 rounded-lg border border-gray-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-600">{t.common.photos}</p>
          {task.photo.map((photo, photoIndex) => (
            <div key={photoIndex} className="flex gap-2">
              <input
                value={photo.name}
                onChange={(e) =>
                  updateTask(taskIndex, {
                    photo: task.photo.map((item, index) =>
                      index === photoIndex ? { ...item, name: e.target.value } : item
                    ),
                  })
                }
                placeholder={p.photo}
                className={controlClass}
              />
              <button
                type="button"
                onClick={() =>
                  updateTask(taskIndex, {
                    photo: task.photo.filter((_, index) => index !== photoIndex),
                  })
                }
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <TbTrash className="text-sm" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateTask(taskIndex, {
                is_photo_req: true,
                photo: [...task.photo, { name: "" }],
              })
            }
            className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:underline cursor-pointer"
          >
            <TbPlus className="text-sm" /> Add photo
          </button>
        </div>
      )}
    </div>
  );
}

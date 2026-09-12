"use client";

import React, { useRef } from "react";
import { TbPlus } from "react-icons/tb";
import type { PlanTaskInput } from "@/services/actions/cleaningPlans";
import { TaskCard } from "./TaskCard";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDashboardTranslation } from "@/lib/translations";

export const newTask = (): PlanTaskInput => ({
  name: "",
  schedule_type: "fixed_date",
  frequency_type: "fixed_date",
  fixed_date: "",
  duration: undefined,
  is_photo_req: false,
  photo: [],
});

interface TaskEditorProps {
  tasks: PlanTaskInput[];
  setTasks: React.Dispatch<React.SetStateAction<PlanTaskInput[]>>;
  updateTask: (index: number, update: Partial<PlanTaskInput>) => void;
  minDate?: string;
  maxDate?: string;
}

export function TaskEditor({
  tasks,
  setTasks,
  updateTask,
  minDate,
  maxDate,
}: TaskEditorProps) {
  const t = getDashboardTranslation(getLocale(usePathname()));
  const tasksEndRef = useRef<HTMLDivElement | null>(null);

  const handleAddTask = () => {
    setTasks((items) => [...items, { ...newTask(), fixed_date: minDate || "" }]);
    // Auto-scroll smoothly to the newly added task section
    setTimeout(() => {
      tasksEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  };

  return (
    <section className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/70 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t.common.additionalTasks}</h3>
          <p className="text-[11px] font-normal text-slate-400">{t.common.photos}</p>
        </div>
        <button
          type="button"
          onClick={handleAddTask}
          className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 shadow-sm transition-colors cursor-pointer"
        >
          <TbPlus className="text-sm" /> {t.common.tasks}
        </button>
      </div>

      {!tasks.length && (
        <p className="p-4 text-center text-xs text-slate-400">{t.common.noDataFound}</p>
      )}

      {tasks.map((task, taskIndex) => (
        <TaskCard
          key={taskIndex}
          task={task}
          taskIndex={taskIndex}
          minDate={minDate}
          maxDate={maxDate}
          updateTask={updateTask}
          onRemove={() => setTasks((items) => items.filter((_, index) => index !== taskIndex))}
        />
      ))}

      <div ref={tasksEndRef} />
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { MdSearch } from "react-icons/md";
import { CardGridSkeleton } from "@/components/shared/SkeletonLoader";
import { useGetExtraServicesQuery, useGetCleaningPlansQuery } from "@/redux/api/dashboardApi";
// Clients now come from the new backend; the rest of this page is still on the old one.
import { CLIENT_LOOKUP_ARGS, useGetClientsQuery } from "@/redux/api/endpoints/clients.api";
import { additionalTaskStatus, useGetAdditionalTasksQuery } from "@/redux/api/endpoints/additionalTasks.api";
import { ExtraServiceCard } from "@/components/extra-services/ExtraServiceCard";
import { ExtraServiceModal } from "@/components/extra-services/ExtraServiceModal";
import type { UnifiedServiceRequest } from "@/components/extra-services/types";

/** The whole list is pulled in one page; this screen filters in the browser. */
const TASK_PAGE_SIZE = 100;

export default function ExtraServicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [clientId, setClientId] = useState("");
  const [selected, setSelected] = useState<UnifiedServiceRequest | null>(null);
  const [error, setError] = useState("");

  const { data: clientsRes } = useGetClientsQuery(CLIENT_LOOKUP_ARGS);

  const {
    data: servicesRes,
    isLoading: loadingServices,
    refetch: refetchServices,
  } = useGetExtraServicesQuery({
    status: status || undefined,
    client_id: clientId || undefined,
    search: search.trim() || undefined,
  });

  const {
    data: plansRes,
    isLoading: loadingPlans,
    refetch: refetchPlans,
  } = useGetCleaningPlansQuery({ limit: 50 });

  const {
    data: tasksRes,
    isLoading: loadingTasks,
    refetch: refetchTasks,
  } = useGetAdditionalTasksQuery({
    limit: TASK_PAGE_SIZE,
    searchTerm: search.trim() || undefined,
    sort: "-created_at",
  });

  const refetchAll = () => {
    void refetchServices();
    void refetchPlans();
    void refetchTasks();
  };

  /** Additional tasks only reference their plan by id, so names are borrowed from the plan list. */
  const plansById = useMemo(() => {
    const map = new Map<string, any>();
    for (const plan of (plansRes?.plans ?? []) as any[]) {
      if (plan?.id) map.set(String(plan.id), plan);
    }
    return map;
  }, [plansRes]);

  const items: UnifiedServiceRequest[] = useMemo(() => {
    const list: UnifiedServiceRequest[] = [];

    // 1. Extra Services requests
    for (const item of servicesRes?.requests ?? []) {
      list.push({
        id: item.id,
        planId: (item as any).plan_id || (item as any).cleaning_plan_id,
        title: item.title,
        description: item.description,
        status: item.status || "under_review",
        priority: item.priority,
        preferred_date: item.preferred_date,
        date_submitted: item.date_submitted,
        client_name: item.client_name || item.client?.name,
        location_id: item.location_id || item.location?.id,
        location_name: item.location_name || item.location?.name,
        room_name: item.room_name || item.room?.name,
        rejection_reason: item.rejection_reason,
        rawExtraService: item,
        isCleaningPlanTask: false,
      });
    }

    // 2. Additional tasks, straight from /additional-task/all-additional-tasks
    for (const task of tasksRes?.result ?? []) {
      const plan = plansById.get(String(task.cleaning_plan_id));
      const planClientId = plan?.client_id || plan?.client?.id;
      if (clientId && planClientId !== clientId) continue;

      list.push({
        id: task._id,
        taskId: task._id,
        planId: task.cleaning_plan_id,
        title: task.name,
        description: task.description || "",
        status: additionalTaskStatus(task),
        preferred_date: task.date_time ? task.date_time.slice(0, 10) : plan?.date,
        date_submitted: (task.createdAt ?? task.created_at)?.slice(0, 10),
        client_name: plan?.client_name || plan?.client?.name,
        location_id: plan?.location_id || plan?.location?.id,
        location_name: plan?.location_name || plan?.location?.name,
        rawAdditionalTask: task,
        isCleaningPlanTask: true,
      });
    }

    // Filter by search & status
    return list.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        (item.location_name && item.location_name.toLowerCase().includes(search.toLowerCase())) ||
        (item.client_name && item.client_name.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        !status || item.status.toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [servicesRes, tasksRes, plansById, search, status, clientId]);

  const loading = loadingServices || loadingPlans || loadingTasks;

  return (
    <div className="space-y-5 pb-10">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[240px] flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search extra services or additional tasks..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Client filter dropdown */}
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sky-500 max-w-[200px] truncate"
        >
          <option value="">All Clients</option>
          {clientsRes?.result?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Status filter dropdown */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sky-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </p>
      )}

      {/* Requests Grid */}
      {loading ? (
        <CardGridSkeleton cards={6} />
      ) : (
        <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ExtraServiceCard
              key={`${item.planId || "es"}-${item.id}`}
              item={item}
              onClick={() => setSelected(item)}
            />
          ))}

          {items.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <p className="text-sm font-semibold text-slate-700">No service requests found</p>
              <p className="text-xs text-slate-400 mt-1">
                New extra services and client additional tasks will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cleaning Plan Modal View */}
      {selected && (
        <ExtraServiceModal
          request={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            refetchAll();
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

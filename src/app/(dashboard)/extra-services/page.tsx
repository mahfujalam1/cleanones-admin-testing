"use client";

import { useEffect, useMemo, useState } from "react";
import { MdSearch } from "react-icons/md";
import { CardGridSkeleton } from "@/components/shared/SkeletonLoader";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { useGetExtraServicesQuery, useGetCleaningPlansQuery } from "@/redux/api/dashboardApi";
// Clients now come from the new backend; the rest of this page is still on the old one.
import { CLIENT_LOOKUP_ARGS, clientLabel, useGetClientsQuery } from "@/redux/api/endpoints/clients.api";
import { additionalTaskStatus, useGetAdditionalTasksQuery } from "@/redux/api/endpoints/additionalTasks.api";
import { ExtraServiceCard } from "@/components/extra-services/ExtraServiceCard";
import { ExtraServiceModal } from "@/components/extra-services/ExtraServiceModal";
import type { UnifiedServiceRequest } from "@/components/extra-services/types";
import { Select } from "@/components/ui/select";

/** The whole list is pulled in one page; this screen filters in the browser. */
const TASK_PAGE_SIZE = 100;
const LIMIT = 12;

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

export default function ExtraServicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [clientId, setClientId] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<UnifiedServiceRequest | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [search, status, clientId]);

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
      const planIdStr = (item as any).plan_id
        ? String((item as any).plan_id?._id || (item as any).plan_id)
        : (item as any).cleaning_plan_id
        ? String((item as any).cleaning_plan_id?._id || (item as any).cleaning_plan_id)
        : undefined;

      list.push({
        id: item.id,
        planId: planIdStr,
        title: item.title,
        description: item.description,
        status: item.status || "under_review",
        priority: item.priority,
        preferred_date: item.preferred_date,
        date_submitted: item.date_submitted,
        client_id: item.client_id ? String(item.client_id) : item.client?.id ? String(item.client.id) : undefined,
        client_name: item.client_name || item.client?.name,
        location_id: item.location_id ? String(item.location_id) : item.location?.id ? String(item.location.id) : undefined,
        location_name: item.location_name || item.location?.name,
        room_name: item.room_name || item.room?.name,
        rejection_reason: item.rejection_reason,
        rawExtraService: item,
        isCleaningPlanTask: false,
      });
    }

    // 2. Additional tasks, straight from /additional-task/all-additional-tasks
    for (const task of tasksRes?.result ?? []) {
      const planObj = typeof task.cleaning_plan_id === "object" && task.cleaning_plan_id ? (task.cleaning_plan_id as any) : null;
      const planIdStr = String(planObj?._id || task.cleaning_plan_id || "");
      const plan = plansById.get(planIdStr) || planObj;
      const planClientId = plan?.client_id || (typeof plan?.client === "object" ? plan.client?._id || plan.client?.id : plan?.client);
      const planClientName = plan?.client_name || (typeof plan?.client === "object" ? plan.client?.name || plan.client?.company_name : plan?.client);
      if (clientId && planClientId !== clientId) continue;

      list.push({
        id: task._id,
        taskId: task._id,
        planId: planIdStr,
        title: task.name,
        description: task.description || "",
        status: additionalTaskStatus(task),
        preferred_date: task.date_time ? task.date_time.slice(0, 10) : plan?.date,
        date_submitted: (task.createdAt ?? task.created_at)?.slice(0, 10),
        client_id: planClientId ? String(planClientId) : undefined,
        client_name: typeof planClientName === "string" ? planClientName : undefined,
        location_id: plan?.location_id ? String(plan.location_id) : (typeof plan?.location === "object" ? String(plan.location?._id || plan.location?.id || "") : undefined),
        location_name: plan?.location_name || (typeof plan?.location === "object" ? plan.location?.name : undefined),
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

  const pagedItems = useMemo(() => {
    return items.slice((page - 1) * LIMIT, page * LIMIT);
  }, [items, page]);

  const loading = loadingServices || loadingPlans || loadingTasks;

  return (
    <div className="space-y-5 pb-10">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
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
        <div className="w-full sm:w-52">
          <Select
            value={clientId}
            onValueChange={setClientId}
            placeholder="All Clients"
            options={[
              { value: "", label: "All Clients" },
              ...(clientsRes?.result ?? []).map((c) => ({
                value: c._id,
                label: clientLabel(c),
              })),
            ]}
          />
        </div>

        {/* Status filter dropdown */}
        <div className="w-full sm:w-44">
          <Select
            value={status}
            onValueChange={setStatus}
            placeholder="All Statuses"
            options={STATUS_OPTIONS}
          />
        </div>
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
          {pagedItems.map((item) => (
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

      <BackendPagination
        page={page}
        limit={LIMIT}
        total={items.length}
        onPageChange={setPage}
        itemLabel="requests"
      />

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

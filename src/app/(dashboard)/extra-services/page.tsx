"use client";

import { useEffect, useMemo, useState } from "react";
import { MdSearch } from "react-icons/md";
import { CardGridSkeleton } from "@/components/shared/SkeletonLoader";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getUiTranslation } from "@/lib/translations";

import { CLIENT_LOOKUP_ARGS, clientLabel, useGetClientsQuery } from "@/redux/api/endpoints/clients.api";
import { additionalTaskStatus, useGetAdditionalTasksQuery } from "@/redux/api/endpoints/additionalTasks.api";
import { useGetCleaningPlanListQuery, type CleaningPlan } from "@/redux/api/endpoints/cleaningPlans.api";
import { refDoc, refId, refLabel } from "@/redux/api/types";
import { ExtraServiceCard } from "@/components/extra-services/ExtraServiceCard";
import { ExtraServiceModal } from "@/components/extra-services/ExtraServiceModal";
import type { UnifiedServiceRequest } from "@/components/extra-services/types";
import { Select } from "@/components/ui/select";


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
  const ui = getUiTranslation(getLocale(usePathname()));
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
    data: plansRes,
    isLoading: loadingPlans,
    refetch: refetchPlans,
  } = useGetCleaningPlanListQuery({ limit: 50 });

  const {
    data: tasksRes,
    isLoading: loadingTasks,
    refetch: refetchTasks,
  } = useGetAdditionalTasksQuery({
    limit: TASK_PAGE_SIZE,
    searchTerm: search.trim() || undefined,
    sort: "-createdAt",
  });

  const refetchAll = () => {
    void refetchPlans();
    void refetchTasks();
  };

  
  const plansById = useMemo(() => {
    const map = new Map<string, CleaningPlan>();
    for (const plan of plansRes?.result ?? []) map.set(plan._id, plan);
    return map;
  }, [plansRes]);

  const items: UnifiedServiceRequest[] = useMemo(() => {
    const list: UnifiedServiceRequest[] = [];

    
    for (const task of tasksRes?.result ?? []) {
      
      const planIdStr = refId(task.cleaning_plan_id);
      const plan = plansById.get(planIdStr);
      const planClient = plan ? refDoc(plan.client) : null;
      const planClientId = plan ? refId(plan.client) : "";
      const planClientName = planClient ? clientLabel(planClient) : refLabel(task.cleaning_plan_id);
      if (clientId && planClientId !== clientId) continue;

      list.push({
        id: task._id,
        taskId: task._id,
        planId: planIdStr,
        title: task.name,
        description: task.description || "",
        status: additionalTaskStatus(task),
        preferred_date: task.date_time ? task.date_time.slice(0, 10) : plan?.date_time?.slice(0, 10),
        date_submitted: task.createdAt?.slice(0, 10),
        client_id: planClientId || undefined,
        client_name: planClientName || undefined,
        location_id: plan ? refId(plan.location) || undefined : undefined,
        location_name: plan ? refLabel(plan.location) || undefined : undefined,
        rawAdditionalTask: task,
        isCleaningPlanTask: true,
      });
    }

    
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
  }, [tasksRes, plansById, search, status, clientId]);

  const pagedItems = useMemo(() => {
    return items.slice((page - 1) * LIMIT, page * LIMIT);
  }, [items, page]);

  const loading = loadingPlans || loadingTasks;

  return (
    <div className="space-y-5 pb-10">
      
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ui.searchExtraServices}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        
        <div className="w-full sm:w-52">
          <Select
            value={clientId}
            onValueChange={setClientId}
            placeholder={ui.allClients}
            options={[
              { value: "", label: ui.allClients },
              ...(clientsRes?.result ?? []).map((c) => ({
                value: c._id,
                label: clientLabel(c),
              })),
            ]}
          />
        </div>

        
        <div className="w-full sm:w-44">
          <Select
            value={status}
            onValueChange={setStatus}
            placeholder={ui.allStatuses}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </p>
      )}

      
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
              <p className="text-sm font-semibold text-slate-700">{ui.noServiceRequests}</p>
              <p className="text-xs text-slate-400 mt-1">
                {ui.newServicesAppearHere}
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

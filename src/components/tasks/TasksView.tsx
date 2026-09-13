"use client";

import { useEffect, useState } from "react";
import { MdAdd, MdTaskAlt, MdSearch, MdClose} from "react-icons/md";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getLocale, localizePath } from "@/lib/locale";
import { CardGridSkeleton, ErrorNotice } from "@/components/shared/ListStates";
import { BackendPagination } from "@/components/shared/BackendPagination";
import { apiError } from "@/redux/api/apiError";
import {
  useGetTasksQuery,
  useDeleteTaskMutation,
} from "@/redux/api/endpoints/tasks.api";
import { CONTROL_CLASS } from "@/components/shared/Field";
import TaskCard from "./TaskCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TaskForm } from "./TaskForm";
import { TaskViewModal } from "./TaskViewModal";

interface TasksViewProps {
  scopedClientId?: string;
  scopedLocationId?: string;
  scopedRoomId?: string;
}

export function TasksView({
  scopedClientId,
  scopedLocationId,
  scopedRoomId,
}: TasksViewProps) {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const router = useRouter();
  const query = useSearchParams();

  const activeTab = query.get("tab") || "All";
  const searchText = query.get("search") || "";
  const [searchInput, setSearchInput] = useState(searchText);
  const page = parseInt(query.get("page") || "1");
  const limit = parseInt(query.get("limit") || "10");

  useEffect(() => {
    setSearchInput(searchText);
  }, [searchText]);

  const createQuery = (override: Record<string, string | undefined | null>) => {
    const params = new URLSearchParams();
    if (scopedClientId) params.set("clientId", scopedClientId);
    if (scopedLocationId) params.set("locationId", scopedLocationId);
    if (scopedRoomId) params.set("roomId", scopedRoomId);
    if (override.tab !== undefined) params.set("tab", String(override.tab));
    else if (activeTab) params.set("tab", activeTab);
    if (override.search !== undefined) params.set("search", String(override.search));
    else if (searchText) params.set("search", searchText);
    if (override.page !== undefined) params.set("page", String(override.page));
    else if (page) params.set("page", String(page));
    if (override.limit !== undefined) params.set("limit", String(override.limit));
    else if (limit) params.set("limit", String(limit));
    return params.toString();
  };

  const { data, isLoading, error, refetch } = useGetTasksQuery(
    {
      roomId: scopedRoomId || "",
      page,
      limit,
      searchTerm: searchText || undefined,
      tab: activeTab,
    } as any,
    {
      skip: !scopedRoomId,
    }
  );

  const [deleteTask] = useDeleteTaskMutation();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [taskModalTarget, setTaskModalTarget] = useState<any | "new" | null>(null);
  const [viewTarget, setViewTarget] = useState<any | null>(null);

  const totalTasks = data?.meta?.total || 0;
  const paginatedTasks = data?.result || [];

  useEffect(() => {
    if (scopedRoomId) refetch();
  }, [scopedRoomId, refetch]);

  const setTab = (tab: string) => router.push(`${pathname}?${createQuery({ tab, page: "1" })}`);
  
  // Update the URL only (debounce is handled via local effect)
  const applySearch = (search: string) => router.push(`${pathname}?${createQuery({ search, page: "1", tab: "All" })}`);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== searchText) {
        applySearch(searchInput);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput, searchText]);

  const setPage = (page: number) => router.push(`${pathname}?${createQuery({ page: String(page) })}`);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask({ id: deleteTarget, roomId: scopedRoomId || "" }).unwrap();
      setDeleteTarget(null);
      router.refresh();
    } catch {
      // Ignore error, UI will show toast via RTK Query error handler
    }
  };

  const getTaskLink = (task: { _id: string; location_id: string; room_id: string; name: string }) => {
    const path = scopedClientId
      ? `/clients/${scopedClientId}/locations/${task.location_id}/rooms/${task.room_id}/tasks/${task._id}`
      : `/tasks/${task._id}`;
    return localizePath(path, locale);
  };

  const getRoomTitle = (task: { room_name?: string; cleaning_plan?: string }) => {
    if (task.room_name) return task.room_name;
    if (task.cleaning_plan) return task.cleaning_plan;
    return "Unnamed room";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[280px]">
          <div className={`${CONTROL_CLASS} flex items-center gap-2`}>
            <MdSearch className="shrink-0 text-lg text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks by name or description..."
              className="flex-1 min-w-0 border-none outline-none bg-transparent placeholder:text-slate-400"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="shrink-0 text-lg text-slate-400 hover:text-slate-600"
              >
                <MdClose />
              </button>
            )}
          </div>
        </div>

        {scopedRoomId && (
          <button
            onClick={() => setTaskModalTarget("new")}
            className="inline-flex items-center gap-2 rounded border border-primary bg-primary px-3 py-2 text-xs text-white hover:bg-primary-dark transition-colors"
          >
            <MdAdd className="text-lg" />
            <span>Add task</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : error && !((error as any).status === 404 || apiError(error).toLowerCase().includes("not found") || apiError(error).toLowerCase().includes("no data")) ? (
        <ErrorNotice message={apiError(error)} />
      ) : (
        <div className="space-y-4">
          {paginatedTasks.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <MdTaskAlt className="mx-auto h-16 w-16 text-slate-200" />
              <p className="mt-4 font-semibold">No tasks</p>
              <p className="mt-1 text-sm text-slate-500">
                {searchText
                  ? "We couldn't find any tasks matching your search."
                  : activeTab === "Todo"
                    ? "No todo tasks found."
                    : "No tasks have been created."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginatedTasks.map((task: any) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onSelect={() => setViewTarget(task)}
                    onEdit={() => setTaskModalTarget(task)}
                    onDelete={() => setDeleteTarget(task._id)}
                  />
                ))}
              </div>
              {totalTasks > limit && (
                <BackendPagination
                  page={page}
                  limit={limit}
                  total={totalTasks}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      )}

      {!!deleteTarget && (
        <ConfirmDialog
          title="Delete Task"
          description="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete Task"
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
          destructive={true}
        />
      )}

      {taskModalTarget && (
        <TaskForm
          roomId={scopedRoomId || (taskModalTarget !== "new" ? taskModalTarget.room : "")}
          task={taskModalTarget === "new" ? undefined : taskModalTarget}
          onClose={() => setTaskModalTarget(null)}
        />
      )}

      {viewTarget && (
        <TaskViewModal
          task={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}
    </div>
  );
}

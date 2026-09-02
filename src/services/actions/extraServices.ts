import { authenticated, type ActionResult } from "./auth";

export type ExtraServiceWorkerDropdownItem = {
  worker_id: string;
  name: string;
  profile_photo?: string;
  profile_picture?: string;
  worker_type?: string;
  position?: string;
  email?: string;
  phone?: string;
  is_available?: boolean;
  unavailable_reason?: string;
  avg_daily_work_minutes?: number;
  total_shifts_this_month?: number;
  total_work_minutes_this_month?: number;
  formatted_avg_work?: string;
  last_work_end_time?: string;
  last_work_ended_ago?: string;
  minutes_since_last_work?: number;
};

export type ExtraServiceWorkerDropdownResponse = {
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;
  request_id: string;
  preferred_date?: string;
  time_window?: string;
  workers: ExtraServiceWorkerDropdownItem[];
};

export type ExtraServiceRequest = {
  id: string;
  title: string;
  preferred_date: string;
  priority: string;
  description: string;
  status: string;
  client_id: string;
  client_name: string;
  location_id: string;
  location_name: string;
  room_id: string;
  room_name: string;
  client: { id: string; name: string };
  location: { id: string; name: string };
  room: { id: string; name: string };
  date_submitted: string;
  rejection_reason?: string;
  assigned_workers: Array<{
    worker_id: string;
    name: string;
    email?: string;
    role?: string;
    worker_type?: string;
    position?: string;
    phone?: string;
    profile_photo?: string;
    profile_picture?: string;
  }>;
  tasks: Array<{ id: string; name: string; is_completed: boolean; completed_at?: string }>;
  total_tasks_count?: number;
  total_photos_count?: number;
  required_photos: Array<{ id: string; name: string; photo_url?: string; is_uploaded?: boolean; uploaded_at?: string }>;
  estimated_hours: number;
  actual_start_time?: string;
  actual_finish_time?: string;
  hours_credited?: number;
  created_at: string;
  updated_at: string;
};

const jsonHeader = (val: unknown) => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify(val) });

export async function getExtraServices(input: { status?: string; search?: string; page?: number; limit?: number } = {}) {
  const q = new URLSearchParams({ page: String(input.page ?? 1), limit: String(input.limit ?? 100) });
  if (input.status) q.set("status_val", input.status);
  if (input.search) q.set("search", input.search);
  return authenticated<{ total_count: number; page: number; limit: number; has_more: boolean; requests: ExtraServiceRequest[] }>(`/manager/extra-services?${q}`, { method: "GET" });
}

export async function getExtraService(id: string) {
  return authenticated<ExtraServiceRequest>(`/manager/extra-services/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function rejectExtraService(id: string, reason = "Service requested is outside operational scope.") {
  return authenticated<ExtraServiceRequest>(`/manager/extra-services/${encodeURIComponent(id)}/reject`, {
    method: "POST",
    ...jsonHeader({ reason })
  });
}

export async function approveExtraService(id: string, input: {
  worker_ids?: string[];
  workers?: Array<{ worker_id: string; position?: string }>;
  action?: string;
  required_photos?: string[];
  estimated_hours?: number;
  admin_notes?: string;
}) {
  const body = {
    worker_ids: input.worker_ids ?? (input.workers?.map(w => w.worker_id) || []),
    workers: input.workers ?? (input.worker_ids?.map(id => ({ worker_id: id, position: "normal" })) || []),
    action: input.action ?? "append",
    required_photos: input.required_photos ?? [],
    estimated_hours: input.estimated_hours ?? 1,
    admin_notes: input.admin_notes ?? ""
  };
  return authenticated<ExtraServiceRequest>(`/manager/extra-services/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    ...jsonHeader(body)
  });
}

export async function getExtraServiceWorkersDropdown(id: string, input: { search?: string; workerType?: string; sortBy?: string; page?: number; limit?: number } = {}) {
  const q = new URLSearchParams({ page: String(input.page ?? 1), limit: String(input.limit ?? 50) });
  if (input.search) q.set("search", input.search);
  if (input.workerType) q.set("worker_type", input.workerType);
  if (input.sortBy) q.set("sort_by", input.sortBy);
  return authenticated<ExtraServiceWorkerDropdownResponse>(`/manager/extra-services/${encodeURIComponent(id)}/workers-dropdown?${q}`, { method: "GET" });
}

export async function assignExtraServiceWorkers(id: string, input: {
  workers: Array<{ worker_id: string; position?: string }>;
  action?: string;
  estimated_hours?: number;
  admin_notes?: string;
}, force = true) {
  const q = new URLSearchParams({ force: String(force) });
  return authenticated<ExtraServiceRequest>(`/manager/extra-services/${encodeURIComponent(id)}/assign-workers?${q}`, {
    method: "POST",
    ...jsonHeader({
      workers: input.workers,
      action: input.action ?? "append",
      estimated_hours: input.estimated_hours ?? 0,
      admin_notes: input.admin_notes ?? ""
    })
  });
}

export async function completeApproveExtraService(id: string) {
  return authenticated<ExtraServiceRequest>(`/manager/extra-services/${encodeURIComponent(id)}/complete-approve`, { method: "POST" });
}

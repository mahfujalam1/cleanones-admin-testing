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
  tasks: Array<ExtraServiceTaskDetail>;
  total_tasks_count?: number;
  total_photos_count?: number;
  required_photos: Array<{ id: string; name: string; photo_url?: string; is_uploaded?: boolean; uploaded_at?: string }>;
  start_time?: string;
  duration_minutes?: number;
  duration?: string;
  end_time?: string;
  estimated_hours: number;
  actual_start_time?: string;
  actual_finish_time?: string;
  plan_id?: string;
  plan_name?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExtraServiceTaskDetail = {
  id: string;
  name: string;
  frequency_type?: string;
  is_photo_req?: boolean;
  photo?: Array<{ id?: string; name: string }>;
  total_photos_required?: number;
  is_completed?: boolean;
  completed_at?: string | null;
  weekly_days?: string[] | null;
  monthly_dates?: number[] | null;
  fixed_date?: string | null;
  duration_minutes?: number | null;
  description?: string | null;
};

const jsonHeader = (val: unknown) => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify(val) });


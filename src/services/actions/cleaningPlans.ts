import { authenticated } from "./auth";

export type PlanRoomOption = {
    photo_number: number;
    room_id: string;
    room_name: string;
    room_type: string;
    task_number: number;
};
export type PlanTaskInput = {
    id?: string;
    name: string;
    description?: string;
    frequency_type: "every_visit" | "weekly" | "monthly" | "yearly" | "fixed_date" | string;
    schedule_type?: "fixed_date" | "recurring" | string;
    fixed_date?: string;
    duration?: number;
    duration_minutes?: number;
    is_photo_req: boolean;
    photo: Array<{ id?: string; name: string }>;
    total_photos_required?: number;
    weekly_days?: string[] | null;
    monthly_dates?: number[] | null;
};
export type PlanWorkerOption = {
    worker_id: string;
    name: string;
    profile_photo: string;
    worker_type: string;
    position: string;
    email: string;
    phone: string;
    is_available: boolean;
    unavailable_reason: string | null;
    avg_daily_work_minutes: number;
    total_shifts_this_month: number;
    total_work_minutes_this_month: number;
    formatted_avg_work: string;
    last_work_end_time: string;
    last_work_ended_ago: string;
    minutes_since_last_work: number;
};
export type WorkerAssignment = {
    worker_id: string;
    position: "teamleader" | "co_leader" | "normal";
};
export type PlanInput = {
    title: string;
    room_ids: string[];
    date: string;
    start_time: string;
    repeat_shift: string;
    repeat_until?: string;
    working_days: string[];
    timezone?: string;
    shift_notes: string;
    additional_tasks: PlanTaskInput[];
};
export type PlanSummary = {
    id: string;
    title: string;
    clients_count: number;
    client_names: string[];
    location_name?: string;
    location_names?: string[];
    rooms_count: number;
    room_names: string[];
    workers_count: number;
    worker_names: string[];
    total_tasks_count: number;
    total_photos_count: number;
    date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    repeat_shift: string;
    repeat_until: string;
    working_days: string[];
    status: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};
export type PlanDetails = PlanSummary & {
    shift_notes: string;
    client_id?: string;
    company_name?: string;
    location_name?: string;
    location_names?: string[];
    locations?: Array<{ location_id: string; location_name?: string; name?: string }>;
    clients?: Array<{ client_id: string; company_name: string; primary_contact_name?: string; email?: string; phone?: string; rooms_count?: number }>;
    manager?: { manager_id: string; name: string; email?: string; role?: string; phone?: string; profile_photo?: string | null };
    timezone?: string;
    room_ids: string[];
    rooms: Array<{
        room_id: string;
        room_name: string;
        room_type: string;
        floor: number;
        duration: number;
        task_number: number;
        total_photos_required: number;
        photo_number?: number;
        monthly_cleaning_frequency?: number;
        clean_type?: string;
        tasks: Array<PlanTaskInput & { id: string; total_photos_required?: number }>;
        required_photos?: Array<{ id: string; name: string }>;
    }>;
    worker_ids: string[];
    workers: Array<{
        worker_id: string;
        name: string;
        position: string;
        profile_photo: string;
    }>;
    additional_tasks: Array<
        PlanTaskInput & { id: string; total_photos_required?: number }
    >;
    pending_additional_tasks?: PendingAdditionalTask[];
    additional_required_photos?: Array<{ id: string; name: string }>;
};
export type PendingAdditionalTask = {
    id: string;
    name: string;
    description?: string;
    frequency_type?: string;
    is_photo_req?: boolean;
    photo?: Array<{ id?: string; name: string }>;
    total_photos_required?: number;
    weekly_days?: string[];
    monthly_dates?: number[];
    fixed_date?: string;
    duration_minutes?: number;
    status: string;
    requested_by?: string;
    requested_by_name?: string;
    requested_at?: string;
    reviewed_by?: string;
    reviewed_by_name?: string;
    reviewed_at?: string;
    rejection_reason?: string;
};
const json = (value: unknown) => ({
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
});
export async function getPlanRooms(
    input: {
        clientId?: string;
        locationId?: string;
        search?: string;
        page?: number;
        limit?: number;
    } = {},
) {
    const query = new URLSearchParams({
        page: String(input.page ?? 1),
        limit: String(input.limit ?? 100),
    });
    if (input.clientId) query.set("client_id", input.clientId);
    if (input.locationId) query.set("location_id", input.locationId);
    if (input.search) query.set("search", input.search);
    return authenticated<{
        total_count: number;
        page: number;
        limit: number;
        has_more: boolean;
        rooms: PlanRoomOption[];
    }>(`/manager/dropdowns/rooms?${query}`, { method: "GET" });
}
export async function createCleaningPlan(input: PlanInput) {
    return authenticated<PlanDetails>("/manager/cleaning-plans", {
        method: "POST",
        ...json(input),
    });
}
export async function getCleaningPlans(
    input: {
        clientId?: string;
        locationId?: string;
        roomId?: string;
        workerId?: string;
        search?: string;
        page?: number;
        limit?: number;
    } = {},
) {
    const query = new URLSearchParams({
        page: String(input.page ?? 1),
        limit: String(input.limit ?? 100),
    });
    Object.entries({
        client_id: input.clientId,
        location_id: input.locationId,
        room_id: input.roomId,
        worker_id: input.workerId,
        search: input.search,
    }).forEach(([key, value]) => {
        if (value) query.set(key, value);
    });
    return authenticated<{
        total_count: number;
        page: number;
        limit: number;
        has_more: boolean;
        plans: PlanSummary[];
    }>(`/manager/cleaning-plans?${query}`, { method: "GET" });
}
export async function getCleaningPlan(planId: string) {
    return authenticated<PlanDetails>(
        `/manager/cleaning-plans/${encodeURIComponent(planId)}`,
        { method: "GET" },
    );
}
export async function updateCleaningPlan(
    planId: string,
    input: Partial<PlanInput> & {
        worker_ids?: string[];
        duration_minutes?: number;
        description?: string;
        location_id?: string;
        frequency_type?: string;
        status?: string;
        is_active?: boolean;
    },
) {
    return authenticated<PlanDetails>(
        `/manager/cleaning-plans/${encodeURIComponent(planId)}`,
        { method: "PATCH", ...json(input) },
    );
}
export async function deleteCleaningPlan(planId: string) {
    return authenticated<string>(
        `/manager/cleaning-plans/${encodeURIComponent(planId)}`,
        { method: "DELETE" },
    );
}
export async function getPlanWorkers(
    planId: string,
    input: {
        search?: string;
        workerType?: string;
        sortBy?: string;
        page?: number;
        limit?: number;
    } = {},
) {
    const query = new URLSearchParams({
        sort_by: input.sortBy ?? "smart",
        page: String(input.page ?? 1),
        limit: String(input.limit ?? 10),
    });
    if (input.search) query.set("search", input.search);
    if (input.workerType && input.workerType !== "all")
        query.set("worker_type", input.workerType);
    return authenticated<{
        total_count: number;
        page: number;
        limit: number;
        has_more: boolean;
        plan_id: string;
        plan_date: string;
        plan_time_window: string;
        workers: PlanWorkerOption[];
    }>(
        `/manager/cleaning-plans/${encodeURIComponent(planId)}/workers-dropdown?${query}`,
        { method: "GET" },
    );
}
export async function assignPlanWorkers(
    planId: string,
    workers: WorkerAssignment[],
    action: "append" | "replace" = "append",
    force = false,
) {
    const query = new URLSearchParams({ force: String(force) });
    return authenticated<PlanDetails>(
        `/manager/cleaning-plans/${encodeURIComponent(planId)}/assign-workers?${query}`,
        { method: "POST", ...json({ workers, action }) },
    );
}

export async function approveAdditionalTask(planId: string, taskId: string) {
    return authenticated<PlanDetails>(
        `/manager/cleaning-plans/${encodeURIComponent(planId)}/additional-tasks/${encodeURIComponent(taskId)}/approve`,
        { method: "POST" }
    );
}

export async function rejectAdditionalTask(planId: string, taskId: string, reason?: string) {
    const text = reason || "Service requested is outside operational scope.";
    return authenticated<PlanDetails>(
        `/manager/cleaning-plans/${encodeURIComponent(planId)}/additional-tasks/${encodeURIComponent(taskId)}/reject`,
        { method: "POST", ...json({ reason: text, rejection_reason: text }) }
    );
}

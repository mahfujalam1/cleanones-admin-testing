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
/**
 * `/manager/cleaning-plans/{id}` is gone from the backend — it answers 404 — so this reads the
 * plan from `/cleaning-plan/single-cleaning-plan/{id}` and reshapes it into `PlanDetails`.
 *
 * The new payload is the leaner document model: it has no shift scheduling fields
 * (`start_time`, `end_time`, `repeat_shift`, `repeat_until`, `working_days`, `shift_notes`,
 * `timezone`) and no per-room task breakdown. Those come back blank here, exactly as they did
 * while the old route was 404ing, so nothing regresses — but a screen that needs them still
 * needs an endpoint that supplies them.
 */
export async function getCleaningPlan(planId: string) {
    const res = await authenticated<SingleCleaningPlan>(
        `/cleaning-plan/single-cleaning-plan/${encodeURIComponent(planId)}`,
        { method: "GET" },
    );
    if (!res.success) return res;
    return { ...res, data: toPlanDetails(res.data) };
}

/** Only the fields this adapter reads; the full shape lives in `redux/api/endpoints`. */
type PlanRef<T> = string | T;
type SingleCleaningPlan = {
    _id: string;
    title?: string;
    description?: string;
    note?: string;
    client?: PlanRef<{ _id: string; name?: string; company_name?: string; email?: string; phone?: string }>;
    location?: PlanRef<{ _id: string; name?: string }>;
    rooms?: Array<PlanRef<{ _id: string; name?: string; room_type?: string; floor?: number }>>;
    assigned_workers?: Array<{
        worker?: PlanRef<{ _id: string; name?: string; position?: string; profile_photo?: string }>;
        role?: string;
    }>;
    additional_tasks?: Array<PlanRef<{
        _id: string;
        name?: string;
        description?: string;
        duration_minutes?: number;
        is_photo_required?: boolean;
        photo_requirements?: Array<{ title: string }>;
        date_time?: string;
        is_approved?: boolean;
    }>>;
    date_time?: string;
    end_date?: string;
    max_estimated_duration?: number;
    status?: string;
    is_active?: boolean;
    manager?: string;
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
};

/** A reference comes back either as a bare id or as the populated document. */
const populated = <T extends object>(ref: PlanRef<T> | undefined | null): T | null =>
    ref && typeof ref === "object" ? ref : null;
const idOf = (ref: PlanRef<{ _id: string }> | undefined | null): string =>
    typeof ref === "string" ? ref : ref?._id ?? "";
const dayOf = (value?: string) => (value ? value.slice(0, 10) : "");

function toPlanDetails(plan: SingleCleaningPlan): PlanDetails {
    const client = populated(plan.client);
    const location = populated(plan.location);
    const rooms = (plan.rooms ?? []).map(populated).filter(Boolean) as Array<{
        _id: string; name?: string; room_type?: string; floor?: number;
    }>;
    const workers = (plan.assigned_workers ?? [])
        .map((entry) => ({ worker: populated(entry.worker), role: entry.role }))
        .filter((entry) => entry.worker) as Array<{
            worker: { _id: string; name?: string; position?: string; profile_photo?: string };
            role?: string;
        }>;
    const tasks = (plan.additional_tasks ?? []).map(populated).filter(Boolean) as Array<{
        _id: string;
        name?: string;
        description?: string;
        duration_minutes?: number;
        is_photo_required?: boolean;
        photo_requirements?: Array<{ title: string }>;
        date_time?: string;
    }>;

    const clientName = client?.company_name || client?.name || "";
    const mappedTasks = tasks.map((task) => ({
        id: task._id,
        name: task.name ?? "",
        description: task.description,
        frequency_type: task.date_time ? "fixed_date" : "every_visit",
        fixed_date: dayOf(task.date_time),
        duration_minutes: task.duration_minutes,
        is_photo_req: Boolean(task.is_photo_required),
        photo: (task.photo_requirements ?? []).map((photo) => ({ name: photo.title })),
        total_photos_required: task.photo_requirements?.length ?? 0,
    }));

    return {
        id: plan._id,
        title: plan.title ?? "",
        clients_count: client ? 1 : 0,
        client_names: clientName ? [clientName] : [],
        client_id: idOf(plan.client),
        company_name: clientName,
        clients: client
            ? [{ client_id: client._id, company_name: clientName, email: client.email, phone: client.phone }]
            : [],
        location_name: location?.name,
        location_names: location?.name ? [location.name] : [],
        locations: location ? [{ location_id: location._id, location_name: location.name, name: location.name }] : [],
        rooms_count: plan.rooms?.length ?? 0,
        room_names: rooms.map((room) => room.name ?? ""),
        room_ids: (plan.rooms ?? []).map(idOf),
        rooms: rooms.map((room) => ({
            room_id: room._id,
            room_name: room.name ?? "",
            room_type: room.room_type ?? "",
            floor: room.floor ?? 0,
            // The document model keeps tasks on the plan, not per room.
            duration: 0,
            task_number: 0,
            total_photos_required: 0,
            tasks: [],
        })),
        workers_count: plan.assigned_workers?.length ?? 0,
        worker_names: workers.map((entry) => entry.worker.name ?? ""),
        worker_ids: (plan.assigned_workers ?? []).map((entry) => idOf(entry.worker)),
        workers: workers.map((entry) => ({
            worker_id: entry.worker._id,
            name: entry.worker.name ?? "",
            position: entry.role || entry.worker.position || "",
            profile_photo: entry.worker.profile_photo ?? "",
        })),
        additional_tasks: mappedTasks,
        total_tasks_count: mappedTasks.length,
        total_photos_count: mappedTasks.reduce((sum, task) => sum + (task.total_photos_required ?? 0), 0),
        date: dayOf(plan.date_time),
        duration_minutes: plan.max_estimated_duration ?? 0,
        status: plan.status ?? (plan.is_active === false ? "inactive" : "active"),
        is_active: plan.is_active ?? plan.status !== "inactive",
        created_at: plan.created_at ?? plan.createdAt ?? "",
        updated_at: plan.updated_at ?? plan.updatedAt ?? "",
        // Not represented in the new payload.
        start_time: "",
        end_time: "",
        repeat_shift: "",
        repeat_until: dayOf(plan.end_date),
        working_days: [],
        shift_notes: plan.note ?? plan.description ?? "",
    };
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
    return authenticated<any>(
        `/manager/cleaning-plans/${encodeURIComponent(planId)}/workers-dropdown?${query}`,
        { method: "GET" },
    ).then((res) => {
        if (res.success && res.data?.workers) {
            res.data.workers = res.data.workers.map((w: any) => {
                if (w.worker) {
                    return {
                        ...w.worker,
                        ...w, // In case stats are at the root
                        worker_id: w.worker._id || w.worker.worker_id,
                        is_available: !w.is_conflict,
                        unavailable_reason: w.conflict_reason,
                    };
                }
                return w;
            });
        }
        return res;
    });
}
export async function assignPlanWorkers(
    planId: string,
    workers: WorkerAssignment[],
    action: "append" | "replace" = "append",
    force = false,
) {
    const assigned_workers = workers.map(w => ({
        worker: w.worker_id,
        role: w.position === "teamleader" ? "Team leader" : w.position === "co_leader" ? "Co-leader" : "Standard worker"
    }));
    return authenticated<PlanDetails>(
        `/cleaning-plan/${encodeURIComponent(planId)}/assign-workers`,
        { method: "PATCH", ...json({ assigned_workers, force }) },
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

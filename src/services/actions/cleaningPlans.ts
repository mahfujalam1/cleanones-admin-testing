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
    photo: Array<{ id?: string; name: string; description?: string }>;
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
    createdAt: string;
    updatedAt: string;
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
        required_photos?: Array<{ id: string; name: string; description?: string }>;
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


export async function getCleaningPlan(planId: string) {
    const res = await authenticated<SingleCleaningPlan | { data: SingleCleaningPlan }>(
        `/cleaning-plan/single-cleaning-plan/${encodeURIComponent(planId)}`,
        { method: "GET" },
    );
    if (!res.success) return res;
    
    
    const payload = ((res.data as { data?: SingleCleaningPlan })?.data ??
        res.data) as SingleCleaningPlan;
    return { ...res, data: toPlanDetails(payload) };
}


type PlanRef<T> = string | T;
export type SingleCleaningPlan = {
    _id: string;
    title?: string;
    description?: string;
    note?: string;
    client?: PlanRef<{
        _id: string;
        name?: string;
        company_name?: string;
        email?: string;
        phone?: string;
        licence_expiration_date?: string;
        contract_status?: string;
    }>;
    location?: PlanRef<{ _id: string; name?: string }>;
    rooms?: Array<PlanRef<{
        _id: string;
        name?: string;
        room_type?: string;
        cleaning_type?: string;
        floor?: number;
        tasks?: Array<{
            _id: string;
            name?: string;
            frequency_type?: string;
            is_photo_required?: boolean;
            photo_requirements?: Array<{ title: string; description?: string }>;
            required_photo_count?: number;
            duration_minutes?: number;
        }>;
        total_task?: number;
        total_duration?: number;
    }>>;
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
        photo_requirements?: Array<{ title: string; description?: string }>;
        date_time?: string;
        status?: string;
        reject_reason?: string | null;
    }>>;
    date_time?: string;
    end_date?: string;
    max_estimated_duration?: number;
    total_rooms?: number;
    total_tasks?: number;
    total_duration?: number;
    status?: string;
    is_active?: boolean;
    manager?: PlanRef<{ _id: string; name?: string; email?: string; phone?: string; profile_image?: string | null }>;
    createdAt?: string;
    updatedAt?: string;
};


const populated = <T extends object>(ref: PlanRef<T> | undefined | null): T | null =>
    ref && typeof ref === "object" ? ref : null;
const idOf = (ref: PlanRef<{ _id: string }> | undefined | null): string =>
    typeof ref === "string" ? ref : ref?._id ?? "";
const dayOf = (value?: string) => (value ? value.slice(0, 10) : "");

export function toPlanDetails(plan: SingleCleaningPlan): PlanDetails {
    const client = populated(plan.client);
    const location = populated(plan.location);
    const manager = populated(plan.manager);
    type RoomDoc = NonNullable<ReturnType<typeof populated<{
        _id: string;
        name?: string;
        room_type?: string;
        cleaning_type?: string;
        floor?: number;
        tasks?: Array<{
            _id: string;
            name?: string;
            frequency_type?: string;
            is_photo_required?: boolean;
            photo_requirements?: Array<{ title: string; description?: string }>;
            required_photo_count?: number;
            duration_minutes?: number;
        }>;
        total_task?: number;
        total_duration?: number;
    }>>>;
    const rooms = (plan.rooms ?? []).map(populated).filter(Boolean) as RoomDoc[];
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
        photo_requirements?: Array<{ title: string; description?: string }>;
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
        photo: (task.photo_requirements ?? []).map((photo) => ({
            name: photo.title,
            description: photo.description,
        })),
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
            ? [{
                client_id: client._id,
                company_name: clientName,
                primary_contact_name: client.name,
                email: client.email,
                phone: client.phone,
            }]
            : [],
        location_name: location?.name,
        location_names: location?.name ? [location.name] : [],
        locations: location ? [{ location_id: location._id, location_name: location.name, name: location.name }] : [],
        rooms_count: plan.rooms?.length ?? 0,
        room_names: rooms.map((room) => room.name ?? ""),
        room_ids: (plan.rooms ?? []).map(idOf),
        rooms: rooms.map((room) => {
            const roomTasks = room.tasks ?? [];
            return {
                room_id: room._id,
                room_name: room.name ?? "",
                room_type: room.room_type ?? "",
                clean_type: room.cleaning_type ?? "",
                floor: room.floor ?? 0,
                duration:
                    room.total_duration ??
                    roomTasks.reduce((sum, task) => sum + (task.duration_minutes ?? 0), 0),
                task_number: room.total_task ?? roomTasks.length,
                total_photos_required: roomTasks.reduce(
                    (sum, task) => sum + (task.photo_requirements?.length ?? 0),
                    0,
                ),
                tasks: roomTasks.map((task) => ({
                    id: task._id,
                    name: task.name ?? "",
                    frequency_type: task.frequency_type ?? "",
                    duration_minutes: task.duration_minutes,
                    is_photo_req: Boolean(task.is_photo_required),
                    photo: (task.photo_requirements ?? []).map((photo) => ({
                        name: photo.title,
                        description: photo.description,
                    })),
                    total_photos_required: task.photo_requirements?.length ?? 0,
                })),
                required_photos: roomTasks.flatMap((task) =>
                    (task.photo_requirements ?? []).map((photo, index) => ({
                        id: `${task._id}-${index}`,
                        name: photo.title,
                        description: photo.description,
                    })),
                ),
            };
        }),
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
        total_tasks_count:
            (plan.total_tasks ?? rooms.reduce((sum, room) => sum + (room.tasks?.length ?? 0), 0)) +
            mappedTasks.length,
        total_photos_count:
            rooms.reduce(
                (sum, room) =>
                    sum +
                    (room.tasks ?? []).reduce(
                        (roomSum, task) => roomSum + (task.photo_requirements?.length ?? 0),
                        0,
                    ),
                0,
            ) + mappedTasks.reduce((sum, task) => sum + (task.total_photos_required ?? 0), 0),
        date: dayOf(plan.date_time),
        
        duration_minutes:
            plan.total_duration ||
            plan.max_estimated_duration ||
            rooms.reduce((sum, room) => sum + (room.total_duration ?? 0), 0),
        status: plan.status ?? (plan.is_active === false ? "inactive" : "active"),
        is_active: plan.is_active ?? plan.status !== "inactive",
        createdAt: plan.createdAt ?? "",
        updatedAt: plan.updatedAt ?? "",
        
        start_time: "",
        end_time: "",
        repeat_shift: "",
        repeat_until: dayOf(plan.end_date),
        working_days: [],
        shift_notes: plan.note ?? plan.description ?? "",
        manager: manager
            ? {
                manager_id: manager._id,
                name: manager.name ?? "",
                email: manager.email,
                phone: manager.phone,
                profile_photo: manager.profile_image ?? null,
            }
            : undefined,
    };
}

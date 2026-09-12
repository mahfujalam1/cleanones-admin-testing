import { authenticated, type ActionResult } from "./auth";
export type WorkerApi = { worker_id: string; full_name: string; name?: string; email?: string; phone?: string; profile_photo?: string; worker_type: string; position: string; location?: string; base_location?: string; hourly_rate?: number; languages: string[]; hours_worked: string; hours_worked_numeric: number; status: string; account_status: string; approval_status: string; is_active: boolean; national_id?: string; certificates?: string[]; national_id_front?: string; national_id_back?: string; employee_contract_pdf?: string; weekly_availability?: WorkerAvailabilitySlot[]; preferred_hours_per_week?: number };
export type WorkerAvailabilitySlot = { day: string; start_time: string; end_time: string; is_available: boolean };
export type WorkerInput = { full_name: string; name?: string; email: string; phone: string; worker_type: string; position: string; base_location: string; hourly_rate?: number; languages: string[]; status: string; national_id?: string; certificates?: string[]; national_id_front?: string; national_id_back?: string; employee_contract_pdf?: string; weekly_availability?: WorkerAvailabilitySlot[]; preferred_hours_per_week?: number };
export type UpdateWorkerInput = Partial<{ full_name: string; name: string; email: string; phone: string; phone_number: string; worker_type: string; position: string; base_location: string; hourly_rate: number; languages: string[]; status: string; national_id: string; certificates: string[]; national_id_front: string; national_id_back: string; employee_contract_pdf: string; weekly_availability: WorkerAvailabilitySlot[]; preferred_hours_per_week: number }>;

const json = (value: unknown) => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
const params = (page: number, limit: number, search?: string, workerType?: string, status?: string) => { const q = new URLSearchParams({ page: String(page), limit: String(limit) }); if (search) q.set("search", search); if (workerType) q.set("worker_type", workerType); if (status) q.set("status_filter", status); return q; };
export async function getWorkers(input: { page?: number; limit?: number; search?: string; workerType?: string; status?: string } = {}) { return authenticated<{ total_workers: number; employees_count: number; freelancers_count: number; page: number; limit: number; has_more: boolean; workers: WorkerApi[] }>(`/manager/workers?${params(input.page ?? 1, input.limit ?? 100, input.search, input.workerType, input.status)}`, { method: "GET" }); }
export type WorkerDetailsApi = {
    id?: string;
    worker_id: string;
    full_name: string;
    email?: string;
    phone?: string | null;
    worker_type?: string;
    position?: string;
    base_location?: string;
    profile_photo?: string | null;
    id_card_front?: string | null;
    id_card_back?: string | null;
    certificates?: string[];
    documents?: WorkerDocumentFile[];
    shifts_summary?: { completed?: number; in_progress?: number; upcoming?: number };
    shifts?: Array<{ shift_id: string; date: string; location: string; hours: string; hours_numeric?: number; status: string }>;
    attendance_summary?: { this_month_hours?: string; this_month_hours_numeric?: number; late_days?: number; absent_days?: number };
    attendance?: Array<{ shift_id: string; date: string; check_in: string; check_out: string; hours: string; hours_numeric?: number; status: string }>;
    dob?: string | null;
    nationality?: string | null;
    languages?: string[];
    status?: string;
    account_status?: string;
    is_approved?: boolean;
    approval_status?: string;
    is_profile_completed?: boolean;
    temp_password_changed?: boolean;
    is_signup?: boolean;
    last_login_at?: string | null;
    total_shifts_count?: number;
    completed_shifts_count?: number;
    rating?: number;
    hourly_rate?: number;
    hours_worked?: string;
    weekly_availability?: WorkerAvailabilitySlot[];
    preferred_hours_per_week?: number;
    availability?: {
        worker_id?: string;
        weekly_availability?: WorkerAvailabilitySlot[];
        preferred_hours_per_week?: number;
        leave_requests?: Array<{
            id?: string;
            start_date?: string;
            end_date?: string;
            reason?: string;
            status?: string;
        }>;
    };
    created_at?: string;
    updated_at?: string;
};
export type WorkerDocumentType = "id_card_front" | "id_card_back" | "employee_contract_pdf" | "certificate";
export type WorkerDocumentFile = { name: string; type: string; url: string };
/** POST /manager/workers and PATCH only accept pre-existing URL strings, so real files
 *  have to go through this endpoint. "certificate" appends; the others replace.
 *  Verified against the API schema: multipart fields are document_type and file. */
export async function uploadWorkerDocument(workerId: string, documentType: WorkerDocumentType, file: File) {
    const data = new FormData();
    data.append("document_type", documentType);
    data.append("file", file);
    return authenticated<{ document: WorkerDocumentFile; documents: WorkerDocumentFile[] }>(`/manager/workers/${encodeURIComponent(workerId)}/documents`, { method: "POST", body: data });
}
/** Uploads each provided file in turn and returns the first failure, if any. */
export async function uploadWorkerDocuments(workerId: string, files: ReadonlyArray<readonly [WorkerDocumentType, File | undefined | null]>) {
    for (const [documentType, file] of files) {
        if (!file) continue;
        const result = await uploadWorkerDocument(workerId, documentType, file);
        // A 404 here means the API build in use predates this endpoint, not a bad worker id.
        if (!result.success) return `${documentType.replaceAll("_", " ")}: ${result.status === 404 ? "the API does not expose the document upload endpoint" : result.error}`;
    }
    return "";
}
export async function getWorker(workerId: string) { return authenticated<WorkerDetailsApi>(`/manager/workers/${encodeURIComponent(workerId)}`, { method: "GET" }); }
export async function createWorker(input: WorkerInput) { return authenticated<WorkerApi>("/manager/workers", { method: "POST", ...json(input) }); }
export async function updateWorkerDetails(workerId: string, input: UpdateWorkerInput) { return authenticated<WorkerApi>(`/manager/workers/${encodeURIComponent(workerId)}`, { method: "PATCH", ...json(input) }); }
export async function updateWorkerStatus(workerId: string, status: string, reason: string) { return authenticated<string>(`/manager/workers/${encodeURIComponent(workerId)}/status`, { method: "PATCH", ...json({ status, reason }) }); }
export async function deleteWorker(workerId: string) { return authenticated<string>(`/manager/workers/${encodeURIComponent(workerId)}`, { method: "DELETE" }); }
export async function getDeletedWorkers(page = 1, limit = 10, search?: string) { return authenticated<{ total_workers: number; employees_count: number; freelancers_count: number; workers: WorkerApi[] }>(`/manager/workers/deleted-list?${params(page, limit, search)}`, { method: "GET" }); }
export async function restoreWorker(workerId: string) { return authenticated<string>(`/manager/workers/${encodeURIComponent(workerId)}/restore`, { method: "POST" }); }
export async function getWorkerImportTemplate() { return authenticated<string>("/manager/workers/bulk-import/template", { method: "GET" }); }
export async function importWorkers(file: File) { const data = new FormData(); data.append("file", file); return authenticated<{ total_rows: number; imported_count: number; failed_count: number; errors: string[] }>("/manager/workers/bulk-import", { method: "POST", body: data }); }
export async function exportWorkers(workerType?: string) { return authenticated<string>(`/manager/workers/export${workerType ? `?worker_type=${encodeURIComponent(workerType)}` : ""}`, { method: "GET" }); }
export type PendingApprovalApi = { id: string; full_name: string; email: string; phone: string | null; worker_type: string; approval_status: string; is_approved: boolean; hourly_rate: number; rejection_reason: string | null; id_card_front: string | null; id_card_back: string | null; profile_photo: string | null; certificates: string[]; dob: string | null; nationality: string | null; created_at: string; updated_at: string };
export type GetWorkerApprovalsResponse = { total_count: number; page: number; limit: number; has_more: boolean; pending_approvals: PendingApprovalApi[] };
export type ApproveWorkerInput = { worker_type?: string; position?: string; base_location?: string; hourly_rate?: number };

export async function getWorkerApprovals(page = 1, limit = 10, status = "pending", search?: string) { const q = new URLSearchParams({ page: String(page), limit: String(limit), status_filter: status }); if (search) q.set("search", search); return authenticated<GetWorkerApprovalsResponse>(`/manager/manager/worker-approvals?${q}`, { method: "GET" }); }
export async function approveWorker(workerId: string, input?: ApproveWorkerInput) { return authenticated<unknown>(`/manager/manager/workers/${encodeURIComponent(workerId)}/approve`, { method: "POST", ...json(input ?? {}) }); }
export async function rejectWorker(workerId: string, reason: string) { return authenticated<string>(`/manager/manager/workers/${encodeURIComponent(workerId)}/reject`, { method: "POST", ...json({ reject_reason: reason }) }); }
export async function getAvailableWorkers(page = 1, limit = 100, search?: string) { const q = new URLSearchParams({ page: String(page), limit: String(limit) }); if (search) q.set("search", search); return authenticated<{ total_count: number; workers: unknown[] }>(`/manager/workers-list?${q}`, { method: "GET" }); }



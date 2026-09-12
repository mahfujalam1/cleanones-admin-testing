import { authenticated } from "./auth";

const json = (value: unknown) => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });

export type InvoiceShift = {
    shift_id: string;
    title?: string;
    location_name?: string;
    date?: string;
    start_time?: string;
    end_time?: string;
    raw_hours_worked?: number;
    rounded_hours_worked?: number;
    regular_hours?: number;
    overtime_hours?: number;
    hourly_rate?: number;
    earnings?: number;
    status?: string;
};

export type WorkerInvoice = {
    id: string;
    invoice_id: string;
    invoice_number: string;
    worker_id: string;
    worker_name?: string;
    worker_email?: string;
    worker_type?: string;
    period_month?: number;
    period_year?: number;
    period_label?: string;
    hours_worked?: number;
    regular_hours?: number;
    overtime_hours?: number;
    hourly_rate?: number;
    gross_amount?: number;
    amount_paid?: number;
    balance_due?: number;
    currency?: string;
    payment_status?: string;
    payment_method?: string;
    payment_reference?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    shifts_included?: InvoiceShift[];
};

/**
 * The invoices embedded in the earnings response use a different shape from the ones
 * returned by /manager/worker-invoices: the amount is net_payout (not amount_paid) and
 * the state is status (not payment_status).
 */
export type EarningsInvoice = {
    invoice_id: string;
    invoice_number: string;
    period_start?: string;
    period_end?: string;
    hours_worked?: number;
    hourly_rate?: number;
    gross_amount?: number;
    bonus_amount?: number;
    deductions?: number;
    net_payout?: number;
    currency?: string;
    status?: string;
    payment_method?: string | null;
    paid_at?: string | null;
    download_url?: string | null;
};

/** Monthly earnings for one worker: gross is the worker's rate times the hours they
 *  actually worked, and balance_due is what is left after the payouts recorded so far. */
export type WorkerEarnings = {
    worker_id: string;
    worker_name: string;
    worker_type?: string;
    position?: string;
    hourly_rate?: number;
    currency?: string;
    month?: number;
    year?: number;
    month_name?: string;
    total_shifts_worked?: number;
    total_hours_worked?: number;
    regular_hours?: number;
    overtime_hours?: number;
    gross_earnings?: number;
    total_paid?: number;
    balance_due?: number;
    payment_status?: string;
    shifts?: InvoiceShift[];
    invoices?: EarningsInvoice[];
};

export type CreateInvoiceInput = {
    worker_id: string;
    amount_paid: number;
    period_month?: number;
    period_year?: number;
    payment_method?: string;
    payment_status?: "paid" | "partial" | "pending";
    payment_reference?: string;
    notes?: string;
    due_date?: string;
};

export async function getWorkerEarnings(workerId: string, month?: number, year?: number) {
    const query = new URLSearchParams();
    if (month) query.set("month", String(month));
    if (year) query.set("year", String(year));
    const suffix = query.size ? `?${query}` : "";
    return authenticated<WorkerEarnings>(`/manager/workers/${encodeURIComponent(workerId)}/earnings${suffix}`, { method: "GET" });
}

export async function getWorkerInvoices(
    input: { workerId?: string; month?: number; year?: number; paymentStatus?: string; page?: number; limit?: number } = {},
) {
    const query = new URLSearchParams({ page: String(input.page ?? 1), limit: String(input.limit ?? 10) });
    if (input.workerId) query.set("worker_id", input.workerId);
    if (input.month) query.set("month", String(input.month));
    if (input.year) query.set("year", String(input.year));
    if (input.paymentStatus) query.set("payment_status", input.paymentStatus);
    return authenticated<{
        total_count: number;
        page: number;
        limit: number;
        has_more: boolean;
        total_invoiced_amount: number;
        total_paid_amount: number;
        invoices: WorkerInvoice[];
    }>(`/manager/worker-invoices?${query}`, { method: "GET" });
}

export async function createWorkerInvoice(input: CreateInvoiceInput) {
    return authenticated<WorkerInvoice>("/manager/worker-invoices", { method: "POST", ...json(input) });
}

export async function getWorkerInvoice(invoiceId: string) {
    return authenticated<WorkerInvoice>(`/manager/worker-invoices/${encodeURIComponent(invoiceId)}`, { method: "GET" });
}

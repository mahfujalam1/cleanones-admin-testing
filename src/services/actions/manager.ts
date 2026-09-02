import { authenticated, type ActionResult } from "./auth";

export type ManagerProfile = { id: string; full_name: string; email: string; phone: string; role: string; is_active: boolean; is_verified: boolean; created_at: string; updated_at: string; profile_photo: string; push_notifications_enabled: boolean; address: string; website: string };
export type CompanyProfile = { company_name: string; email: string; phone: string; address: string; website: string; updated_at: string };
export type LegalDocument = { type: string; title: string; content: string; updated_at: string };
export type SupportMessage = { _id: string; worker_id: string; worker_name: string; worker_email: string; subject: string; description: string; admin_reply: string; status: string; is_resolved: boolean; is_read_by_admin: boolean; is_read_by_worker: boolean; created_at: string; updated_at: string; replied_at: string };
export type Faq = { _id: string; serial_no: number; question: string; answer: string; created_at: string; updated_at: string };

const json = (body: unknown): RequestInit => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
export async function getManagerProfile() { return authenticated<ManagerProfile>("/manager/me", { method: "GET" }); }
export async function updateManagerProfile(input: Pick<ManagerProfile, "full_name" | "phone" | "address" | "website" | "is_active">) { return authenticated<ManagerProfile>("/manager/me", { method: "PATCH", ...json(input) }); }
export async function getCompanyProfile() { return authenticated<CompanyProfile>("/manager/company-profile", { method: "GET" }); }
export async function updateCompanyProfile(input: Omit<CompanyProfile, "updated_at">) { return authenticated<CompanyProfile>("/manager/company-profile", { method: "PATCH", ...json(input) }); }
export async function getLegalDocument(type: string) { return authenticated<LegalDocument>(`/manager/legal-documents/${encodeURIComponent(type)}`, { method: "GET" }); }
export async function updateLegalDocument(type: string, input: { title: string; content: string }) { return authenticated<LegalDocument>(`/manager/legal-documents/${encodeURIComponent(type)}`, { method: "PATCH", ...json(input) }); }
export async function getSupportMessages(page = 1, limit = 10, statusFilter?: string): Promise<ActionResult<{ total_count: number; unread_count: number; messages: SupportMessage[] }>> { const query = new URLSearchParams({ page: String(page), limit: String(limit) }); if (statusFilter) query.set("status_filter", statusFilter); return authenticated(`/manager/support-messages?${query}`, { method: "GET" }); }
export async function replySupportMessage(messageId: string, input: { admin_reply: string; status: string; is_resolved: boolean }) { return authenticated<SupportMessage>(`/manager/support-messages/${encodeURIComponent(messageId)}/reply`, { method: "POST", ...json(input) }); }
export async function getFaqs() { return authenticated<Faq[]>("/manager/faqs", { method: "GET" }); }
export async function createFaq(input: { question: string; answer: string; serial_no: number }) { return authenticated<Faq>("/manager/faqs", { method: "POST", ...json(input) }); }
export async function updateFaq(faqId: string, input: { question: string; answer: string; serial_no: number }) { return authenticated<Faq>(`/manager/faqs/${encodeURIComponent(faqId)}`, { method: "PATCH", ...json(input) }); }
export async function deleteFaq(faqId: string) { return authenticated<string>(`/manager/faqs/${encodeURIComponent(faqId)}`, { method: "DELETE" }); }

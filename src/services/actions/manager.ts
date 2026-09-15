import { authenticated, type ActionResult } from "./auth";

export type ManagerProfile = { id: string; full_name: string; name?: string; email: string; phone: string; role: string; is_active: boolean; is_verified: boolean; createdAt: string; updatedAt: string; profile_photo: string; push_notifications_enabled: boolean; temporary_password?: string; address: string; website: string };
export type CompanyProfile = { company_name: string; email: string; phone: string; address: string; website: string; updatedAt: string };
export type SupportMessage = { _id: string; worker_id: string; worker_name: string; worker_email: string; subject: string; description: string; admin_reply: string; status: string; is_resolved: boolean; is_read_by_admin: boolean; is_read_by_worker: boolean; createdAt: string; updatedAt: string; replied_at: string };
export type Faq = { _id: string; serial_no: number; question: string; answer: string; createdAt: string; updatedAt: string };

const json = (body: unknown): RequestInit => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
export async function getFaqs() { return authenticated<Faq[]>("/manager/faqs", { method: "GET" }); }
export async function deleteFaq(faqId: string) { return authenticated<string>(`/manager/faqs/${encodeURIComponent(faqId)}`, { method: "DELETE" }); }

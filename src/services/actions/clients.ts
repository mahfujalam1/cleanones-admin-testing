import { authenticated, type ActionResult } from "./auth";
import { imgUrl } from "@/utils/baseUrl";

export type ClientSummary = {
  id: string;
  company_name: string;
  industry: string;
  status: string;
  primary_contact_name: string;
  email: string;
  phone: string;
  is_signup: boolean;
  locations_count: number;
  contract_status: string;
  createdAt: string;
  updatedAt: string;
};
export type ClientInput = {
  company_name: string;
  email: string;
  industry: string;
  license_expiration_date: string;
  phone: string;
  primary_contact_name: string;
};
export type ClientContact = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
};
export type ClientDetails = ClientSummary & {
  admin: { id: string; name: string; profile_picture: string | null };
  license_expiration_date: string;
  locations: Array<{
    id: string;
    name: string;
    address: string;
    rooms_count: number;
  }>;
  contacts: ClientContact[];
  contracts: unknown[];
  cleaning_plans: unknown[];
  reports: unknown[];
};
const json = (value: unknown) => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(value),
});
const apiUrl = (value: string) => imgUrl(value);
function query(
  page: number,
  limit: number,
  search?: string,
  isSignup?: boolean,
) {
  const value = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) value.set("search", search);
  if (isSignup !== undefined) value.set("is_signup", String(isSignup));
  return value;
}
export async function createClient(input: ClientInput) {
  return authenticated<ClientDetails>("/manager/clients", {
    method: "POST",
    ...json(input),
  });
}
export async function getClients(
  page = 1,
  limit = 100,
  search?: string,
  isSignup?: boolean,
) {
  return authenticated<{
    total_count: number;
    page: number;
    limit: number;
    has_more: boolean;
    clients: ClientSummary[];
  }>(`/manager/clients?${query(page, limit, search, isSignup)}`, {
    method: "GET",
  });
}
export async function updateClient(
  clientId: string,
  input: Omit<
    ClientSummary,
    "id" | "locations_count" | "contract_status" | "createdAt" | "updatedAt"
  >,
) {
  return authenticated<ClientDetails>(
    `/manager/clients/${encodeURIComponent(clientId)}`,
    { method: "PATCH", ...json(input) },
  );
}
export async function deleteClient(clientId: string) {
  return authenticated<string>(
    `/manager/clients/${encodeURIComponent(clientId)}`,
    { method: "DELETE" },
  );
}
export async function getClientContacts(
  clientId: string,
  page = 1,
  limit = 100,
) {
  return authenticated<{
    total_count: number;
    page: number;
    limit: number;
    has_more: boolean;
    contacts: ClientContact[];
  }>(
    `/manager/clients/${encodeURIComponent(clientId)}/contacts?page=${page}&limit=${limit}`,
    { method: "GET" },
  );
}
export type Contract = {
  client_id: string;
  company_name: string;
  status: string;
  expiry_date: string;
  expiry_date_formatted: string;
  pdf_url: string;
};
export type ClientReport = {
  id: string;
  title: string;
  date_formatted: string;
  date_iso: string;
  status: string;
  download_url: string;
};

import { authenticated, type ActionResult } from "./auth";
import type { LegalSlug } from "@/lib/legal-content";

/**
 * `/manage/*` keeps exactly one document per kind and addresses it by kind, not by id —
 * `add` creates it the first time and updates it afterwards, `edit` needs the id.
 */
const RESOURCE: Record<LegalSlug, string> = {
  "privacy-policy": "privacy-policy",
  "terms-and-conditions": "terms-conditions",
  "about-us": "about-us",
};

export type LegalDocument = {
  id: string;
  /** The API calls the body `description`; there is no title field. */
  content: string;
  createdAt: string;
  updatedAt: string;
};

type LegalPayload = {
  _id?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
} | null;

/** `authenticated` returns the whole `{ success, message, data }` body, so `data` is read here. */
const unwrap = (body: unknown): LegalPayload =>
  ((body as { data?: LegalPayload })?.data ?? body) as LegalPayload;

const toDocument = (payload: LegalPayload): LegalDocument => ({
  id: payload?._id ?? "",
  content: payload?.description ?? "",
  createdAt: payload?.createdAt ?? "",
  updatedAt: payload?.updatedAt ?? "",
});

/**
 * GET /manage/get-privacy-policy | /manage/get-terms-conditions
 * Public content. `data` is null when nothing has been written yet, which is not an error —
 * it comes back as an empty document so the editor can create the first one.
 */
export async function getLegalDocument(slug: LegalSlug): Promise<ActionResult<LegalDocument>> {
  const result = await authenticated<unknown>(`/manage/get-${RESOURCE[slug]}`, { method: "GET" });
  if (!result.success) return result;
  return { success: true, data: toDocument(unwrap(result.data)) };
}

/**
 * PATCH /manage/edit-… when the document already exists, POST /manage/add-… when it does not.
 * The add route's update branch answers without `data`, so the saved text is echoed back
 * rather than read from the response.
 */
export async function saveLegalDocument(
  slug: LegalSlug,
  input: { id?: string; content: string },
): Promise<ActionResult<LegalDocument>> {
  const body = JSON.stringify({ description: input.content });
  const headers = { "Content-Type": "application/json" };

  const result = input.id
    ? await authenticated<unknown>(`/manage/edit-${RESOURCE[slug]}/${encodeURIComponent(input.id)}`, {
        method: "PATCH",
        headers,
        body,
      })
    : await authenticated<unknown>(`/manage/add-${RESOURCE[slug]}`, { method: "POST", headers, body });

  if (!result.success) return result;

  const saved = toDocument(unwrap(result.data));
  return {
    success: true,
    data: {
      ...saved,
      id: saved.id || input.id || "",
      content: saved.content || input.content,
    },
  };
}

/** DELETE /manage/delete-… — permanently removes the document and returns it. */
export async function deleteLegalDocument(
  slug: LegalSlug,
  id: string,
): Promise<ActionResult<LegalDocument>> {
  const result = await authenticated<unknown>(
    `/manage/delete-${RESOURCE[slug]}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  if (!result.success) return result;
  return { success: true, data: toDocument(unwrap(result.data)) };
}

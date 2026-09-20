/**
 * Turns an RTK Query error into a sentence worth showing. The API reports failures as
 * `{ success: false, message }`, so that message wins; the other shapes are fallbacks for
 * network errors and non-JSON responses.
 */
export function apiError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!error || typeof error !== "object") return fallback;

  const { status, data, error: fetchError } = error as {
    status?: number | string;
    data?: unknown;
    error?: string;
  };

  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (status === "FETCH_ERROR") return "Unable to reach the server. Check your connection.";

  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    const { message, errorSources } = data as {
      message?: string;
      errorSources?: Array<{ message?: string }>;
    };
    const sourced = errorSources?.map((source) => source.message).filter(Boolean).join(", ");
    if (sourced) return sourced;
    if (message?.trim()) return message;
  }

  return fetchError?.trim() || fallback;
}

/**
 * Reads the HTTP status off an RTK Query error. Returns undefined for the shapes that carry no
 * status — a network failure, a serialised throw — so callers can tell "no response" from a 404.
 */
export function apiStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const { status } = error as { status?: number | string };
  return typeof status === "number" ? status : undefined;
}

/** True when the request came back empty rather than broken, which most lists render as "none yet". */
export function isNotFound(error: unknown): boolean {
  if (apiStatus(error) === 404) return true;
  const message = apiError(error, "").toLowerCase();
  return message.includes("not found") || message.includes("no data");
}

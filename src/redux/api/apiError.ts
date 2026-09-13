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

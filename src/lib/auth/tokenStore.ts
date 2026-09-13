import { expiresAt } from "./jwt";

/**
 * The access token lives in memory only — never in localStorage or a readable cookie, so an
 * injected script has nothing to steal and no token survives a tab close. It is re-minted from
 * the HttpOnly refresh cookie on boot (see `baseApi`), which costs exactly one request.
 */

let token: string | null = null;
let expiryMs = 0;

/** Refresh this far ahead of expiry so a request never races the clock. */
const REFRESH_SKEW_MS = 30_000;

export const tokenStore = {
  get: () => token,

  set(next: string) {
    token = next;
    // Tokens without an `exp` claim are treated as short-lived rather than eternal.
    expiryMs = expiresAt(next) ?? Date.now() + 5 * 60_000;
  },

  clear() {
    token = null;
    expiryMs = 0;
  },

  /** True when there is no token, or the one held is about to expire. */
  needsRefresh: () => !token || Date.now() >= expiryMs - REFRESH_SKEW_MS,
};

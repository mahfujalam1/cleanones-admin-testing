import { expiresAt } from "./jwt";

let token: string | null = null;
let expiryMs = 0;

const REFRESH_SKEW_MS = 30_000;

export const tokenStore = {
  get: () => token,

  set(next: string) {
    token = next;

    expiryMs = expiresAt(next) ?? Date.now() + 5 * 60_000;
  },

  clear() {
    token = null;
    expiryMs = 0;
  },

  needsRefresh: () => !token || Date.now() >= expiryMs - REFRESH_SKEW_MS,
};

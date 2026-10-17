import { tokenStore } from "./tokenStore";
import { decodeJwt } from "./jwt";
import { readCookie, SESSION_COOKIE } from "./session";

export function isCurrentCompanyAdmin(override?: boolean): boolean {
  if (typeof override === "boolean") return override;

  try {
    const token = tokenStore.get();
    if (token) {
      const claims = decodeJwt(token);
      const role = claims?.role?.toLowerCase();
      if (role === "company" || role === "company_admin") return true;
    }
  } catch {}

  try {
    const cookie = readCookie(SESSION_COOKIE);
    if (
      cookie === "COMPANY_ADMIN" ||
      cookie?.toLowerCase() === "company" ||
      cookie?.toLowerCase() === "company_admin"
    ) {
      return true;
    }
  } catch {}

  try {
    if (typeof window !== "undefined") {
      const storeState = (
        window as unknown as {
          __CLEANONES_STORE__?: {
            getState?: () => { auth?: { user?: { role?: string } } };
          };
        }
      ).__CLEANONES_STORE__?.getState?.();
      const role = storeState?.auth?.user?.role?.toLowerCase();
      if (role === "company_admin" || role === "company") return true;
    }
  } catch {}

  return false;
}

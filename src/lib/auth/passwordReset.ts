/**
 * Carries the password-reset flow across its three pages.
 *
 * The reset endpoint no longer takes the code — `/auth/verify-reset-otp` proves it server-side
 * first — so only the address travels, plus a flag marking that the code was accepted. Session
 * storage keeps it to the tab and clears itself when the tab closes.
 */

const EMAIL_KEY = "cleanones-reset-email";
const VERIFIED_KEY = "cleanones-reset-verified";

const read = (key: string) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Private-mode storage denial: the user simply restarts the flow.
  }
};

export const passwordReset = {
  start(email: string) {
    write(EMAIL_KEY, email);
    try {
      sessionStorage.removeItem(VERIFIED_KEY);
    } catch {}
  },
  email: () => read(EMAIL_KEY),
  markVerified: () => write(VERIFIED_KEY, "1"),
  isVerified: () => read(VERIFIED_KEY) === "1",
  clear() {
    try {
      sessionStorage.removeItem(EMAIL_KEY);
      sessionStorage.removeItem(VERIFIED_KEY);
    } catch {}
  },
};

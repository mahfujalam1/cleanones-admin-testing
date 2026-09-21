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

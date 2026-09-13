/** Minimal JWT payload reader. Claims are read for UI hints only — the API is the authority. */

export type JwtClaims = {
  exp?: number;
  iat?: number;
  id?: string;
  _id?: string;
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
};

export function decodeJwt(token: string): JwtClaims | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    // atob yields Latin-1; round-trip through UTF-8 so non-ASCII names survive.
    return JSON.parse(decodeURIComponent(escape(json))) as JwtClaims;
  } catch {
    return null;
  }
}

/** Absolute expiry in epoch milliseconds, or null when the token carries no `exp`. */
export function expiresAt(token: string): number | null {
  const exp = decodeJwt(token)?.exp;
  return typeof exp === "number" ? exp * 1000 : null;
}

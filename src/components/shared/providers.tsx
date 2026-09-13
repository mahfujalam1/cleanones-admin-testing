"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { initializeAuth } from "@/redux/slices/auth.slice";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { tokenStore } from "@/lib/auth/tokenStore";
import { clearSessionMarker, hasSessionMarker, userFromAccessToken } from "@/lib/auth/session";

/**
 * Restores the session on boot.
 *
 * The access token is deliberately memory-only, so a reload starts with none. The HttpOnly
 * refresh cookie is the only thing that survives, and exchanging it costs exactly one request —
 * guarded by the session marker so signed-out visitors never spend the auth rate limit.
 */
async function restoreSession() {
  if (!hasSessionMarker()) return null;

  // Any failure here — rejected, rate limited or offline — drops the marker. Keeping it would
  // leave the route guard letting an unrestorable session through and bouncing off the login page.
  if ((await refreshAccessToken()) !== "refreshed") {
    clearSessionMarker();
    return null;
  }

  const token = tokenStore.get();
  const user = token ? userFromAccessToken(token) : null;
  if (!user) clearSessionMarker();
  return user;
}

function SessionLoader({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let active = true;
    void restoreSession().then((user) => {
      if (active) store.dispatch(initializeAuth(user));
    });
    return () => {
      active = false;
    };
  }, []);

  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionLoader>{children}</SessionLoader>
    </Provider>
  );
}

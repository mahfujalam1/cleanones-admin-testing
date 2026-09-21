"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { initializeAuth } from "@/redux/slices/auth.slice";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { tokenStore } from "@/lib/auth/tokenStore";
import { clearSessionMarker, hasSessionMarker, userFromAccessToken } from "@/lib/auth/session";



async function restoreSession() {
  if (!hasSessionMarker()) return null;

  
  
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

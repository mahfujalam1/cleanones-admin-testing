"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { initializeAuth } from "@/store/slices/auth.slice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedUser = localStorage.getItem("cleanones-dashboard-user");
    const token = typeof document !== "undefined"
      ? document.cookie.match(/(?:^|; )cleanones_manager_access_token=([^;]*)/)?.[1]
      : null;

    if (savedUser) {
      try {
        store.dispatch(initializeAuth(JSON.parse(savedUser)));
        return;
      } catch {
        localStorage.removeItem("cleanones-dashboard-user");
      }
    }

    if (token) {
      const fallbackUser = { id: "manager", name: "Manager", email: "manager@cleanones.com", role: "SUPER_ADMIN" as const };
      try {
        localStorage.setItem("cleanones-dashboard-user", JSON.stringify(fallbackUser));
      } catch {}
      store.dispatch(initializeAuth(fallbackUser));
      return;
    }

    store.dispatch(initializeAuth(null));
  }, []);
  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}><AuthInitializer>{children}</AuthInitializer></Provider>;
}

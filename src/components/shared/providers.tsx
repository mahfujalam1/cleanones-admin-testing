"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { initializeAuth } from "@/store/slices/auth.slice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedUser = localStorage.getItem("cleanones-dashboard-user");
    if (savedUser) {
      try {
        store.dispatch(initializeAuth(JSON.parse(savedUser)));
        return;
      } catch {
        localStorage.removeItem("cleanones-dashboard-user");
      }
    }
    store.dispatch(initializeAuth(null));
  }, []);
  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}><AuthInitializer>{children}</AuthInitializer></Provider>;
}

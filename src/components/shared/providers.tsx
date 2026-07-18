"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { initializeAuth } from "@/store/slices/auth.slice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    store.dispatch(initializeAuth(token ? { id: "1", name: "Kaz Putters", email: "manager@cleanones.nl", role: "Manager" } : null));
  }, []);
  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}><AuthInitializer>{children}</AuthInitializer></Provider>;
}

"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { initializeAuth } from "@/store/slices/auth.slice";
import { getCurrentUser } from "@/services/actions/auth";
import { getManagerProfile } from "@/services/actions/manager";
import type { DashboardRole } from "@/lib/access-control";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedUser = localStorage.getItem("cleanones-dashboard-user");
    const token = typeof document !== "undefined"
      ? document.cookie.match(/(?:^|; )cleanones_manager_access_token=([^;]*)/)?.[1]
      : null;

    if (savedUser) {
      try {
        store.dispatch(initializeAuth(JSON.parse(savedUser)));
      } catch {
        localStorage.removeItem("cleanones-dashboard-user");
      }
    }

    if (token) {
      void getCurrentUser().then((res) => {
        if (res.success && res.data) {
          const rawRole = (res.data.role || "MANAGER").toUpperCase().replaceAll("-", "_");
          const role: DashboardRole = (rawRole === "ADMIN" || rawRole === "SUPERADMIN" ? "SUPER_ADMIN" : rawRole) as DashboardRole;
          const trueId = res.data.id || res.data._id || res.data.user_id || "manager";
          const trueName = res.data.full_name || res.data.name || "Manager";
          const syncedUser = {
            id: trueId,
            name: trueName,
            email: res.data.email,
            role,
            profilePhoto: res.data.profile_photo,
          };
          store.dispatch(initializeAuth(syncedUser));
          try {
            localStorage.setItem("cleanones-dashboard-user", JSON.stringify(syncedUser));
            localStorage.setItem("cleanones-chat-my-id", trueId);
            localStorage.setItem("cleanones-chat-my-name", trueName);
          } catch {}
        }
      });

      void getManagerProfile().then((res) => {
        if (res.success && res.data) {
          const rawRole = (res.data.role || "MANAGER").toUpperCase().replaceAll("-", "_");
          const role: DashboardRole = (rawRole === "ADMIN" || rawRole === "SUPERADMIN" ? "SUPER_ADMIN" : rawRole) as DashboardRole;
          const trueId = res.data.id || (res.data as any)._id || "manager";
          const trueName = res.data.full_name || (res.data as any).name || "Manager";
          const syncedUser = {
            id: trueId,
            name: trueName,
            email: res.data.email,
            role,
            profilePhoto: res.data.profile_photo,
          };
          store.dispatch(initializeAuth(syncedUser));
          try {
            localStorage.setItem("cleanones-dashboard-user", JSON.stringify(syncedUser));
            localStorage.setItem("cleanones-chat-my-id", trueId);
            localStorage.setItem("cleanones-chat-my-name", trueName);
          } catch {}
        } else if (!savedUser) {
          const fallbackUser = { id: "manager", name: "Manager", email: "manager@cleanones.com", role: "SUPER_ADMIN" as const };
          store.dispatch(initializeAuth(fallbackUser));
        }
      });
      return;
    }

    if (!savedUser) {
      store.dispatch(initializeAuth(null));
    }
  }, []);
  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}><AuthInitializer>{children}</AuthInitializer></Provider>;
}

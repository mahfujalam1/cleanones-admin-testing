"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { initializeAuth } from "@/store/slices/auth.slice";
import { getCurrentUser } from "@/services/actions/auth";
import { getManagerProfile } from "@/services/actions/manager";
import type { DashboardRole } from "@/lib/access-control";

type ProfileSource = {
  id?: string;
  _id?: string;
  user_id?: string;
  full_name?: string;
  name?: string | null;
  email?: string;
  role?: string;
  profile_photo?: string | null;
};

/**
 * /auth/me and /manager/me are both fetched on start-up and race each other. They do not
 * return the same fields — only /manager/me is guaranteed to carry profile_photo — so
 * each response is merged into what is already known instead of replacing it. Replacing
 * meant whichever call finished last could blank the avatar until the profile page was
 * opened and re-fetched it.
 */
function syncUser(source: ProfileSource) {
  const previous = store.getState().auth.user;
  const rawRole = (source.role || previous?.role || "MANAGER").toUpperCase().replaceAll("-", "_");
  const role: DashboardRole = (rawRole === "ADMIN" || rawRole === "SUPERADMIN" ? "SUPER_ADMIN" : rawRole) as DashboardRole;

  const nextUser = {
    id: source.id || source._id || source.user_id || previous?.id || "manager",
    name: source.full_name || source.name || previous?.name || "Manager",
    email: source.email || previous?.email || "",
    role,
    profilePhoto: source.profile_photo ?? previous?.profilePhoto,
  };

  store.dispatch(initializeAuth(nextUser));
  try {
    localStorage.setItem("cleanones-dashboard-user", JSON.stringify(nextUser));
    localStorage.setItem("cleanones-chat-my-id", nextUser.id);
    localStorage.setItem("cleanones-chat-my-name", nextUser.name);
  } catch {}
}

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
        if (res.success && res.data) syncUser(res.data as ProfileSource);
      });

      void getManagerProfile().then((res) => {
        if (res.success && res.data) {
          syncUser(res.data);
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

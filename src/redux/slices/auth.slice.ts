import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DashboardUser } from "@/lib/auth/session";

export type { DashboardUser };

type AuthState = {
  user: DashboardUser | null;
  isAuthenticated: boolean;

  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<DashboardUser | null>) {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
    },
    initializeAuth(state, action: PayloadAction<DashboardUser | null>) {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
      state.initialized = true;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, initializeAuth, logout } = authSlice.actions;
export default authSlice.reducer;

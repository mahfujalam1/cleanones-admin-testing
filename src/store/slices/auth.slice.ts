import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: { id: string; name: string; email: string; role: string } | null;
  isAuthenticated: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthState['user']>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    initializeAuth(state, action: PayloadAction<AuthState['user']>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
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

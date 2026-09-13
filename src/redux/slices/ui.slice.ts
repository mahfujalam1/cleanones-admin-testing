import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  signOutModalOpen: boolean;
}

const initialState: UiState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
  theme: 'system',
  signOutModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setTheme(state, action: PayloadAction<UiState['theme']>) {
      state.theme = action.payload;
    },
    toggleMobileSidebar(state) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    closeMobileSidebar(state) {
      state.mobileSidebarOpen = false;
    },
    setSignOutModalOpen(state, action: PayloadAction<boolean>) {
      state.signOutModalOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleMobileSidebar,
  closeMobileSidebar,
  setSignOutModalOpen,
} = uiSlice.actions;

export default uiSlice.reducer;

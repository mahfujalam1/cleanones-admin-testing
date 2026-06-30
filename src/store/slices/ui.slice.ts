import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
}

const initialState: UiState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
  theme: 'system',
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
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleMobileSidebar,
  closeMobileSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;
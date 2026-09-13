/**
 * One store for the whole app. Server data lives in the RTK Query cache, so the slices here
 * hold only what the UI owns: the signed-in user and transient interface state.
 */
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import uiReducer from './slices/ui.slice';
import { baseApi } from './api/baseApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

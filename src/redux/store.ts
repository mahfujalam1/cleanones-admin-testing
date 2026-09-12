import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import { reducer } from "./rootReducer";

export const store = configureStore({
  reducer: {
    ...reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

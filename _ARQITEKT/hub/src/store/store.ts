import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import { uiReducer } from './slices/uiSlice';
import { editorReducer } from './slices/editorSlice';
import { chatReducer } from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    ui: uiReducer,
    editor: editorReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

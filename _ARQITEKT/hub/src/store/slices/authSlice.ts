import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../api/authApi';

export interface AuthState {
  user: AuthUser | null;
  authEnabled: boolean;
  isAuthenticated: boolean;
  isChecked: boolean;
}

const initialState: AuthState = {
  user: null,
  authEnabled: false,
  isAuthenticated: false,
  isChecked: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthStatus(state, action: PayloadAction<{
      user: AuthUser | null;
      authEnabled: boolean;
      authenticated: boolean;
    }>) {
      state.user = action.payload.user;
      state.authEnabled = action.payload.authEnabled;
      state.isAuthenticated = action.payload.authenticated;
      state.isChecked = true;
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthStatus, clearAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;

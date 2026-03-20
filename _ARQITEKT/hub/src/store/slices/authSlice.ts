import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../api/authApi';

export type SessionMode = 'github' | 'anthropic' | 'explore' | 'developer' | null;

export interface AuthState {
  user: AuthUser | null;
  authEnabled: boolean;
  isAuthenticated: boolean;
  isChecked: boolean;
  /** The session mode chosen on the start page. */
  sessionMode: SessionMode;
}

function loadSessionMode(): SessionMode {
  const stored = localStorage.getItem('arqitekt-session-mode');
  if (stored === 'github' || stored === 'anthropic' || stored === 'explore' || stored === 'developer') {
    return stored;
  }
  return null;
}

const initialState: AuthState = {
  user: null,
  authEnabled: false,
  isAuthenticated: false,
  isChecked: false,
  sessionMode: loadSessionMode(),
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
    setSessionMode(state, action: PayloadAction<SessionMode>) {
      state.sessionMode = action.payload;
      if (action.payload) {
        localStorage.setItem('arqitekt-session-mode', action.payload);
      } else {
        localStorage.removeItem('arqitekt-session-mode');
      }
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.sessionMode = null;
      localStorage.removeItem('arqitekt-session-mode');
    },
  },
});

export const { setSessionMode, clearAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Theme = 'dark' | 'light';
export type Language = 'de' | 'en';

export interface UiState {
  theme: Theme;
  language: Language;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function loadLanguage(): Language {
  try {
    const stored = localStorage.getItem('arqitekt-language');
    if (stored === 'de' || stored === 'en') {
      return stored;
    }
  } catch {
    // localStorage not available (SSR, privacy mode, etc.)
  }
  return 'en';
}

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem('arqitekt-theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return 'dark';
}

/* ------------------------------------------------------------------ */
/*  Slice                                                              */
/* ------------------------------------------------------------------ */

const initialState: UiState = {
  theme: loadTheme(),
  language: loadLanguage(),
  sidebarOpen: true,
  commandPaletteOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('arqitekt-theme', state.theme);
      } catch {
        // ignore
      }
    },

    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
      try {
        localStorage.setItem('arqitekt-language', action.payload);
      } catch {
        // ignore
      }
    },

    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },

    toggleCommandPalette(state) {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    },
  },
});

export const { toggleTheme, setLanguage, toggleSidebar, toggleCommandPalette } =
  uiSlice.actions;

export const uiReducer = uiSlice.reducer;

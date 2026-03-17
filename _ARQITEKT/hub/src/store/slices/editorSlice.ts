import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EditorTab {
  id: string;
  path: string;
  name: string;
  language: string;
  content: string;
  isDirty: boolean;
}

export interface EditorState {
  openTabs: EditorTab[];
  activeTabId: string | null;
}

/* ------------------------------------------------------------------ */
/*  Slice                                                              */
/* ------------------------------------------------------------------ */

const initialState: EditorState = {
  openTabs: [],
  activeTabId: null,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    openTab(state, action: PayloadAction<EditorTab>) {
      const existing = state.openTabs.find((t) => t.id === action.payload.id);
      if (!existing) {
        state.openTabs.push(action.payload);
      }
      state.activeTabId = action.payload.id;
    },

    closeTab(state, action: PayloadAction<string>) {
      const index = state.openTabs.findIndex((t) => t.id === action.payload);
      if (index === -1) return;

      state.openTabs.splice(index, 1);

      if (state.activeTabId === action.payload) {
        // Activate the nearest remaining tab, preferring the one to the left
        const newIndex = Math.min(index, state.openTabs.length - 1);
        state.activeTabId =
          newIndex >= 0 ? (state.openTabs[newIndex]?.id ?? null) : null;
      }
    },

    setActiveTab(state, action: PayloadAction<string>) {
      if (state.openTabs.some((t) => t.id === action.payload)) {
        state.activeTabId = action.payload;
      }
    },

    updateContent(
      state,
      action: PayloadAction<{ id: string; content: string }>,
    ) {
      const tab = state.openTabs.find((t) => t.id === action.payload.id);
      if (tab) {
        tab.content = action.payload.content;
        tab.isDirty = true;
      }
    },

    markSaved(state, action: PayloadAction<string>) {
      const tab = state.openTabs.find((t) => t.id === action.payload);
      if (tab) {
        tab.isDirty = false;
      }
    },
  },
});

export const { openTab, closeTab, setActiveTab, updateContent, markSaved } =
  editorSlice.actions;

export const editorReducer = editorSlice.reducer;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  model: string;
  isLoading: boolean;
}

/* ------------------------------------------------------------------ */
/*  Slice                                                              */
/* ------------------------------------------------------------------ */

const initialState: ChatState = {
  isOpen: false,
  messages: [],
  model: 'claude-sonnet',
  isLoading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChat(state) {
      state.isOpen = !state.isOpen;
    },

    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },

    updateMessage(state, action: PayloadAction<{ id: string; content: string }>) {
      const msg = state.messages.find((m) => m.id === action.payload.id);
      if (msg) {
        msg.content = action.payload.content;
      }
    },

    setModel(state, action: PayloadAction<string>) {
      state.model = action.payload;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const { toggleChat, addMessage, updateMessage, setModel, setLoading } =
  chatSlice.actions;

export const chatReducer = chatSlice.reducer;


// src/store/chatStore.ts

import { create } from "zustand";
import { ChatMessage, ReasoningStep } from "../types/chat";

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  recursive: boolean;
  darkMode: boolean;
  
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string, sources?: string[], reasoning?: ReasoningStep[]) => void;
  clearMessages: () => void;
  setStreaming: (streaming: boolean) => void;
  toggleRecursive: () => void;
  toggleDarkMode: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  recursive: true,
  darkMode: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (content, sources, reasoning) =>
    set((state) => {
      const messages = [...state.messages];
      const lastIndex = messages.length - 1;
      if (lastIndex >= 0) {
        messages[lastIndex] = {
          ...messages[lastIndex],
          content,
          ...(sources && { sources }),
          ...(reasoning && { reasoning_steps: reasoning }),
        };
      }
      return { messages };
    }),

  clearMessages: () => set({ messages: [] }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  toggleRecursive: () => set((state) => ({ recursive: !state.recursive })),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));

export type { ChatMessage };
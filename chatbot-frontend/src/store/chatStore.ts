import { create } from "zustand";

export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
  reasoning?: any[];
  sources?: any[];
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  updateLastAssistant: (
    content: string,
    meta?: Partial<ChatMessage>
  ) => void;
  clear: () => void; // ✅ ADD THIS
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],

  addMessage: (m) =>
    set((state) => ({
      messages: [...state.messages, m]
    })),

  updateLastAssistant: (content, meta) =>
    set((state) => {
      const messages = [...state.messages];
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "assistant") {
          messages[i] = { ...messages[i], content, ...meta };
          break;
        }
      }
      return { messages };
    }),

  clear: () => set({ messages: [] }) // ✅ IMPLEMENTATION
}));

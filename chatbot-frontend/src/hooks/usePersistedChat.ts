import { useEffect, useState } from "react";
import { ChatMessage } from "../types/chat";

const KEY = "rag-chat-history";

export function usePersistedChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(messages));
  }, [messages]);

  return { messages, setMessages };
}

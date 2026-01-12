import { useMutation, useQuery } from "@tanstack/react-query";
import { ChatMessage, HealthStatus } from "../types/chat";

const API_BASE_URL = "http://localhost:8000";

export function useHealth() {
  return useQuery<HealthStatus>({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/health/`);
      if (!res.ok) throw new Error("Health check failed");
      return res.json();
    },
    refetchInterval: 30000
  });
}

export function useStreamingChat() {
  const stream = async (
    payload: any,
    onToken: (t: string) => void,
    onDone: () => void
  ) => {
    const res = await fetch("http://localhost:8000/chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value);
      buffer.split("\n\n").forEach((line) => {
        if (line.startsWith("data: ")) {
          onToken(line.replace("data: ", ""));
        }
      });
      buffer = "";
    }
    onDone();
  };

  return { stream };
}

export function useChat() {
  return useMutation({
    mutationFn: async (payload: {
      message: string;
      conversation_history: ChatMessage[];
      use_recursive: boolean;
    }) => {
      const res = await fetch(`${API_BASE_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, max_recursion_depth: 3 })
      });

      if (!res.ok) throw new Error("Chat failed");
      return res.json();
    }
  });
}

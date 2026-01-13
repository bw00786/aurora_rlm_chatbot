// src/api/chatApi.ts

import { ChatMessage, HealthStatus } from "../types/chat";

const API_BASE = "http://localhost:8000";

export interface StreamResponse {
  type: "status" | "sources" | "reasoning" | "token" | "done" | "error";
  message?: string;
  sources?: string[];
  steps?: any[];
  token?: string;
  error?: string;
}

export interface ChatStreamCallbacks {
  onStatus?: (message: string) => void;
  onSources?: (sources: string[]) => void;
  onReasoning?: (steps: any[]) => void;
  onToken?: (token: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

/**
 * Stream chat with the RAG backend
 */
export async function streamChat(
  message: string,
  useRecursive: boolean,
  maxDepth: number,
  callbacks: ChatStreamCallbacks
): Promise<string> {
  const response = await fetch(`${API_BASE}/api/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      use_recursive: useRecursive,
      max_recursion_depth: maxDepth,
      conversation_history: [],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get reader from response");
  }

  const decoder = new TextDecoder();
  let fullResponse = "";
  let sources: string[] = [];
  let reasoningSteps: any[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const data: StreamResponse = JSON.parse(jsonStr);

            switch (data.type) {
              case "status":
                if (data.message) callbacks.onStatus?.(data.message);
                break;

              case "sources":
                if (data.sources) {
                  sources = data.sources;
                  callbacks.onSources?.(data.sources);
                }
                break;

              case "reasoning":
                if (data.steps) {
                  reasoningSteps = data.steps;
                  callbacks.onReasoning?.(data.steps);
                }
                break;

              case "token":
                if (data.token) {
                  fullResponse += data.token;
                  callbacks.onToken?.(data.token);
                }
                break;

              case "done":
                callbacks.onDone?.();
                break;

              case "error":
                if (data.error) {
                  callbacks.onError?.(data.error);
                  throw new Error(data.error);
                }
                break;
            }
          } catch (e) {
            console.error("Failed to parse JSON:", jsonStr, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullResponse;
}

/**
 * Upload PDFs to the backend
 */
export async function uploadPdfs(files: File[]): Promise<{ message: string; total_chunks: number }> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_BASE}/upload-pdfs/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get health status
 */
export async function getHealth(): Promise<HealthStatus & { documents_count: number }> {
  const response = await fetch(`${API_BASE}/health/`);
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json();
}

/**
 * Clear the database
 */
export async function clearDatabase(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/clear-database/`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to clear database");
  }

  return response.json();
}

/**
 * Get vector store stats
 */
export async function getVectorStats(): Promise<{
  documents: number;
  chunks: number;
  embedding_model: string;
}> {
  const response = await fetch(`${API_BASE}/vector-store/stats`);
  if (!response.ok) {
    throw new Error("Failed to get stats");
  }
  return response.json();
}
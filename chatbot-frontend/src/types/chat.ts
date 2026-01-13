// src/types/chat.ts

export type Role = "user" | "assistant";

export interface ReasoningStep {
  depth: number;
  type: "analysis" | "direct_answer" | "sub_question" | "synthesis" | "refinement" | "final_answer";
  query: string;
  action?: string;
  needs_recursion?: boolean;
  sub_questions?: string[];
}

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  ollama: "running" | "not running";
  documents_count: number;
}

export interface ChatMessage {
  role: Role;
  content: string;
  reasoning_steps?: ReasoningStep[];
  sources?: string[];
}

export interface StreamChunk {
  type: "status" | "sources" | "reasoning" | "token" | "done" | "error";
  message?: string;
  sources?: string[];
  steps?: ReasoningStep[];
  token?: string;
  error?: string;
}
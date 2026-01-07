export type Role = "user" | "assistant";

export interface ReasoningStep {
  type: string;
  depth?: number;
  action?: string;
  query?: string;
}

export interface ChatMessage {
  role: Role;
  content: string;
  reasoning_steps?: ReasoningStep[];
  sources?: string[];
}

export interface HealthStatus {
  status: "healthy" | "error";
  ollama: string;
  documents_count: number;
}

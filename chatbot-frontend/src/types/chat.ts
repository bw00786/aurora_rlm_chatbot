export type Role = "user" | "assistant";

export interface ReasoningStep {
  type: string;
  depth?: number;
  action?: string;
  query?: string;
}

export type HealthStatus = {
  status: "healthy" | "error";
};


export interface ChatMessage {
  role: Role;
  content: string;
  reasoning_steps?: ReasoningStep[];
  sources?: string[];
}





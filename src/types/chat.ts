export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface ChatSession {
  id: string;
  title: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  preview?: string;
  messageCount?: number;
}

export interface ChatMessage {
  id: string;
  sessionId?: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
  meta?: Record<string, unknown>;
}

export interface SendMessageResult {
  sessionId: string;
  messages: ChatMessage[];
  raw?: unknown;
}

export interface MarketInsightResult {
  sessionId?: string;
  source: string;
  data: unknown;
}

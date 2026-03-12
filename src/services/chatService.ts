import api from "@/api/axios";
import type { ChatMessage, ChatRole, ChatSession, MarketInsightResult, SendMessageResult } from "@/types/chat";

const SESSION_LIST_ENDPOINTS = [
  "/owner-chat/sessions",
  "/api/owner-chat/sessions",
  "/owner/chat/sessions",
  "/api/owner/chat/sessions",
];

const SESSION_CREATE_ENDPOINTS = [
  "/owner-chat/sessions",
  "/api/owner-chat/sessions",
  "/owner/chat/sessions",
  "/api/owner/chat/sessions",
  "/owner-chat/session",
];

const MESSAGE_LIST_PATTERNS = [
  "/owner-chat/sessions/:id/messages",
  "/api/owner-chat/sessions/:id/messages",
  "/owner/chat/sessions/:id/messages",
  "/api/owner/chat/sessions/:id/messages",
  "/owner-chat/:id/messages",
  "/api/owner-chat/:id/messages",
];

const MESSAGE_SEND_PATTERNS = MESSAGE_LIST_PATTERNS;

const MARKET_ENDPOINTS = [
  "/owner-chat/market-watch",
  "/owner-chat/market",
  "/advisor/market-watch",
  "/advisor/price-evaluation",
  "/pricing/evaluate",
  "/ai/market-watch",
  "/api/advisor/market-watch",
  "/api/pricing/evaluate",
];

function normalizeRole(input: unknown): ChatRole {
  const role = String(input || "assistant").toLowerCase();
  if (role === "user" || role === "assistant" || role === "system" || role === "tool") return role;
  if (role.includes("owner") || role.includes("client")) return "user";
  if (role.includes("ai") || role.includes("bot")) return "assistant";
  return "assistant";
}

function coerceArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

function normalizeSession(raw: unknown): ChatSession {
  const item = (raw || {}) as Record<string, unknown>;
  const id = String(item.id ?? item.sessionId ?? item._id ?? "");
  const title = String(item.title ?? item.name ?? item.topic ?? "New conversation");
  return {
    id,
    title,
    status: item.status ? String(item.status) : undefined,
    createdAt: item.createdAt ? String(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
    preview: item.preview ? String(item.preview) : item.lastMessage ? String(item.lastMessage) : undefined,
    messageCount: typeof item.messageCount === "number" ? item.messageCount : undefined,
  };
}

function normalizeMessage(raw: unknown, sessionId?: string): ChatMessage {
  const item = (raw || {}) as Record<string, unknown>;
  const content = String(item.content ?? item.message ?? item.text ?? item.reply ?? "").trim();
  return {
    id: String(item.id ?? item._id ?? `${sessionId || "msg"}-${Math.random().toString(36).slice(2, 9)}`),
    sessionId: String(item.sessionId ?? sessionId ?? ""),
    role: normalizeRole(item.role ?? item.sender ?? item.type),
    content,
    createdAt: item.createdAt ? String(item.createdAt) : item.timestamp ? String(item.timestamp) : undefined,
    meta: item.meta && typeof item.meta === "object" ? (item.meta as Record<string, unknown>) : undefined,
  };
}

function mapSessionListPayload(payload: unknown): ChatSession[] {
  const data = (payload || {}) as Record<string, unknown>;
  const list = coerceArray(data.sessions).length
    ? coerceArray(data.sessions)
    : coerceArray(data.items).length
    ? coerceArray(data.items)
    : coerceArray(payload);

  return list.map(normalizeSession).filter((s) => s.id);
}

function mapMessagesPayload(payload: unknown, sessionId?: string): ChatMessage[] {
  const data = (payload || {}) as Record<string, unknown>;

  const list = coerceArray(data.messages).length
    ? coerceArray(data.messages)
    : coerceArray(data.items).length
    ? coerceArray(data.items)
    : coerceArray(payload);

  return list
    .map((m) => normalizeMessage(m, sessionId))
    .filter((m) => m.content.length > 0)
    .sort((a, b) => (new Date(a.createdAt || 0).getTime() || 0) - (new Date(b.createdAt || 0).getTime() || 0));
}

function replacePath(pattern: string, sessionId: string): string {
  return pattern.replace(":id", encodeURIComponent(sessionId));
}

async function getFirstSuccess<T = unknown>(urls: string[]): Promise<{ url: string; data: T }> {
  let lastError: unknown = null;
  for (const url of urls) {
    try {
      const res = await api.get(url);
      return { url, data: res.data as T };
    } catch (err: any) {
      const status = err?.response?.status;
      if (status && status !== 404) throw err;
      lastError = err;
    }
  }
  throw lastError || new Error("No endpoint responded successfully");
}

async function postFirstSuccess<T = unknown>(urls: string[], bodyVariants: unknown[]): Promise<{ url: string; data: T }> {
  let lastError: unknown = null;
  for (const url of urls) {
    for (const body of bodyVariants) {
      try {
        const res = await api.post(url, body);
        return { url, data: res.data as T };
      } catch (err: any) {
        const status = err?.response?.status;
        if (status && status !== 404 && status !== 400 && status !== 422) throw err;
        lastError = err;
      }
    }
  }
  throw lastError || new Error("No endpoint accepted request");
}

export async function listOwnerChatSessions(): Promise<ChatSession[]> {
  const { data } = await getFirstSuccess(SESSION_LIST_ENDPOINTS);
  return mapSessionListPayload(data);
}

export async function createOwnerChatSession(title?: string): Promise<ChatSession> {
  const { data } = await postFirstSuccess(SESSION_CREATE_ENDPOINTS, [
    { title: title || "New conversation" },
    { name: title || "New conversation" },
    {},
  ]);

  const obj = (data || {}) as Record<string, unknown>;
  const raw = obj.session ?? obj.item ?? data;
  const session = normalizeSession(raw);

  if (!session.id) {
    const sessions = mapSessionListPayload(data);
    if (sessions[0]?.id) return sessions[0];
    throw new Error("Session created but ID was missing in response");
  }

  return session;
}

export async function listOwnerChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const urls = MESSAGE_LIST_PATTERNS.map((p) => replacePath(p, sessionId));
  const { data } = await getFirstSuccess(urls);
  return mapMessagesPayload(data, sessionId);
}

export async function sendOwnerChatMessage(sessionId: string, prompt: string): Promise<SendMessageResult> {
  const urls = MESSAGE_SEND_PATTERNS.map((p) => replacePath(p, sessionId));
  const { data } = await postFirstSuccess(urls, [
    { message: prompt },
    { content: prompt },
    { prompt },
    { text: prompt },
    { message: prompt, role: "owner" },
  ]);

  const obj = (data || {}) as Record<string, unknown>;
  const responseSessionId = String(obj.sessionId ?? obj.session?.id ?? sessionId);
  const messages = mapMessagesPayload(data, responseSessionId);

  return {
    sessionId: responseSessionId,
    messages,
    raw: data,
  };
}

export async function fetchOwnerMarketInsight(sessionId: string, prompt: string): Promise<MarketInsightResult | null> {
  for (const endpoint of MARKET_ENDPOINTS) {
    try {
      const res = await api.post(endpoint, {
        sessionId,
        message: prompt,
        prompt,
        query: prompt,
      });
      return {
        sessionId,
        source: endpoint,
        data: res.data,
      };
    } catch (err: any) {
      const status = err?.response?.status;
      if (status && status !== 404 && status !== 400 && status !== 422) {
        throw err;
      }
    }
  }
  return null;
}

export function extractTextFromInsight(data: unknown): string {
  const payload = (data || {}) as Record<string, unknown>;
  const direct = payload.summary ?? payload.message ?? payload.text ?? payload.reply;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const maybeResult = payload.result as Record<string, unknown> | undefined;
  if (maybeResult) {
    const nested = maybeResult.summary ?? maybeResult.message ?? maybeResult.text;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
  }

  return JSON.stringify(data, null, 2);
}

export function isMarketPricingPrompt(prompt: string): boolean {
  const text = String(prompt || "").toLowerCase();
  if (!text) return false;
  return [
    "price",
    "pricing",
    "valuation",
    "market",
    "estimate",
    "rent",
    "sell",
    "compare",
    "investment",
    "سعر",
    "تقييم",
    "تسعير",
    "سوق",
    "مقارنة",
    "استثمار",
    "ايجار",
    "إيجار",
    "بيع",
  ].some((kw) => text.includes(kw));
}

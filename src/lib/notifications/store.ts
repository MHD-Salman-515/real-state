export type NotificationType = "search" | "saved" | "system" | "property" | string;

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
};

const KEY_PREFIX = "notifications:v1:";

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function pickId(source: Record<string, unknown> | null | undefined): string | null {
  if (!source) return null;
  const candidates = [
    source.id,
    source.userId,
    source.user_id,
    source.sub,
    source.email,
    source.username,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return null;
}

export function getUserId(): string {
  if (typeof window === "undefined") return "guest";

  const userCandidates = [
    safeParse<Record<string, unknown>>(localStorage.getItem("auth_user_v1")),
    safeParse<Record<string, unknown>>(localStorage.getItem("user")),
    safeParse<Record<string, unknown>>(localStorage.getItem("auth")),
  ];

  for (const user of userCandidates) {
    const id = pickId(user);
    if (id) return id;
  }

  const tokenCandidates = [
    localStorage.getItem("auth_token_v1"),
    localStorage.getItem("access_token"),
  ];

  for (const token of tokenCandidates) {
    if (!token) continue;
    const payload = decodeJwtPayload(token);
    const id = pickId(payload);
    if (id) return id;
  }

  return "guest";
}

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId || "guest"}`;
}

export function load(userId: string): NotificationItem[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<NotificationItem[]>(localStorage.getItem(keyFor(userId)));
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item) => item && typeof item.id === "string")
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function save(userId: string, items: NotificationItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(items));
  } catch {
    // ignore storage write failures
  }
}

export function add(
  userId: string,
  item: Omit<NotificationItem, "id" | "createdAt" | "read"> & Partial<Pick<NotificationItem, "id" | "createdAt" | "read">>
): NotificationItem[] {
  const nextItem: NotificationItem = {
    id: item.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: item.createdAt ?? Date.now(),
    read: item.read ?? false,
    type: item.type,
    title: item.title,
    message: item.message,
  };

  const next = [nextItem, ...load(userId)];
  save(userId, next);
  return next;
}

export function markRead(userId: string, id: string): NotificationItem[] {
  const next = load(userId).map((item) => (item.id === id ? { ...item, read: true } : item));
  save(userId, next);
  return next;
}

export function markAllRead(userId: string): NotificationItem[] {
  const next = load(userId).map((item) => ({ ...item, read: true }));
  save(userId, next);
  return next;
}

export function clearAll(userId: string): NotificationItem[] {
  save(userId, []);
  return [];
}

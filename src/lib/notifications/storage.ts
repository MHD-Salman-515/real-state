import type { NotificationItem, NotificationType } from "@/lib/notifications/types";

const KEY_PREFIX = "notifications:v1:";

type Identity = { userId: string; role?: string; name?: string };

const ROLE_LABELS: Record<string, string> = {
  clint: "Client",
  client: "Client",
  suppliser: "Supplier",
  supplier: "Supplier",
  accounter: "Accountant",
  accountant: "Accountant",
  admin: "Admin",
  owner: "Owner",
  worker: "Worker",
};

export function normalizeRoleLabel(role: unknown): string {
  const raw = String(role || "").trim().toLowerCase();
  if (!raw) return "Guest";
  if (ROLE_LABELS[raw]) return ROLE_LABELS[raw];
  return raw.replace(/\b\w/g, (c) => c.toUpperCase());
}

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

function getString(source: Record<string, unknown> | null, keys: string[]): string | undefined {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

export function getUserIdentity(authUser?: unknown, authToken?: unknown): Identity {
  const authSource = (authUser && typeof authUser === "object" ? authUser : null) as Record<string, unknown> | null;
  if (authSource) {
    const userId = getString(authSource, ["id", "_id", "userId", "user_id", "sub", "email"]);
    if (userId) {
      return {
        userId,
        role: normalizeRoleLabel(getString(authSource, ["role", "userRole"])),
        name: getString(authSource, ["full_name", "fullName", "name"]) || "Guest",
      };
    }
  }

  if (typeof authToken === "string" && authToken.includes(".")) {
    const payload = decodeJwtPayload(authToken);
    const userId = getString(payload, ["sub", "id", "userId", "user_id", "email"]);
    if (userId) {
      return {
        userId,
        role: normalizeRoleLabel(getString(payload, ["role", "userRole"])),
        name: getString(payload, ["name", "full_name", "fullName"]) || "Guest",
      };
    }
  }

  if (typeof window === "undefined") return { userId: "guest", role: "Guest", name: "Guest" };

  const candidates = [
    safeParse<Record<string, unknown>>(localStorage.getItem("auth_user_v1")),
    safeParse<Record<string, unknown>>(localStorage.getItem("user")),
    safeParse<Record<string, unknown>>(localStorage.getItem("auth")),
  ];

  for (const source of candidates) {
    const userId = getString(source, ["id", "_id", "userId", "user_id", "sub", "email"]);
    if (userId) {
      return {
        userId,
        role: normalizeRoleLabel(getString(source, ["role", "userRole"])),
        name: getString(source, ["full_name", "fullName", "name"]) || "Guest",
      };
    }
  }

  const tokenCandidates = [
    localStorage.getItem("auth_token_v1"),
    localStorage.getItem("access_token"),
  ];

  for (const token of tokenCandidates) {
    if (!token) continue;
    const payload = decodeJwtPayload(token);
    const userId = getString(payload, ["sub", "id", "userId", "user_id", "email"]);
    if (userId) {
      return {
        userId,
        role: normalizeRoleLabel(getString(payload, ["role", "userRole"])),
        name: getString(payload, ["name", "full_name", "fullName"]) || "Guest",
      };
    }
  }

  return { userId: "guest", role: "Guest", name: "Guest" };
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
    // ignore
  }
}

export function add(
  userId: string,
  item: { type: NotificationType; title: string; message: string }
): NotificationItem[] {
  const nextItem: NotificationItem = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: item.type,
    title: item.title,
    message: item.message,
    createdAt: Date.now(),
    read: false,
  };

  const next = [nextItem, ...load(userId)];
  save(userId, next);
  return next;
}

export function markRead(userId: string, id: string): NotificationItem[] {
  const next = load(userId).map((n) => (n.id === id ? { ...n, read: true } : n));
  save(userId, next);
  return next;
}

export function markAllRead(userId: string): NotificationItem[] {
  const next = load(userId).map((n) => ({ ...n, read: true }));
  save(userId, next);
  return next;
}

export function clearAll(userId: string): NotificationItem[] {
  save(userId, []);
  return [];
}

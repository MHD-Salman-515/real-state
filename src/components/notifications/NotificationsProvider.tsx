import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { useAuth } from "@/context/AuthContext.jsx";
import type { NotificationItem, NotificationType } from "@/lib/notifications/types";
import {
  add,
  clearAll as clearAllStore,
  getUserIdentity,
  load,
  markAllRead as markAllReadStore,
  markRead as markReadStore,
  normalizeRoleLabel,
  save,
} from "@/lib/notifications/storage";

export type NotificationsFilter = "all" | NotificationType;

type NotifyPayload = {
  type: NotificationType;
  title: string;
  message: string;
};

export type NotificationsContextValue = {
  userId: string;
  items: NotificationItem[];
  unreadCount: number;
  activeFilter: NotificationsFilter;
  setActiveFilter: (value: NotificationsFilter) => void;
  notify: (payload: NotifyPayload) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const GLOBAL_EVENT = "notifications:push";
const LEGACY_EVENT = "notify:add";

function resolveFromAuth(user: unknown, token: unknown): { userId: string; role: string; name: string } {
  const fallback = getUserIdentity(user, token);
  const u = user as Record<string, unknown> | null;

  if (u) {
    const userIdRaw = u.id || u._id || u.userId || u.user_id || u.email;
    const userId = typeof userIdRaw === "string" ? userIdRaw : typeof userIdRaw === "number" ? String(userIdRaw) : fallback.userId;

    const roleRaw = u.role;
    const role = normalizeRoleLabel(typeof roleRaw === "string" && roleRaw.trim() ? roleRaw : fallback.role || "Guest");

    const nameRaw = u.full_name || u.fullName || u.name;
    const name = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw : fallback.name || "Guest";

    return { userId, role, name };
  }

  if (typeof token === "string" && token.includes(".")) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as Record<string, unknown>;
      const idRaw = payload.sub || payload.id || payload.userId || payload.user_id || payload.email;
      const userId = typeof idRaw === "string" ? idRaw : typeof idRaw === "number" ? String(idRaw) : fallback.userId;
      const roleRaw = payload.role;
      const role = normalizeRoleLabel(typeof roleRaw === "string" && roleRaw.trim() ? roleRaw : fallback.role || "Guest");
      const nameRaw = payload.name || payload.full_name || payload.fullName;
      const name = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw : fallback.name || "Guest";
      return { userId, role, name };
    } catch {
      // ignore
    }
  }

  return {
    userId: fallback.userId,
    role: normalizeRoleLabel(fallback.role || "Guest"),
    name: fallback.name || "Guest",
  };
}

function inferType(payload: {
  type?: string;
  title?: string;
  message?: string;
  href?: string;
}): NotificationType | null {
  const legacyType = String(payload.type || "").toLowerCase();
  if (legacyType === "error" || legacyType === "danger" || legacyType === "failed") return null;
  if (legacyType === "search" || legacyType === "system" || legacyType === "properties") {
    return legacyType as NotificationType;
  }

  const text = `${payload.title || ""} ${payload.message || ""} ${payload.href || ""}`.toLowerCase();

  if (text.includes("search") || text.includes("filter")) return "search";
  if (text.includes("property") || text.includes("favorite") || text.includes("listing")) return "properties";
  return "system";
}

export function notify(payload: NotifyPayload): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GLOBAL_EVENT, { detail: payload }));
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const identity = resolveFromAuth(auth?.user, auth?.token);

  const [items, setItems] = useState<NotificationItem[]>(() => load(identity.userId));
  const [activeFilter, setActiveFilter] = useState<NotificationsFilter>("all");

  useEffect(() => {
    setItems(load(identity.userId));
    setActiveFilter("all");
  }, [identity.userId]);

  useEffect(() => {
    save(identity.userId, items);
  }, [identity.userId, items]);

  useEffect(() => {
    const onGlobalNotify = (event: Event) => {
      const custom = event as CustomEvent<NotifyPayload>;
      const detail = custom.detail;
      if (!detail?.title || !detail?.message || !detail?.type) return;

      setItems(add(identity.userId, detail));
    };

    const onLegacyNotify = (event: Event) => {
      const custom = event as CustomEvent<{ type?: string; title?: string; message?: string; text?: string; href?: string }>;
      const detail = custom.detail || {};
      const title = String(detail.title || "Notification").trim();
      const message = String(detail.message || detail.text || "").trim();
      const type = inferType({
        type: detail.type,
        title,
        message,
        href: detail.href,
      });

      if (!message || !type) return;
      setItems(add(identity.userId, { type, title, message }));
    };

    window.addEventListener(GLOBAL_EVENT, onGlobalNotify as EventListener);
    window.addEventListener(LEGACY_EVENT, onLegacyNotify as EventListener);
    return () => {
      window.removeEventListener(GLOBAL_EVENT, onGlobalNotify as EventListener);
      window.removeEventListener(LEGACY_EVENT, onLegacyNotify as EventListener);
    };
  }, [identity.userId]);

  const value = useMemo<NotificationsContextValue>(() => {
    const unreadCount = items.reduce((count, item) => count + (item.read ? 0 : 1), 0);

    return {
      userId: identity.userId,
      items,
      unreadCount,
      activeFilter,
      setActiveFilter,
      notify: (payload) => {
        setItems(add(identity.userId, payload));
      },
      markRead: (id) => {
        setItems(markReadStore(identity.userId, id));
      },
      markAllRead: () => {
        setItems(markAllReadStore(identity.userId));
      },
      clearAll: () => {
        setItems(clearAllStore(identity.userId));
      },
    };
  }, [activeFilter, identity.userId, items]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

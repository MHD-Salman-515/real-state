import { API_BASE, buildApiUrl } from "../api/axios";

export { API_BASE };

type PostJSONOptions = {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function toUrl(path: string): string {
  return buildApiUrl(path);
}

function parseErrorMessage(data: unknown, fallback: string): string {
  if (!data) return fallback;

  if (typeof data === "string") return data;

  if (typeof data === "object") {
    const record = data as Record<string, unknown>;
    const message = record.message;

    if (typeof message === "string") return message;
    if (Array.isArray(message)) {
      const lines = message.filter((v): v is string => typeof v === "string");
      if (lines.length) return lines.join(". ");
    }

    if (typeof record.error === "string") return record.error;
  }

  return fallback;
}

export async function postJSON<TResponse = unknown, TBody = unknown>(
  path: string,
  body: TBody,
  options: PostJSONOptions = {},
): Promise<TResponse> {
  const isDev = typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);
  const normalizedPath = String(path || "");
  const lowerPath = normalizedPath.toLowerCase();
  const maybeAuthBody = (body && typeof body === "object" ? (body as Record<string, unknown>) : {}) || {};

  if (lowerPath.includes("/auth/login")) {
    const email = String(maybeAuthBody.email || "").trim();
    const password = String(maybeAuthBody.password || "");
    if (!email || password.length < 1) {
      if (isDev) {
        console.warn(`[api] blocked empty login request to ${normalizedPath}`);
      }
      throw new ApiError("Email and password are required", 400, { message: "blocked-empty-login" });
    }
  }

  const res = await fetch(toUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
    credentials: options.credentials,
    signal: options.signal,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    if (isDev) {
      console.warn(`[api] ${normalizedPath} -> ${res.status}`);
    }
    throw new ApiError(parseErrorMessage(data, `Request failed with status ${res.status}`), res.status, data);
  }

  return data as TResponse;
}

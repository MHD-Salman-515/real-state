import axios from "axios";

function normalizeApiBase(input) {
  const value = String(input || "").trim();
  return value ? value.replace(/\/+$/, "") : "";
}

export const API_BASE = normalizeApiBase(
  import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL
);
export const API_BASE_URL = API_BASE;
export const AUTH_LOGIN_PATH = "/api/auth/login";
export const AUTH_REGISTER_PATH = "/api/auth/register";
export const AUTH_ME_PATH = "/api/auth/me";

export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return "";
  }
})();

export const buildApiUrl = (path = "") => {
  if (!path) return API_BASE;
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  return path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
};

export const resolveApiAssetUrl = (path = "") => {
  if (!path) return "";
  const raw = String(path).trim();
  if (/^(https?:)?\/\//i.test(raw) || /^data:|^blob:/i.test(raw)) return raw;
  const normalized = raw.replace(/\\/g, "/");
  if (!API_BASE) {
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }
  return normalized.startsWith("/")
    ? `${API_BASE}${normalized}`
    : `${API_BASE}/${normalized}`;
};

export function getStoredAccessToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("auth_token_v1") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token_v1") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

export function extractApiErrorMessage(error, fallback = "Request failed.") {
  const data = error?.response?.data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message.trim();
  if (Array.isArray(data?.message)) {
    const joined = data.message.filter((item) => typeof item === "string" && item.trim()).join(". ");
    if (joined) return joined;
  }
  if (typeof data?.error === "string" && data.error.trim()) return data.error.trim();
  if (typeof error?.message === "string" && error.message.trim()) return error.message.trim();
  return fallback;
}

function formatErrorUrl(config) {
  const url = String(config?.url || "").trim();
  if (!url) return API_BASE || "/";
  if (/^https?:\/\//i.test(url)) return url;
  return buildApiUrl(url);
}

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status ?? "NETWORK";
    const method = String(error?.config?.method || "GET").toUpperCase();
    const url = formatErrorUrl(error?.config);
    const message = extractApiErrorMessage(error, "Request failed.");
    console.error(`[api] ${method} ${url} -> ${status}: ${message}`);
    return Promise.reject(error);
  },
);

export default api;

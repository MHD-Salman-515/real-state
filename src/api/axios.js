import axios from "axios";

function normalizeApiBase(input) {
  const value = String(input || "").trim();
  return value ? value.replace(/\/+$/, "") : "";
}

export const API_BASE_URL = normalizeApiBase(
  import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL
);

export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "";
  }
})();

export const buildApiUrl = (path = "") => {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE_URL) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  return path.startsWith("/") ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
};

export const resolveApiAssetUrl = (path = "") => {
  if (!path) return "";
  const raw = String(path).trim();
  if (/^(https?:)?\/\//i.test(raw) || /^data:|^blob:/i.test(raw)) return raw;
  const normalized = raw.replace(/\\/g, "/");
  if (!API_BASE_URL) {
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }
  return normalized.startsWith("/")
    ? `${API_BASE_URL}${normalized}`
    : `${API_BASE_URL}/${normalized}`;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token_v1");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

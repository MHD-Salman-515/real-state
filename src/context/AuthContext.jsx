import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import api, {
  AUTH_LOGIN_PATH,
  AUTH_ME_PATH,
  AUTH_REGISTER_PATH,
  extractApiErrorMessage,
  getStoredAccessToken,
} from "../api/axios";

const LS_TOKEN = "auth_token_v1";
const LS_USER = "auth_user_v1";

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function getString(source, keys) {
  if (!source || typeof source !== "object") return "";
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function extractAccessToken(payload) {
  const root = payload && typeof payload === "object" ? payload : {};
  const nested = root.data && typeof root.data === "object" ? root.data : {};
  const tokens = root.tokens && typeof root.tokens === "object" ? root.tokens : {};

  return (
    getString(root, ["token", "accessToken", "access_token", "jwt"]) ||
    getString(nested, ["token", "accessToken", "access_token", "jwt"]) ||
    getString(tokens, ["accessToken", "access_token", "token"]) ||
    ""
  );
}

function normalizeUser(rawUser, token) {
  const source = rawUser && typeof rawUser === "object" ? rawUser : {};
  const payload = token ? decodeJwtPayload(token) : null;
  const role = (
    getString(source, ["role", "userRole"]) ||
    getString(payload, ["role", "userRole"]) ||
    "client"
  ).toLowerCase();
  const id =
    getString(source, ["id", "_id", "userId", "user_id", "sub"]) ||
    getString(payload, ["sub", "id", "userId", "user_id"]);
  const fullName =
    getString(source, ["fullName", "full_name", "name"]) ||
    getString(payload, ["fullName", "full_name", "name"]);

  return {
    ...source,
    id: source.id ?? source._id ?? source.userId ?? source.user_id ?? payload?.sub ?? id,
    sub: source.sub ?? source.id ?? source._id ?? source.userId ?? source.user_id ?? payload?.sub ?? id,
    role,
    fullName: source.fullName ?? source.full_name ?? source.name ?? fullName,
    full_name: source.full_name ?? source.fullName ?? source.name ?? fullName,
    email: source.email ?? payload?.email ?? "",
    phone: source.phone ?? "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      try {
        const t = getStoredAccessToken();
        const u = localStorage.getItem(LS_USER);

        if (!t) return;

        setToken(t);

        if (u) {
          setUser(normalizeUser(JSON.parse(u), t));
          return;
        }

        const profileResponse = await api.get(AUTH_ME_PATH, {
          headers: {
            Authorization: `Bearer ${t}`,
          },
        });
        if (cancelled) return;

        const nextUser = normalizeUser(profileResponse.data, t);
        setUser(nextUser);
        localStorage.setItem(LS_TOKEN, t);
        localStorage.setItem(LS_USER, JSON.stringify(nextUser));
      } catch (err) {
        console.error("Failed to load auth:", err);
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveAuth = useCallback((nextToken, nextUser) => {
    const normalizedUser = normalizeUser(nextUser, nextToken);
    setToken(nextToken);
    setUser(normalizedUser);

    localStorage.setItem(LS_TOKEN, nextToken);
    localStorage.setItem(LS_USER, JSON.stringify(normalizedUser));
  }, []);

  const hydrateAuth = useCallback((nextToken, nextUser) => {
    saveAuth(nextToken, nextUser);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(patch || {}) };
      try {
        localStorage.setItem(LS_USER, JSON.stringify(next));
      } catch {
        // Keep runtime auth state even if storage is unavailable.
      }
      return next;
    });
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const { data } = await api.post(AUTH_REGISTER_PATH, payload);
      const accessToken = extractAccessToken(data);
      const nextUser = data?.user || data?.data?.user || null;

      if (accessToken && nextUser) {
        saveAuth(accessToken, nextUser);
      }

      return {
        ...data,
        token: accessToken || data?.token || data?.accessToken,
        accessToken: accessToken || data?.accessToken || data?.token,
        user: nextUser ? normalizeUser(nextUser, accessToken) : nextUser,
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, "فشل إنشاء الحساب"));
    }
  }, [saveAuth]);

  const login = useCallback(async (payload) => {
    const email = String(payload?.email || "").trim();
    const password = String(payload?.password || "");
    if (!email || password.length < 1) {
      throw new Error("Email and password are required");
    }

    try {
      const { data } = await api.post(AUTH_LOGIN_PATH, { email, password });
      const accessToken = extractAccessToken(data);
      let nextUser = data?.user || data?.data?.user || null;

      if (!accessToken) {
        throw new Error("Authentication token was not returned by the backend.");
      }

      if (!nextUser) {
        const profileResponse = await api.get(AUTH_ME_PATH, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        nextUser = profileResponse.data;
      }

      if (!nextUser) {
        throw new Error("Signed in, but the user profile could not be loaded.");
      }

      saveAuth(accessToken, nextUser);

      return {
        ...data,
        token: accessToken,
        accessToken,
        user: normalizeUser(nextUser, accessToken),
      };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, "بيانات تسجيل الدخول غير صحيحة"));
    }
  }, [saveAuth]);

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    sessionStorage.removeItem(LS_TOKEN);
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      login,
      logout,
      register,
      updateUser,
      hydrateAuth,
    }),
    [user, token, authLoading, login, register, updateUser, hydrateAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

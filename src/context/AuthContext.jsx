import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { buildApiUrl } from "../api/axios";

const LS_TOKEN = "auth_token_v1";
const LS_USER = "auth_user_v1";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem(LS_TOKEN);
      const u = localStorage.getItem(LS_USER);

      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
      }
    } catch (err) {
      console.error("Failed to load auth:", err);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const saveAuth = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);

    localStorage.setItem(LS_TOKEN, nextToken);
    localStorage.setItem(LS_USER, JSON.stringify(nextUser));
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
    const res = await fetch(buildApiUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || "فشل إنشاء الحساب");
    }

    const accessToken = data.token || data.accessToken;
    if (accessToken && data.user) {
      saveAuth(accessToken, data.user);
    }

    return data;
  }, [saveAuth]);

  const login = useCallback(async (payload) => {
    const email = String(payload?.email || "").trim();
    const password = String(payload?.password || "");
    if (!email || password.length < 1) {
      throw new Error("Email and password are required");
    }

    const res = await fetch(buildApiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "بيانات تسجيل الدخول غير صحيحة");

    if (data.token && data.user) {
      saveAuth(data.token, data.user);
    }

    return data;
  }, [saveAuth]);

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
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

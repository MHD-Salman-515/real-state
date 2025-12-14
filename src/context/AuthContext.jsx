import { createContext, useContext, useState, useEffect, useMemo } from "react";

const API = "http://localhost:3000";

const LS_TOKEN = "auth_token_v1";
const LS_USER = "auth_user_v1";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ---------------------------
  // Load auth from localStorage
  // ---------------------------
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
      setAuthLoading(false); // ← أهم شيء
    }
  }, []);

  // ---------------------------
  // Save login/register result
  // ---------------------------
  const saveAuth = (token, user) => {
    setToken(token);
    setUser(user);

    localStorage.setItem(LS_TOKEN, token);
    localStorage.setItem(LS_USER, JSON.stringify(user));
  };

  // ---------------------------
  // Register
  // ---------------------------
  const register = async (payload) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("فشل إنشاء الحساب");

    const data = await res.json();
    saveAuth(data.token, data.user);
    return data.user;
  };

  // ---------------------------
  // Login
  // ---------------------------
  const login = async (payload) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("بيانات تسجيل الدخول غير صحيحة");

    const data = await res.json();
    saveAuth(data.token, data.user);
    return data;
  };

  // ---------------------------
  // Logout
  // ---------------------------
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
  };

  // ---------------------------
  // Context value
  // ---------------------------
  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      login,
      logout,
      register,
    }),
    [user, token, authLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!authLoading && children}
      {/* يمنع عرض صفحات فاضية */}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

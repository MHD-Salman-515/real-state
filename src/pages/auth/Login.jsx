import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import { AuthComponent } from "../../components/ui/sign-up";
import { getRoleLandingPath } from "../../utils/roleLanding.js";
import { useNotifications } from "@/components/notifications/useNotifications";
import { normalizeRoleLabel } from "@/lib/notifications/storage";

const LAST_EMAIL = "last_email_v1";

export default function Login() {
  const { login } = useAuth();
  const { notify } = useNotifications();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_EMAIL);
      if (saved) setForm((f) => ({ ...f, email: saved }));
    } catch {}
  }, []);

  const handleLogin = async ({ email, password, remember }) => {
    if (busy) return;

    const emailTrimmed = String(email || "").trim();
    const rawPassword = String(password || "");

    if (!emailTrimmed || !rawPassword) {
      setSubmitError("Email and password are required.");
      return;
    }

    setSubmitError("");
    setBusy(true);

    try {
      const { user: rawUser } = await login({
        email: emailTrimmed,
        password: rawPassword,
      });

      const u = {
        ...rawUser,
        full_name: rawUser.fullName,
        role: rawUser.role.toLowerCase(),
      };

      if (remember) localStorage.setItem(LAST_EMAIL, email);
      else localStorage.removeItem(LAST_EMAIL);

      toast.success(`Welcome ${u.full_name}!`);

      const role = normalizeRoleLabel(u.role || "Guest");
      const displayName = String(u.full_name || "").trim();

      notify({
        type: "system",
        title: displayName ? `Welcome back, ${displayName}` : "Welcome back",
        message: `Signed in as ${role}`,
      });
      notify({
        type: "system",
        title: "Session secured",
        message: "You are signed in successfully.",
      });

      const params = new URLSearchParams(loc.search);
      const next = params.get("next");
      nav(next || getRoleLandingPath(u), { replace: true });
    } catch (err) {
      const msg = err?.message || "Unable to sign in. Please check your credentials.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthComponent
      mode="login"
      brandName="CREOS"
      defaultEmail={form.email}
      defaultRemember={form.remember}
      onEmailChange={(email) => setForm((f) => ({ ...f, email }))}
      onPasswordChange={(password) => setForm((f) => ({ ...f, password }))}
      onRememberChange={(remember) => setForm((f) => ({ ...f, remember }))}
      loginLoading={busy}
      loginError={submitError}
      onLogin={handleLogin}
    />
  );
}

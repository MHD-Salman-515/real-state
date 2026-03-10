import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthComponent } from "@/components/ui/sign-up";
import Logo from "../../components/brand/Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE, postJSON } from "../../lib/api.ts";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function roleDestination(role) {
  return (
    {
      owner: "/owner",
      admin: "/admin",
      accountant: "/accountant",
      supplier: "/supplier",
      worker: "/worker",
      client: "/",
    }[String(role || "client").toLowerCase()] || "/"
  );
}

const CustomLogo = () => (
  <div className="rounded-md bg-white/10 p-1.5 text-white/90">
    <Logo className="h-4 w-4" />
  </div>
);

export default function Register() {
  const nav = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestOtp = useCallback(async (email) => {
    setError("");
    return postJSON("/api/auth/otp/request", { email: String(email || "").trim() });
  }, []);

  const verifyOtp = useCallback(async (email, code) => {
    setError("");
    return postJSON("/api/auth/otp/verify", {
      email: String(email || "").trim(),
      code: String(code || "").trim(),
    });
  }, []);

  const onRegister = useCallback(
    async (payload) => {
      setError("");

      const fullName = String(payload?.fullName || "").trim();
      const email = String(payload?.email || "").trim();
      const password = String(payload?.password || "");
      const confirmPassword = String(payload?.confirmPassword || "");
      const phone = String(payload?.phone || "").trim();
      const otpToken = String(payload?.otpToken || "").trim();

      if (!fullName) throw new Error("Full name is required.");
      if (!isValidEmail(email)) throw new Error("Enter a valid email address.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");
      if (password !== confirmPassword) throw new Error("Passwords do not match.");
      if (!otpToken) throw new Error("Verify your email code first.");

      setLoading(true);
      try {
        const data = await registerUser({
          fullName,
          email,
          phone: phone || undefined,
          password,
          otpToken,
        });

        nav(roleDestination(data?.user?.role), { replace: true });
      } catch (err) {
        const message = err?.message || "Unable to create account.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [nav, registerUser],
  );

  const onGoogle = useCallback(() => {
    window.location.href = `${API_BASE}/api/auth/oauth/google`;
  }, []);

  const onGitHub = useCallback(() => {
    window.location.href = `${API_BASE}/api/auth/oauth/github`;
  }, []);

  return (
    <>
      <AuthComponent
        brandName="CREOS"
        logo={<CustomLogo />}
        onRequestOtp={requestOtp}
        onVerifyOtp={verifyOtp}
        onRegister={onRegister}
        onGoogle={onGoogle}
        onGitHub={onGitHub}
        loading={loading}
        error={error}
      />

      <p className="pointer-events-none fixed bottom-4 left-1/2 z-30 -translate-x-1/2 text-sm text-white/80">
        Already have an account? <Link to="/auth/login" className="pointer-events-auto underline">Sign in</Link>
      </p>
    </>
  );
}

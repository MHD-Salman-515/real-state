import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Phone,
  Gem,
  AlertCircle,
  Sparkles,
} from "lucide-react";

type RegisterPayload = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  otpToken: string;
};

interface AuthComponentProps {
  logo?: React.ReactNode;
  brandName?: string;
  mode?: "register" | "login";
  onRequestOtp?: (email: string) => Promise<{ expiresAt?: string } | void>;
  onVerifyOtp?: (email: string, code: string) => Promise<{ otpToken: string }>;
  onRegister?: (payload: RegisterPayload) => Promise<unknown>;
  onGoogle?: () => void;
  onGitHub?: () => void;
  loading?: boolean;
  error?: string;
  onLogin?: (payload: { email: string; password: string; remember?: boolean }) => Promise<void> | void;
  loginLoading?: boolean;
  loginError?: string;
  defaultEmail?: string;
  onEmailChange?: (email: string) => void;
  onPasswordChange?: (password: string) => void;
  defaultRemember?: boolean;
  onRememberChange?: (remember: boolean) => void;
}

const DefaultLogo = () => (
  <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[rgba(233,193,118,0.18)] bg-[rgba(233,193,118,0.08)] text-[var(--stitch-ref-gold)]">
    <Gem className="h-5 w-5" />
  </div>
);

function AuthField({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="stitch-ref-label block">
        {label}
      </label>
      <div className="stitch-ref-input-wrap">
        {icon ? <span className="stitch-ref-input-icon">{icon}</span> : null}
        {children}
      </div>
    </div>
  );
}

function AuthAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-md border border-[rgba(255,180,171,0.35)] bg-[rgba(147,0,10,0.18)] px-4 py-3 text-sm text-[#ffdad6]">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export const AuthComponent = ({
  logo = <DefaultLogo />,
  brandName = "CREOS",
  mode = "register",
  onRequestOtp,
  onVerifyOtp,
  onRegister,
  onGoogle,
  onGitHub,
  loading = false,
  error = "",
  onLogin,
  loginLoading = false,
  loginError = "",
  defaultEmail = "",
  onEmailChange,
  onPasswordChange,
  defaultRemember = true,
  onRememberChange,
}: AuthComponentProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState(defaultEmail);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRemember, setLoginRemember] = useState(defaultRemember);
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authStep, setAuthStep] = useState<"email" | "otp" | "details">("email");
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const otpInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLoginEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    setLoginRemember(defaultRemember);
  }, [defaultRemember]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (authStep !== "otp") return;
    const timer = window.setTimeout(() => otpInputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [authStep]);

  const mergedRegisterError = localError || error;
  const isEmailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const isOtpValid = useMemo(() => /^\d{6}$/.test(otpCode), [otpCode]);
  const canSubmitRegister = useMemo(() => {
    return (
      fullName.trim().length > 1 &&
      password.length >= 6 &&
      confirmPassword.length >= 6 &&
      otpToken.length > 0 &&
      !loading
    );
  }, [confirmPassword.length, fullName, loading, otpToken.length, password.length]);

  const handleEmailInput = useCallback((next: string) => {
    setEmail(next);
    setOtpCode("");
    setOtpToken("");
    setLocalError("");
    setResendCooldown(0);
  }, []);

  const handleSendOtp = useCallback(async () => {
    setLocalError("");
    if (!isEmailValid) {
      setLocalError(t("Enter a valid email address before requesting OTP."));
      return;
    }
    try {
      setRequestingOtp(true);
      await onRequestOtp?.(email.trim());
      setAuthStep("otp");
      setResendCooldown(30);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t("Failed to send OTP."));
    } finally {
      setRequestingOtp(false);
    }
  }, [email, isEmailValid, onRequestOtp, t]);

  const handleVerifyOtp = useCallback(async () => {
    setLocalError("");
    if (!isOtpValid) {
      setLocalError(t("Enter the 6-digit verification code."));
      return;
    }
    try {
      setVerifyingOtp(true);
      const data = await onVerifyOtp?.(email.trim(), otpCode.trim());
      if (!data?.otpToken) throw new Error(t("Verification token was not returned."));
      setOtpToken(data.otpToken);
      setAuthStep("details");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t("OTP verification failed."));
    } finally {
      setVerifyingOtp(false);
    }
  }, [email, isOtpValid, onVerifyOtp, otpCode, t]);

  const handleRegisterSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setLocalError("");

      if (password !== confirmPassword) {
        setLocalError(t("Passwords do not match."));
        return;
      }
      if (!otpToken) {
        setLocalError(t("Please verify OTP first."));
        return;
      }

      try {
        await onRegister?.({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          confirmPassword,
          otpToken,
        });
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : t("Registration failed."));
      }
    },
    [confirmPassword, email, fullName, onRegister, otpToken, password, phone, t],
  );

  const handleLoginSubmit = useCallback(async () => {
    await onLogin?.({
      email: loginEmail,
      password: loginPassword,
      remember: loginRemember,
    });
  }, [loginEmail, loginPassword, loginRemember, onLogin]);

  if (mode === "login") {
    return (
      <div dir={i18n.dir()} className="stitch-ref-auth-login min-h-screen overflow-hidden">
        <div className="stitch-ref-auth-login-bg" />
        <div className="stitch-ref-auth-login-overlay" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-12">
          <div className="stitch-ref-login-panel w-full max-w-[600px]">
            <div className="mb-10 text-center">
              <div className="mb-6 inline-flex items-center justify-center">{logo}</div>
              <h1 className="stitch-ref-brand text-6xl leading-none">{brandName}</h1>
              <p className="stitch-ref-mono mt-4 text-sm uppercase tracking-[0.38em] text-[rgba(154,143,128,0.92)]">
                {t("Refined Sanctuary Intelligence")}
              </p>
            </div>

            <AuthAlert message={loginError} />

            <div className="mt-8 space-y-7">
              <AuthField id="signin-email" label={t("Email")} icon={<Mail className="h-5 w-5" />}>
                <input
                  id="signin-email"
                  type="email"
                  value={loginEmail}
                  autoComplete="email"
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    onEmailChange?.(e.target.value);
                  }}
                  placeholder={t("name@creos.com")}
                  className="stitch-ref-input"
                />
              </AuthField>

              <AuthField id="signin-password" label={t("Password")} icon={<Lock className="h-5 w-5" />}>
                <input
                  id="signin-password"
                  type={loginShowPassword ? "text" : "password"}
                  value={loginPassword}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    onPasswordChange?.(e.target.value);
                  }}
                  placeholder={t("Password mask")}
                  className="stitch-ref-input pe-14"
                />
                <button
                  type="button"
                  className="stitch-ref-input-action"
                  onClick={() => setLoginShowPassword((value) => !value)}
                  aria-label={t(loginShowPassword ? "Hide password" : "Show password")}
                >
                  {loginShowPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </AuthField>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-3 text-sm text-[rgba(225,226,231,0.82)]">
                <input
                  type="checkbox"
                  checked={loginRemember}
                  onChange={(e) => {
                    setLoginRemember(e.target.checked);
                    onRememberChange?.(e.target.checked);
                  }}
                  className="h-4 w-4 rounded-none border border-[rgba(154,143,128,0.35)] bg-transparent text-[var(--stitch-ref-gold)] focus:ring-0"
                />
                {t("Remember me")}
              </label>
              <span className="text-sm text-[var(--stitch-ref-gold)]">{t("Forgot password?")}</span>
            </div>

            <button
              type="button"
              onClick={handleLoginSubmit}
              disabled={loginLoading}
              className="stitch-ref-button-primary mt-8 w-full"
            >
              {loginLoading ? t("Signing in...") : t("Sign in")}
            </button>

            <div className="my-10 flex items-center gap-4 text-[rgba(154,143,128,0.45)]">
              <span className="h-px flex-1 bg-[rgba(154,143,128,0.16)]" />
              <span className="stitch-ref-mono text-xs">{t("or")}</span>
              <span className="h-px flex-1 bg-[rgba(154,143,128,0.16)]" />
            </div>

            <Link to="/auth/register" className="stitch-ref-button-secondary w-full text-center">
              {t("Create account")}
            </Link>

            <p className="mt-12 text-center text-sm text-[rgba(225,226,231,0.74)]">
              {t("By signing in you agree to our")}{" "}
              <span className="underline">{t("Terms of Service")}</span>{" "}
              {t("and")}{" "}
              <span className="underline">{t("Privacy Policy")}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={i18n.dir()} className="stitch-ref-register-shell min-h-screen bg-[#121418] text-[#e2e2e7]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        <aside className="stitch-ref-register-visual relative hidden overflow-hidden lg:flex">
          <img
            src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,20,24,0.12),rgba(18,20,24,0.2),rgba(18,20,24,0.72))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(233,193,118,0.08),transparent_38%)]" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between p-16">
            <div className="max-w-md space-y-5 rounded-xl border border-[rgba(233,193,118,0.1)] bg-[rgba(22,28,54,0.78)] p-8 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[rgba(233,193,118,0.22)] bg-[rgba(233,193,118,0.08)] text-[var(--stitch-ref-gold)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="stitch-ref-title-sm text-[var(--stitch-ref-gold)]">{t("Security and Trust")}</h3>
                  <p className="mt-2 text-base leading-7 text-[rgba(226,226,231,0.82)]">
                    {t("Advanced encryption protects your digital assets and real estate decisions.")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[rgba(233,193,118,0.22)] bg-[rgba(233,193,118,0.08)] text-[var(--stitch-ref-gold)]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="stitch-ref-title-sm text-[var(--stitch-ref-gold)]">{t("Smart Insights")}</h3>
                  <p className="mt-2 text-base leading-7 text-[rgba(226,226,231,0.82)]">
                    {t("Accurate signals and AI guidance help you act with confidence.")}
                  </p>
                </div>
              </div>
            </div>

            <p className="stitch-ref-mono text-xl text-[rgba(226,226,231,0.92)]">
              <span className="text-[var(--stitch-ref-gold)]">●</span> {t("More than 5000 investors trust CREOS")}
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-16">
          <div className="w-full max-w-[600px]">
            <div className="mb-10">
              <div className="mb-5 flex items-center gap-4">
                {logo}
                <div>
                  <h1 className="stitch-ref-brand text-5xl leading-none">{brandName}</h1>
                </div>
              </div>
              <h2 className="stitch-ref-title text-4xl">{t("Create account")}</h2>
              <p className="mt-4 text-xl leading-8 text-[rgba(226,226,231,0.78)]">
                {t("Join the future of intelligent real estate investments.")}
              </p>
            </div>

            <div className="mb-8 flex flex-wrap gap-3">
              <span className={`stitch-ref-step ${authStep === "email" ? "stitch-ref-step-active" : ""}`}>{t("Email")}</span>
              <span className={`stitch-ref-step ${authStep === "otp" ? "stitch-ref-step-active" : ""}`}>{t("OTP")}</span>
              <span className={`stitch-ref-step ${authStep === "details" ? "stitch-ref-step-active" : ""}`}>{t("Profile")}</span>
            </div>

            <AuthAlert message={mergedRegisterError} />

            <form className="mt-8 space-y-7" onSubmit={handleRegisterSubmit}>
              {authStep === "email" ? (
                <>
                  <AuthField id="register-email" label={t("Email")} icon={<Mail className="h-5 w-5" />}>
                    <input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailInput(e.target.value)}
                      placeholder={t("example@creos.com")}
                      className="stitch-ref-input"
                    />
                  </AuthField>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={!isEmailValid || requestingOtp}
                      className="stitch-ref-button-primary w-full"
                    >
                      {requestingOtp ? t("Sending OTP...") : t("Send OTP")}
                    </button>
                  </div>
                </>
              ) : null}

              {authStep === "otp" ? (
                <>
                  <AuthField id="register-otp" label={t("Enter OTP Code")} icon={<ShieldCheck className="h-5 w-5" />}>
                    <input
                      id="register-otp"
                      ref={otpInputRef}
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder={t("6 digits")}
                      className="stitch-ref-input stitch-ref-mono tracking-[0.28em]"
                    />
                  </AuthField>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={!isOtpValid || verifyingOtp}
                      className="stitch-ref-button-primary w-full"
                    >
                      {verifyingOtp ? t("Verifying...") : t("Verify OTP")}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={requestingOtp || resendCooldown > 0}
                      className="stitch-ref-button-secondary w-full"
                    >
                      {resendCooldown > 0 ? `${t("Resend OTP")} (${resendCooldown}s)` : t("Resend OTP")}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAuthStep("email")}
                    className="inline-flex items-center gap-2 text-sm text-[var(--stitch-ref-gold)]"
                  >
                    <ArrowRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
                    {t("Back")}
                  </button>
                </>
              ) : null}

              {authStep === "details" ? (
                <>
                  <AuthField id="register-name" label={t("Full Name")} icon={<User className="h-5 w-5" />}>
                    <input
                      id="register-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t("Enter your full name")}
                      className="stitch-ref-input"
                    />
                  </AuthField>

                  <AuthField id="register-email-readonly" label={t("Email")} icon={<Mail className="h-5 w-5" />}>
                    <input
                      id="register-email-readonly"
                      type="email"
                      value={email}
                      readOnly
                      className="stitch-ref-input opacity-80"
                    />
                  </AuthField>

                  <AuthField id="register-phone" label={t("Phone")} icon={<Phone className="h-5 w-5" />}>
                    <input
                      id="register-phone"
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("+966 50 000 0000")}
                      className="stitch-ref-input text-left"
                    />
                  </AuthField>

                  <AuthField id="register-password" label={t("Password")} icon={<Lock className="h-5 w-5" />}>
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("Password mask")}
                      className="stitch-ref-input pe-14"
                    />
                    <button
                      type="button"
                      className="stitch-ref-input-action"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={t(showPassword ? "Hide password" : "Show password")}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </AuthField>

                  <AuthField id="register-confirm-password" label={t("Confirm Password")} icon={<Lock className="h-5 w-5" />}>
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("Password mask")}
                      className="stitch-ref-input pe-14"
                    />
                    <button
                      type="button"
                      className="stitch-ref-input-action"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={t(showConfirmPassword ? "Hide password" : "Show password")}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </AuthField>

                  <label className="flex items-center gap-3 text-sm text-[rgba(226,226,231,0.78)]">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="h-5 w-5 rounded-none border border-[rgba(154,143,128,0.35)] bg-transparent text-[var(--stitch-ref-gold)] focus:ring-0"
                    />
                    <span>
                      {t("I agree to")}{" "}
                      <span className="text-[var(--stitch-ref-gold)]">{t("Terms of Service")}</span>{" "}
                      {t("and")}{" "}
                      <span className="text-[var(--stitch-ref-gold)]">{t("Privacy Policy")}</span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={!canSubmitRegister}
                    className="stitch-ref-button-primary w-full disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {loading ? t("Creating...") : t("Create account")}
                  </button>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setAuthStep("otp")}
                      className="inline-flex items-center gap-2 text-sm text-[var(--stitch-ref-gold)]"
                    >
                      <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
                      {t("Back")}
                    </button>

                    {(onGoogle || onGitHub) ? (
                      <div className="flex flex-wrap gap-2">
                        {onGoogle ? (
                          <button type="button" onClick={onGoogle} className="stitch-ref-button-secondary !px-5 !py-3 text-sm">
                            {t("Continue with Google")}
                          </button>
                        ) : null}
                        {onGitHub ? (
                          <button type="button" onClick={onGitHub} className="stitch-ref-button-secondary !px-5 !py-3 text-sm">
                            {t("Continue with GitHub")}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

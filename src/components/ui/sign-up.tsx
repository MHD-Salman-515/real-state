import { cn } from "@/lib/utils";
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  Children,
  memo,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ArrowRight,
  Mail,
  Gem,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  X,
  AlertCircle,
  PartyPopper,
  Loader,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
const IS_DEV = import.meta.env.DEV;
const AUTH_PERF_LABEL = "[AuthPerf]";

function useRenderCount(label: string) {
  const rendersRef = useRef(0);
  rendersRef.current += 1;

  useEffect(() => {
    if (!IS_DEV) return;
    // Lightweight dev-only render diagnostics.
    console.debug(`${AUTH_PERF_LABEL} ${label} render#${rendersRef.current}`);
  });
}

function perfStart(label: string) {
  if (!IS_DEV) return;
  console.time(`${AUTH_PERF_LABEL} ${label}`);
}

function perfEnd(label: string) {
  if (!IS_DEV) return;
  console.timeEnd(`${AUTH_PERF_LABEL} ${label}`);
}

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

const SIGN_UP_STYLES = `
  @property --glass-angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 130deg;
  }

  .glass-button-wrap {
    position: relative;
    --glass-angle: 130deg;
  }

  .glass-button {
    appearance: none;
    border: 1px solid rgba(212,175,55,0.28);
    background:
      linear-gradient(180deg, rgba(242,202,80,0.98), rgba(212,175,55,0.96)),
      linear-gradient(var(--glass-angle), rgba(255,224,136,0.35), rgba(212,175,55,0.08));
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.28),
      inset 0 -1px 0 rgba(60,47,0,0.08),
      0 16px 34px rgba(0,0,0,0.28);
    color: #3c2f00;
    transform: translateY(0);
  }

  .glass-button:hover {
    --glass-angle: 220deg;
    border-color: rgba(242,202,80,0.38);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.32),
      inset 0 -1px 0 rgba(60,47,0,0.12),
      0 18px 38px rgba(0,0,0,0.3);
  }

  .glass-button:active {
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.22),
      inset 0 -1px 0 rgba(60,47,0,0.14),
      0 4px 16px rgba(0,0,0,0.2);
  }

  .glass-button-shadow {
    position: absolute;
    inset: 0;
    transform: translateY(10px) scale(0.98);
    filter: blur(18px);
    background: radial-gradient(70% 80% at 50% 20%, rgba(212,175,55,0.28), rgba(0,0,0,0));
    z-index: 0;
  }

  .glass-input-wrap {
    position: relative;
  }

  .glass-input {
    width: 100%;
    border-radius: 1.25rem;
    border: 1px solid rgba(255,255,255,0.12);
    background:
      linear-gradient(180deg, rgba(40,42,43,0.9), rgba(29,32,33,0.84)),
      linear-gradient(135deg, rgba(212,175,55,0.05), rgba(10,17,40,0.18));
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.18);
    color: #e1e3e4;
    outline: none;
    backdrop-filter: blur(20px) saturate(130%);
    -webkit-backdrop-filter: blur(20px) saturate(130%);
  }

  .glass-input::placeholder {
    color: rgba(225,227,228,0.46);
  }

  .glass-input:focus {
    border-color: rgba(212,175,55,0.56);
    box-shadow:
      0 0 0 1px rgba(212,175,55,0.26),
      0 0 0 4px rgba(212,175,55,0.12),
      inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .glass-input:-webkit-autofill,
  .glass-input:-webkit-autofill:hover,
  .glass-input:-webkit-autofill:focus,
  .glass-input:-webkit-autofill:active {
    -webkit-text-fill-color: hsl(var(--foreground));
    -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.07) inset;
  }

  .social-button {
    border-radius: 1rem;
    border: 1px solid rgba(255,255,255,0.1);
    background: linear-gradient(180deg, rgba(40,42,43,0.76), rgba(29,32,33,0.7));
    color: #e1e3e4;
    backdrop-filter: blur(14px);
  }

  .social-button:hover {
    background: linear-gradient(180deg, rgba(50,53,54,0.84), rgba(29,32,33,0.78));
    border-color: rgba(212,175,55,0.22);
  }
`;

type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
};

function TextLoop({
  children,
  className,
}: TextLoopProps) {
  const items = Children.toArray(children);

  return (
    <div className={cn("relative inline-block whitespace-nowrap", className)}>
      <div>{items[0]}</div>
    </div>
  );
}

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  yOffset?: number;
  disabled?: boolean;
}

function BlurFade({ children, className, duration = 0.4, delay = 0, yOffset = 6, disabled = false }: BlurFadeProps) {
  void duration;
  void delay;
  void yOffset;
  void disabled;
  return <div className={className}>{children}</div>;
}

const glassButtonVariants = cva("relative isolate all-unset cursor-pointer rounded-full", {
  variants: {
    size: {
      default: "text-base font-medium",
      sm: "text-sm font-medium",
      lg: "text-lg font-medium",
      icon: "h-10 w-10",
    },
  },
  defaultVariants: { size: "default" },
});

const glassButtonTextVariants = cva("glass-button-text relative block select-none tracking-tighter", {
  variants: {
    size: {
      default: "px-6 py-3.5",
      sm: "px-4 py-2",
      lg: "px-8 py-4",
      icon: "flex h-10 w-10 items-center justify-center",
    },
  },
  defaultVariants: { size: "default" },
});

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof glassButtonVariants> {
  contentClassName?: string;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, contentClassName, onClick, ...props }, ref) => {
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const button = e.currentTarget.querySelector("button");
      if (button && e.target !== button) button.click();
    };

    return (
      <div className={cn("glass-button-wrap relative cursor-pointer rounded-full", className)} onClick={handleWrapperClick}>
        <button className={cn("glass-button relative z-10", glassButtonVariants({ size }))} ref={ref} onClick={onClick} {...props}>
          <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>{children}</span>
        </button>
        <div className="glass-button-shadow pointer-events-none rounded-full" />
      </div>
    );
  },
);
GlassButton.displayName = "GlassButton";

const GradientBackground = memo(function GradientBackground() {
  return (
    <>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="absolute left-0 top-0 h-full w-full"
      >
        <defs>
          <linearGradient id="rev_grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: "#d4d4d8", stopOpacity: 0.2 }} />
          </linearGradient>
          <linearGradient id="rev_grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#fafafa", stopOpacity: 0.28 }} />
            <stop offset="50%" style={{ stopColor: "#e4e4e7", stopOpacity: 0.22 }} />
            <stop offset="100%" style={{ stopColor: "#a1a1aa", stopOpacity: 0.18 }} />
          </linearGradient>
          <radialGradient id="rev_grad3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 0.26 }} />
            <stop offset="100%" style={{ stopColor: "#71717a", stopOpacity: 0.16 }} />
          </radialGradient>
          <filter id="rev_blur1" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="35" />
          </filter>
          <filter id="rev_blur2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="25" />
          </filter>
          <filter id="rev_blur3" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="45" />
          </filter>
        </defs>
        <g>
          <ellipse cx="200" cy="500" rx="250" ry="180" fill="url(#rev_grad1)" filter="url(#rev_blur1)" transform="rotate(-30 200 500)" />
          <rect x="500" y="100" width="300" height="250" rx="80" fill="url(#rev_grad2)" filter="url(#rev_blur2)" transform="rotate(15 650 225)" />
        </g>
        <g>
          <circle cx="650" cy="450" r="150" fill="url(#rev_grad3)" filter="url(#rev_blur3)" opacity="0.7" />
          <ellipse cx="50" cy="150" rx="180" ry="120" fill="#ffffff" filter="url(#rev_blur2)" opacity="0.2" />
        </g>
      </svg>
    </>
  );
});

const AuthBackground = memo(function AuthBackground({ lowPerfMode }: { lowPerfMode: boolean }) {
  if (lowPerfMode) {
    return (
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(90% 60% at 15% 0%, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0) 58%), radial-gradient(70% 60% at 90% 15%, rgba(191,197,228,0.12) 0%, rgba(191,197,228,0) 64%), linear-gradient(135deg, rgba(10,17,40,0.96), rgba(17,20,21,0.98) 52%, rgba(11,15,16,1))",
        }}
      />
    );
  }
  return (
    <div className="absolute inset-0 z-0">
      <GradientBackground />
    </div>
  );
});

const HeaderBrand = memo(function HeaderBrand({
  logo,
  brandName,
}: {
  logo: React.ReactNode;
  brandName: string;
}) {
  return (
    <div className={cn("fixed left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.58)] px-4 py-2 backdrop-blur-glass", "md:left-1/2 md:-translate-x-1/2")}>
      {logo}
      <h1 className="text-base font-bold text-[color:var(--creos-text)]">{brandName}</h1>
    </div>
  );
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-6 w-6">
    <g fillRule="evenodd" fill="none">
      <g fillRule="nonzero" transform="translate(3, 2)">
        <path fill="#4285F4" d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267" />
        <path fill="#34A853" d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667" />
        <path fill="#FBBC05" d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782" />
        <path fill="#EB4335" d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769" />
      </g>
    </g>
  </svg>
);

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="h-6 w-6">
    <path
      fill="currentColor"
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
    />
  </svg>
);

const DefaultLogo = () => (
  <div className="rounded-md bg-white/10 p-1.5 text-white">
    <Gem className="h-4 w-4" />
  </div>
);

type RegisterStepContentProps = {
  authStep: "email" | "otp" | "details";
  lowPerfMode: boolean;
  email: string;
  handleEmailChange: (next: string) => void;
  isEmailValid: boolean;
  requestingOtp: boolean;
  handleSendOtp: () => Promise<void>;
  otpInputDraft: string;
  setOtpInputDraft: React.Dispatch<React.SetStateAction<string>>;
  setOtpCode: React.Dispatch<React.SetStateAction<string>>;
  otpInputRef: React.RefObject<HTMLInputElement | null>;
  isOtpValid: boolean;
  verifyingOtp: boolean;
  handleVerifyOtp: () => Promise<void>;
  resendCooldown: number;
  handleResendOtp: () => Promise<void>;
  handleGoBack: () => void;
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  passwordInputRef: React.RefObject<HTMLInputElement | null>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPasswordInputRef: React.RefObject<HTMLInputElement | null>;
  canSubmit: boolean;
  loading: boolean;
};

const RegisterStepContent = memo(function RegisterStepContent({
  authStep,
  lowPerfMode,
  email,
  handleEmailChange,
  isEmailValid,
  requestingOtp,
  handleSendOtp,
  otpInputDraft,
  setOtpInputDraft,
  setOtpCode,
  otpInputRef,
  isOtpValid,
  verifyingOtp,
  handleVerifyOtp,
  resendCooldown,
  handleResendOtp,
  handleGoBack,
  fullName,
  setFullName,
  phone,
  setPhone,
  showPassword,
  setShowPassword,
  password,
  setPassword,
  passwordInputRef,
  showConfirmPassword,
  setShowConfirmPassword,
  confirmPassword,
  setConfirmPassword,
  confirmPasswordInputRef,
  canSubmit,
  loading,
}: RegisterStepContentProps) {
  void lowPerfMode;
  const { t } = useTranslation();
  const renderStep = () => {
    if (authStep === "email") {
      return (
        <div key="email-step" className="space-y-3">
          <label className="text-xs font-medium uppercase tracking-wide text-[color:rgb(var(--creos-text-rgb)/0.8)]" htmlFor="signup-email">
            {t("Email")}
          </label>
          <div className="glass-input-wrap">
            <Mail className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[color:rgb(var(--creos-text-rgb)/0.66)]" style={{ insetInlineStart: "1rem" }} />
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              autoComplete="email"
              placeholder={t("name@example.com")}
              className="glass-input py-3 text-sm"
              style={{ paddingInlineStart: "2.75rem", paddingInlineEnd: "1rem" }}
            />
          </div>
          <GlassButton type="button" onClick={handleSendOtp} className="w-full" disabled={!isEmailValid || requestingOtp}>
            <span className="inline-flex items-center gap-2">
              {requestingOtp ? t("Sending OTP...") : t("Send OTP")}
              <ArrowRight className="h-4 w-4" />
            </span>
          </GlassButton>
        </div>
      );
    }

    if (authStep === "otp") {
      return (
        <div key="otp-step" className="space-y-3">
          <label className="text-xs font-medium uppercase tracking-wide text-[color:rgb(var(--creos-text-rgb)/0.8)]" htmlFor="signup-otp">
            {t("Enter OTP Code")}
          </label>
          <div className="glass-input-wrap">
            <ShieldCheck className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[color:rgb(var(--creos-text-rgb)/0.66)]" style={{ insetInlineStart: "1rem" }} />
            <input
              id="signup-otp"
              ref={otpInputRef}
              inputMode="numeric"
              value={otpInputDraft}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtpInputDraft(next);
                setOtpCode(next);
              }}
              placeholder={t("6 digits")}
              className="glass-input py-3 text-sm tracking-[0.35em]"
              style={{ paddingInlineStart: "2.75rem", paddingInlineEnd: "1rem" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <GlassButton type="button" onClick={handleVerifyOtp} disabled={!isOtpValid || verifyingOtp} className="w-full">
              {verifyingOtp ? t("Verifying...") : t("Verify OTP")}
            </GlassButton>
            <GlassButton type="button" onClick={handleResendOtp} disabled={resendCooldown > 0 || requestingOtp} className="w-full">
              {resendCooldown > 0 ? `${t("Resend OTP")} (${resendCooldown}s)` : t("Resend OTP")}
            </GlassButton>
          </div>

          <GlassButton type="button" size="sm" onClick={handleGoBack} className="w-full">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("Back")}
            </span>
          </GlassButton>
        </div>
      );
    }

    return (
      <div key="details-step" className="space-y-3">
        <label className="text-xs font-medium uppercase tracking-wide text-[color:rgb(var(--creos-text-rgb)/0.8)]" htmlFor="signup-name">
          {t("Full Name")}
        </label>
        <input
          id="signup-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="glass-input py-3 px-4 text-sm"
          placeholder={t("Example: Alex Morgan")}
        />

        <label className="text-xs font-medium uppercase tracking-wide text-[color:rgb(var(--creos-text-rgb)/0.8)]" htmlFor="signup-phone">
          {t("Phone (Optional)")}
        </label>
        <input
          id="signup-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="glass-input py-3 px-4 text-sm"
          placeholder={t("Phone example")}
        />

        <label className="text-xs font-medium uppercase tracking-wide text-[color:rgb(var(--creos-text-rgb)/0.8)]" htmlFor="signup-password">
          {t("Password")}
        </label>
        <div className="glass-input-wrap">
          <Lock className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[color:rgb(var(--creos-text-rgb)/0.66)]" style={{ insetInlineStart: "1rem" }} />
          <input
            id="signup-password"
            ref={passwordInputRef}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder={t("Password")}
            className="glass-input py-3 text-sm"
            style={{ paddingInlineStart: "2.75rem", paddingInlineEnd: "2.75rem" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 -translate-y-1/2 text-[color:rgb(var(--creos-text-rgb)/0.72)] hover:text-[color:var(--creos-text)]"
            style={{ insetInlineEnd: "0.75rem" }}
            aria-label={t(showPassword ? "Hide password" : "Show password")}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <label className="text-xs font-medium uppercase tracking-wide text-[color:rgb(var(--creos-text-rgb)/0.8)]" htmlFor="signup-confirm-password">
          {t("Confirm Password")}
        </label>
        <div className="glass-input-wrap">
          <Lock className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[color:rgb(var(--creos-text-rgb)/0.66)]" style={{ insetInlineStart: "1rem" }} />
          <input
            id="signup-confirm-password"
            ref={confirmPasswordInputRef}
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder={t("Confirm Password")}
            className="glass-input py-3 text-sm"
            style={{ paddingInlineStart: "2.75rem", paddingInlineEnd: "2.75rem" }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute top-1/2 -translate-y-1/2 text-[color:rgb(var(--creos-text-rgb)/0.72)] hover:text-[color:var(--creos-text)]"
            style={{ insetInlineEnd: "0.75rem" }}
            aria-label={t(showConfirmPassword ? "Hide password" : "Show password")}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex gap-2">
          <GlassButton type="button" size="sm" onClick={handleGoBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </GlassButton>
          <GlassButton type="submit" className="w-full" disabled={!canSubmit}>
            <span className="inline-flex items-center gap-2">
              {loading ? t("Creating...") : t("Create account")}
              <ArrowRight className="h-4 w-4" />
            </span>
          </GlassButton>
        </div>
      </div>
    );
  };
  return renderStep();
});

type AuthModalProps = {
  modalStatus: "closed" | "loading" | "error" | "success";
  closeModal: () => void;
  mergedError: string;
  lowPerfMode: boolean;
};

const AuthModal = memo(function AuthModal({ modalStatus, closeModal, mergedError, lowPerfMode }: AuthModalProps) {
  if (modalStatus === "closed") return null;
  void lowPerfMode;
  const { t } = useTranslation();
  const modalSteps = [
    { message: t("Creating your account..."), icon: <Loader className="h-12 w-12 text-white/80" /> },
    { message: t("Welcome Aboard!"), icon: <PartyPopper className="h-12 w-12 text-white/80" /> },
  ];

  const loadingNode = (
    <div key="loading" className="flex flex-col items-center gap-4">
      {modalSteps[0].icon}
      <p className="text-lg font-medium text-foreground">{modalSteps[0].message}</p>
    </div>
  );

  const content = (
    <div className="relative mx-2 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border-4 border-border bg-card/80 p-8">
      {(modalStatus === "error" || modalStatus === "success") && (
        <button onClick={closeModal} className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      )}

      {modalStatus === "loading" && <TextLoop>{[loadingNode]}</TextLoop>}

      {modalStatus === "success" && (
        <div className="flex flex-col items-center gap-4">
          {modalSteps[1].icon}
          <p className="text-lg font-medium text-foreground">{modalSteps[1].message}</p>
        </div>
      )}

      {modalStatus === "error" && (
        <>
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-center text-lg font-medium text-foreground">{mergedError || t("Registration failed.")}</p>
          <GlassButton onClick={closeModal} size="sm" className="mt-2">
            {t("Close")}
          </GlassButton>
        </>
      )}
    </div>
  );

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">{content}</div>;
});

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
  useRenderCount(`AuthComponent:${mode}`);
  const { t } = useTranslation();
  const renderSeq = useRef(0);
  renderSeq.current += 1;
  const renderLabel = `AuthComponent:${mode}:render#${renderSeq.current}`;
  perfStart(renderLabel);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpInputDraft, setOtpInputDraft] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authStep, setAuthStep] = useState<"email" | "otp" | "details">("email");
  const [modalStatus, setModalStatus] = useState<"closed" | "loading" | "error" | "success">("closed");
  const [localError, setLocalError] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  const lowPerfMode = true;
  const blurCardClass = "backdrop-blur-sm";
  const blurFadeDisabled = true;

  const mergedError = localError || error;
  const [loginEmail, setLoginEmail] = useState(defaultEmail);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRemember, setLoginRemember] = useState(defaultRemember);
  const [loginShowPassword, setLoginShowPassword] = useState(false);

  useEffect(() => {
    setLoginEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    setLoginRemember(defaultRemember);
  }, [defaultRemember]);

  const isEmailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const isOtpValid = useMemo(() => /^\d{6}$/.test(otpCode), [otpCode]);
  const isPasswordValid = useMemo(() => password.length >= 6, [password]);
  const isConfirmPasswordValid = useMemo(() => confirmPassword.length >= 6, [confirmPassword]);
  const canSubmit = useMemo(
    () => fullName.trim().length > 1 && isPasswordValid && isConfirmPasswordValid && otpToken.length > 0 && !loading,
    [fullName, isPasswordValid, isConfirmPasswordValid, otpToken, loading],
  );
  useEffect(() => {
    perfEnd(renderLabel);
  });

  useEffect(() => {
    if (!IS_DEV) return;
    console.debug(`${AUTH_PERF_LABEL} mode=${mode} lowPerf=${String(lowPerfMode)}`);
  }, [mode, lowPerfMode]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (authStep === "otp") timer = setTimeout(() => otpInputRef.current?.focus(), lowPerfMode ? 0 : 180);
    if (authStep === "details") timer = setTimeout(() => passwordInputRef.current?.focus(), lowPerfMode ? 0 : 180);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [authStep, lowPerfMode]);

  const handleSendOtp = useCallback(async () => {
    perfStart("handleSendOtp");
    setLocalError("");
    if (!isEmailValid) {
      setLocalError(t("Enter a valid email address before requesting OTP."));
      perfEnd("handleSendOtp");
      return;
    }

    try {
      setRequestingOtp(true);
      await (onRequestOtp as NonNullable<AuthComponentProps["onRequestOtp"]>)(email.trim());
      setAuthStep("otp");
      setResendCooldown(30);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t("Failed to send OTP."));
    } finally {
      setRequestingOtp(false);
      perfEnd("handleSendOtp");
    }
  }, [email, isEmailValid, onRequestOtp]);

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0 || requestingOtp) return;
    await handleSendOtp();
  }, [handleSendOtp, resendCooldown, requestingOtp]);

  const handleVerifyOtp = useCallback(async () => {
    perfStart("handleVerifyOtp");
    setLocalError("");

    if (!isOtpValid) {
      setLocalError(t("Enter the 6-digit verification code."));
      perfEnd("handleVerifyOtp");
      return;
    }

    try {
      setVerifyingOtp(true);
      const data = await (onVerifyOtp as NonNullable<AuthComponentProps["onVerifyOtp"]>)(email.trim(), otpCode.trim());
      if (!data?.otpToken) {
        throw new Error(t("Verification token was not returned."));
      }
      setOtpToken(data.otpToken);
      setAuthStep("details");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t("OTP verification failed."));
    } finally {
      setVerifyingOtp(false);
      perfEnd("handleVerifyOtp");
    }
  }, [email, isOtpValid, onVerifyOtp, otpCode]);

  const handleFinalSubmit = useCallback(
    async (e: React.FormEvent) => {
      perfStart("handleFinalSubmit");
      e.preventDefault();
      setLocalError("");

      if (password !== confirmPassword) {
        setLocalError(t("Passwords do not match."));
        perfEnd("handleFinalSubmit");
        return;
      }

      if (!otpToken) {
        setLocalError(t("Please verify OTP first."));
        perfEnd("handleFinalSubmit");
        return;
      }

      try {
        setModalStatus("loading");
        await (onRegister as NonNullable<AuthComponentProps["onRegister"]>)({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          confirmPassword,
          otpToken,
        });
        setModalStatus("success");
      } catch (err) {
        setModalStatus("error");
        setLocalError(err instanceof Error ? err.message : t("Registration failed."));
      } finally {
        perfEnd("handleFinalSubmit");
      }
    },
    [confirmPassword, email, fullName, onRegister, otpToken, password, phone],
  );

  const handleGoBack = useCallback(() => {
    if (authStep === "details") {
      setAuthStep("otp");
    } else if (authStep === "otp") {
      setAuthStep("email");
      setOtpCode("");
      setOtpInputDraft("");
      setOtpToken("");
    }
  }, [authStep]);

  const handleEmailChange = useCallback((next: string) => {
    setEmail(next);
    setOtpCode("");
    setOtpInputDraft("");
    setOtpToken("");
    setResendCooldown(0);
  }, []);

  const closeModal = useCallback(() => {
    setModalStatus("closed");
  }, []);

  const handleLoginSubmit = useCallback(async () => {
    perfStart("handleLoginSubmit");
    try {
      await onLogin?.({
        email: loginEmail,
        password: loginPassword,
        remember: loginRemember,
      });
    } finally {
      perfEnd("handleLoginSubmit");
    }
  }, [onLogin, loginEmail, loginPassword, loginRemember]);

  if (mode === "login") {
    return (
      <div className="auth-shell flex min-h-screen w-screen flex-col">
        <style>{SIGN_UP_STYLES}</style>

        <HeaderBrand logo={logo} brandName={brandName} />

        <div className="relative flex h-full w-full flex-1 items-center justify-center overflow-hidden">
          <AuthBackground lowPerfMode={lowPerfMode} />

          <fieldset
            disabled={loginLoading}
            className={cn("auth-panel relative z-10 flex w-[min(100%,28rem)] flex-col items-center gap-6", blurCardClass)}
          >
            <BlurFade className="w-full text-center" delay={0.04} disabled={blurFadeDisabled}>
              <p className="badge-creos mx-auto text-xs uppercase tracking-[0.22em]">{t("Sign in")}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--creos-text)]">{`${t("Welcome back to")} ${brandName}`}</h2>
              <p className="mt-2 text-sm text-[color:rgb(var(--creos-text-rgb)/0.74)]">{t("Access your account securely.")}</p>
            </BlurFade>

            {!!loginError ? (
              <div className="w-full rounded-xl border border-red-300/50 bg-red-500/15 px-3 py-2 text-sm text-red-100" role="alert">
                {loginError}
              </div>
            ) : null}

            <div className="w-full space-y-3">
              <label className="text-xs font-medium uppercase tracking-wide text-[color:rgb(var(--creos-text-rgb)/0.8)]" htmlFor="signin-email">
                {t("Email")}
              </label>
              <div className="glass-input-wrap">
                <Mail className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[color:rgb(var(--creos-text-rgb)/0.66)]" style={{ insetInlineStart: "1rem" }} />
                <input
                  id="signin-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    const next = e.target.value;
                    setLoginEmail(next);
                    onEmailChange?.(next);
                  }}
                  autoComplete="email"
                  placeholder={t("name@example.com")}
                  className="glass-input py-3 text-sm"
                  style={{ paddingInlineStart: "2.75rem", paddingInlineEnd: "1rem" }}
                />
              </div>

              <label className="text-xs font-medium uppercase tracking-wide text-[color:rgb(var(--creos-text-rgb)/0.8)]" htmlFor="signin-password">
                {t("Password")}
              </label>
              <div className="glass-input-wrap">
                <Lock className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[color:rgb(var(--creos-text-rgb)/0.66)]" style={{ insetInlineStart: "1rem" }} />
                <input
                  id="signin-password"
                  type={loginShowPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => {
                    const next = e.target.value;
                    setLoginPassword(next);
                    onPasswordChange?.(next);
                  }}
                  autoComplete="current-password"
                  placeholder={t("Password")}
                  className="glass-input py-3 text-sm"
                  style={{ paddingInlineStart: "2.75rem", paddingInlineEnd: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setLoginShowPassword((v) => !v)}
                  className="absolute top-1/2 -translate-y-1/2 text-[color:rgb(var(--creos-text-rgb)/0.72)]"
                  style={{ insetInlineEnd: "0.75rem" }}
                  aria-label={t(loginShowPassword ? "Hide password" : "Show password")}
                >
                  {loginShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1 text-xs text-[color:rgb(var(--creos-text-rgb)/0.82)]">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={loginRemember}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setLoginRemember(next);
                      onRememberChange?.(next);
                    }}
                    className="h-4 w-4 rounded border border-white/15 bg-black/40 text-[color:var(--creos-accent)] focus:ring-[rgb(var(--creos-accent-rgb)/0.3)]"
                  />
                  {t("Remember me")}
                </label>

                <Link to="/auth/register" className="text-[color:var(--creos-accent-bright)] hover:underline">
                  {t("Create account")}
                </Link>
              </div>

              <GlassButton
                type="button"
                className="w-full"
                disabled={loginLoading}
                onClick={handleLoginSubmit}
              >
                <span className="inline-flex items-center gap-2">
                  {loginLoading ? t("Signing in...") : t("Sign in")}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </GlassButton>
            </div>

            <div className="w-full text-center">
              <Link to="/home" className="text-sm text-[color:rgb(var(--creos-text-rgb)/0.82)] hover:text-[color:var(--creos-accent-bright)] hover:underline">
                {t("Back to site")}
              </Link>
            </div>
          </fieldset>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell flex min-h-screen w-screen flex-col">
      <style>{SIGN_UP_STYLES}</style>

      <AuthModal modalStatus={modalStatus} closeModal={closeModal} mergedError={mergedError} lowPerfMode={lowPerfMode} />

      <HeaderBrand logo={logo} brandName={brandName} />

      <div className="relative flex h-full w-full flex-1 items-center justify-center overflow-hidden">
        <AuthBackground lowPerfMode={lowPerfMode} />

        <fieldset
          disabled={loading || modalStatus === "loading"}
          className={cn("auth-panel relative z-10 flex w-[min(100%,28rem)] flex-col items-center gap-6", blurCardClass)}
        >
            <BlurFade className="w-full text-center" delay={0.04} disabled={blurFadeDisabled}>
              <p className="badge-creos mx-auto text-xs uppercase tracking-[0.22em]">{t("Create account")}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--creos-text)]">{`${t("Welcome to")} ${brandName}`}</h2>
              <p className="mt-2 text-sm text-[color:rgb(var(--creos-text-rgb)/0.74)]">{t("Secure signup with real email OTP verification.")}</p>
            </BlurFade>

            {!!mergedError && modalStatus !== "error" ? (
              <div className="w-full rounded-xl border border-red-300/50 bg-red-500/15 px-3 py-2 text-sm text-red-100">{mergedError}</div>
            ) : null}

            <form onSubmit={handleFinalSubmit} className="w-full space-y-3">
              <RegisterStepContent
                authStep={authStep}
                lowPerfMode={lowPerfMode}
                email={email}
                handleEmailChange={handleEmailChange}
                isEmailValid={isEmailValid}
                requestingOtp={requestingOtp}
                handleSendOtp={handleSendOtp}
                otpInputDraft={otpInputDraft}
                setOtpInputDraft={setOtpInputDraft}
                setOtpCode={setOtpCode}
                otpInputRef={otpInputRef}
                isOtpValid={isOtpValid}
                verifyingOtp={verifyingOtp}
                handleVerifyOtp={handleVerifyOtp}
                resendCooldown={resendCooldown}
                handleResendOtp={handleResendOtp}
                handleGoBack={handleGoBack}
                fullName={fullName}
                setFullName={setFullName}
                phone={phone}
                setPhone={setPhone}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                password={password}
                setPassword={setPassword}
                passwordInputRef={passwordInputRef}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                confirmPasswordInputRef={confirmPasswordInputRef}
                canSubmit={canSubmit}
                loading={loading}
              />
            </form>

            <BlurFade className="w-full" delay={0.08} disabled={blurFadeDisabled}>
              <div className="auth-divider">
                <span className="text-xs uppercase tracking-[0.2em]">{t("or")}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="social-button inline-flex items-center justify-center gap-2 px-3 py-2 text-sm"
                  onClick={() => onGoogle?.()}
                >
                  <GoogleIcon /> {t("Continue with Google")}
                </button>
                <button
                  type="button"
                  className="social-button inline-flex items-center justify-center gap-2 px-3 py-2 text-sm"
                  onClick={() => onGitHub?.()}
                >
                  <GitHubIcon /> {t("Continue with GitHub")}
                </button>
              </div>
            </BlurFade>
        </fieldset>
      </div>
    </div>
  );
};

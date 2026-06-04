// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        creos: {
          bg: "#111415",
          navy: "#0A1128",
          surface: "#1D2021",
          surfaceHi: "#282A2B",
          surfaceMax: "#323536",
          gold: "#D4AF37",
          goldBright: "#F2CA50",
          text: "#E1E3E4",
          muted: "#D0C5AF",
          border: "#99907C",
          borderSoft: "rgba(255,255,255,0.10)",
        },
        offwhite: "#F8F7F3",
        gold: "#D4AF37",
        goldSoft: "#EADBA6",
        green: {
          DEFAULT: "#0F9D58",
          dark: "#0B7F47",
        },
        ink: {
          DEFAULT: "#1B1B1B",
          soft: "#6B7280",
        },
        borderSoft: "#E5DBC4",
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0,0,0,0.35)",
        gold: "0 0 0 1px rgba(212,175,55,0.22), 0 12px 40px rgba(212,175,55,0.10)",
        soft: "0 10px 28px rgba(0,0,0,0.05)",
        ring: "0 0 0 4px rgba(212,175,55,0.18)",
      },
      backdropBlur: {
        glass: "20px",
      },
      borderRadius: {
        md: "0.75rem",
        lg: "1rem",
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ["Inter", "\"IBM Plex Sans Arabic\"", "\"Noto Sans Arabic\"", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

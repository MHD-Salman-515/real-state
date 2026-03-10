// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
        soft: "0 10px 28px rgba(0,0,0,0.05)",
        ring: "0 0 0 4px rgba(212,175,55,0.18)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          0: "#FFFFFF",
          50: "#F7F6F3",
          100: "#EFEEE9",
          200: "#E2DED7",
          300: "#CAC6BE",
          400: "#A8A49B",
          500: "#7C7870",
          600: "#57534C",
          700: "#3D3A35",
          800: "#272421",
          900: "#1A1815",
        },
        brand: {
          50: "#F0F2FF",
          100: "#E4E8FF",
          200: "#C7CFFE",
          400: "#6E82F5",
          500: "#3B5BDB",
          600: "#2F4AC4",
          700: "#2339A0",
        },
        safe: { DEFAULT: "#16A34A", bg: "rgba(22,163,74,0.09)", light: "rgba(22,163,74,0.15)" },
        caution: { DEFAULT: "#C27B16", bg: "rgba(194,123,22,0.09)", light: "rgba(194,123,22,0.15)" },
        danger: { DEFAULT: "#DC2626", bg: "rgba(220,38,38,0.09)", light: "rgba(220,38,38,0.15)" },
      },
      borderRadius: {
        card: "24px",
        "card-sm": "16px",
        "card-lg": "28px",
        pill: "100px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        float: "0 8px 40px rgba(0,0,0,0.11), 0 2px 12px rgba(0,0,0,0.06)",
        glow: "0 0 0 3px rgba(59,91,219,0.18)",
        "safe-glow": "0 0 0 3px rgba(22,163,74,0.15)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.93)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.42s cubic-bezier(0.16,1,0.3,1) both",
        "fade-up-d1": "fadeUp 0.42s cubic-bezier(0.16,1,0.3,1) 0.07s both",
        "fade-up-d2": "fadeUp 0.42s cubic-bezier(0.16,1,0.3,1) 0.14s both",
        "fade-up-d3": "fadeUp 0.42s cubic-bezier(0.16,1,0.3,1) 0.21s both",
        "scale-in": "scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.6s infinite linear",
      },
    },
  },
  plugins: [],
};
export default config;

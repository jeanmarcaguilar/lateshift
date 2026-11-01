import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#0B0B0C", ember: "#FF5A1F", amber: "#F5C542", paper: "#FAFAF7" },
      fontFamily: { display: ["var(--font-display)", "Impact", "sans-serif"], sans: ["var(--font-body)", "system-ui", "sans-serif"] },
      fontSize: {
        "display-lg": ["clamp(2.75rem, 9vw, 7.5rem)", { lineHeight: "0.9", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(2.75rem, 7vw, 4.5rem)", { lineHeight: "0.95", letterSpacing: "-0.015em" }],
      },
      transitionDuration: { DEFAULT: "400ms" },
      keyframes: { float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-14px)" } }, drift: { "0%": { transform: "scale(1)" }, "100%": { transform: "scale(1.07)" } }, modalIn: { from: { opacity: "0", transform: "translateY(24px) scale(0.97)" }, to: { opacity: "1", transform: "none" } }, fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } } },
      animation: { float: "float 6s ease-in-out infinite", drift: "drift 14s ease-in-out infinite alternate", "modal-in": "modalIn 400ms cubic-bezier(0.22,1,0.36,1) both", "fade-in": "fadeIn 300ms ease-out both" },
      transitionTimingFunction: { DEFAULT: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

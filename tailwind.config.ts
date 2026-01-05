
import type { Config } from "tailwindcss";

import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
        body: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Medimo Vibrant Semantic Colors
        "background-main": "#F0FDFA",
        "accent-success": "#10B981",
        "surface-card": "#FFFFFF",
        "border-divider": "#D1E7E5",
        "text-primary": "#134E4A",
        "text-secondary": "#5B7A78",
        "primary-action": "#14B8A6",
        "destructive-action": "#EF4444",
        "medimo-silver": "#94A3B8",
        // Vibrant accent palette
        "medimo-warning": "#F59E0B",
        "medimo-success": "#10B981",
        "medimo-accent-soft": "rgba(20, 184, 166, 0.12)",
        "medimo-violet": "#8B5CF6",
        "medimo-pink": "#EC4899",
        "medimo-orange": "#F97316",
        "medimo-sky": "#0EA5E9",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "gentle-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "gentle-pulse": "gentle-pulse 2s ease-in-out infinite",
      },
      boxShadow: {
        "elev-surface": "0 1px 2px rgba(0,0,0,0.04)",
        "elev-raised": "0 4px 12px -2px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "elev-overlay": "0 12px 40px -8px rgba(0,0,0,0.15), 0 4px 12px -2px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;

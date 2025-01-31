import type { Config } from "tailwindcss";

export default {
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#F5F5F7",
        foreground: "#1A1A1A",
        primary: {
          DEFAULT: "#9b87f5",
          hover: "#7C3AED",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F4F7FE",
          foreground: "#1B2559",
        },
        sidebar: {
          DEFAULT: "#581C87",
          hover: "#7E22CE",
          active: "#7E22CE",
          border: "#E5E7EB",
          text: "#FFFFFF",
        },
        widget: {
          background: "#FFFFFF",
          border: "rgba(255, 255, 255, 0.1)",
        },
        auth: {
          text: "#FFFFFF",
          input: "#F4F7FE",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#F5F5F7",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#F5F5F7",
          foreground: "#1A1A1A",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1A1A",
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #F5F5F7 0%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: {
          950: "#060B18",
          900: "#0A1128",
          850: "#0F172A",
          800: "#131D38",
          700: "#1E293B",
        },
        accent: {
          cyan: "#00E5FF",
          sky: "#38BDF8",
          blue: "#0284C7",
          cobalt: "#1D4ED8",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          900: "#14532d",
        },
      },
      boxShadow: {
        'cyan-glow': '0 0 25px -5px rgba(0, 229, 255, 0.25)',
        'blue-glow': '0 0 25px -5px rgba(2, 132, 199, 0.3)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'amber-glow': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
      }
    },
  },
  plugins: [],
};
export default config;

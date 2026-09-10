import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch Institutional Rigor Primary & Functional Palette
        "primary": "#002446",
        "primary-container": "#123a63",
        "on-primary": "#ffffff",
        "on-primary-container": "#83a5d4",
        "primary-fixed": "#d3e4ff",
        "primary-fixed-dim": "#a6c9fa",
        "on-primary-fixed": "#001c38",
        "on-primary-fixed-variant": "#244872",
        "inverse-primary": "#a6c9fa",

        // Sovereign Amber / Secondary
        "secondary": "#885200",
        "secondary-container": "#fea93e",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#6d4100",
        "secondary-fixed": "#ffddbb",
        "secondary-fixed-dim": "#ffb867",
        "on-secondary-fixed": "#2b1700",
        "on-secondary-fixed-variant": "#673d00",

        // Regulatory Emerald / Tertiary
        "tertiary": "#002b0f",
        "tertiary-container": "#00431b",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#55b66c",
        "tertiary-fixed": "#95f8a7",
        "tertiary-fixed-dim": "#79db8d",
        "on-tertiary-fixed": "#00210a",
        "on-tertiary-fixed-variant": "#005323",

        // Crisp Surfaces & Slate Grids
        "background": "#f8f9ff",
        "on-background": "#081d30",
        "surface": "#f8f9ff",
        "surface-bright": "#f8f9ff",
        "surface-dim": "#c9dcf6",
        "surface-variant": "#d1e4ff",
        "on-surface": "#081d30",
        "on-surface-variant": "#43474e",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eef4ff",
        "surface-container": "#e5efff",
        "surface-container-high": "#dbe9ff",
        "surface-container-highest": "#d1e4ff",
        "inverse-surface": "#1f3246",
        "inverse-on-surface": "#e9f1ff",
        "surface-tint": "#3e608b",

        // Outlines & Borders
        "outline": "#73777f",
        "outline-variant": "#c3c6d0",

        // Statutory Errors & Flags
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        // Backwards compatibility for existing components
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
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.25rem",
        xl: "0.5rem",
      },
      spacing: {
        "unit-2xs": "0.125rem",
        "unit-xs": "0.25rem",
        "unit-sm": "0.5rem",
        "unit-md": "0.75rem",
        "unit-lg": "1rem",
        "unit-xl": "1.5rem",
        "unit-2xl": "2rem",
        "unit-3xl": "3rem",
        "gutter-mobile": "0.5rem",
        "gutter-desktop": "1rem",
        "container-margin-mobile": "0.75rem",
        "container-margin-desktop": "1.5rem",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        "headline-lg": ['"IBM Plex Sans"', 'sans-serif'],
        "body-sm": ['"IBM Plex Sans"', 'sans-serif'],
        "label-sm": ['"IBM Plex Sans"', 'sans-serif'],
        "display-lg-mobile": ['"IBM Plex Sans"', 'sans-serif'],
        "label-eyebrow": ['"IBM Plex Sans"', 'sans-serif'],
        "headline-md": ['"IBM Plex Sans"', 'sans-serif'],
        "code-sm": ['"JetBrains Mono"', 'monospace'],
        "body-lg": ['"IBM Plex Sans"', 'sans-serif'],
        "display-lg": ['"IBM Plex Sans"', 'sans-serif'],
        "headline-xl": ['"IBM Plex Sans"', 'sans-serif'],
        "label-md": ['"IBM Plex Sans"', 'sans-serif'],
        "body-md": ['"IBM Plex Sans"', 'sans-serif'],
      },
      fontSize: {
        "headline-lg": ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "label-sm": ["11px", { lineHeight: "14px", fontWeight: "500" }],
        "display-lg-mobile": ["26px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "label-eyebrow": ["11px", { lineHeight: "16px", letterSpacing: "0.08em", fontWeight: "700" }],
        "headline-md": ["16px", { lineHeight: "24px", letterSpacing: "-0.005em", fontWeight: "600" }],
        "code-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "body-lg": ["15px", { lineHeight: "22px", fontWeight: "400" }],
        "display-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};

export default config;

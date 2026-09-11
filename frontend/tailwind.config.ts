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
        // Government Official Color Palette
        "primary": "#0f2e4d",
        "primary-container": "#1a4a73",
        "on-primary": "#ffffff",
        "on-primary-container": "#b8d1e8",
        "primary-fixed": "#d1e4ff",
        "primary-fixed-dim": "#99b8d9",
        "on-primary-fixed": "#001a2f",
        "on-primary-fixed-variant": "#15395c",
        "inverse-primary": "#99b8d9",

        // Government Gold/Brown Secondary
        "secondary": "#8b6914",
        "secondary-container": "#d4a868",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#6b5410",
        "secondary-fixed": "#fde6ba",
        "secondary-fixed-dim": "#ddc389",
        "on-secondary-fixed": "#3a2e00",
        "on-secondary-fixed-variant": "#6f5f0a",

        // Regulatory Green / Tertiary
        "tertiary": "#1b4d2e",
        "tertiary-container": "#2d7a47",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#8dd9a3",
        "tertiary-fixed": "#95f8a7",
        "tertiary-fixed-dim": "#73db8e",
        "on-tertiary-fixed": "#002113",
        "on-tertiary-fixed-variant": "#0a6334",

        // Clean Cream Surfaces
        "background": "#f5f3f0",
        "on-background": "#1a1410",
        "surface": "#fffbf8",
        "surface-bright": "#fffbf8",
        "surface-dim": "#d9d4ce",
        "surface-variant": "#e8e1d9",
        "on-surface": "#1a1410",
        "on-surface-variant": "#6b6460",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f9f6f3",
        "surface-container": "#f3f0ed",
        "surface-container-high": "#ede9e6",
        "surface-container-highest": "#e8e1d9",
        "inverse-surface": "#2f2b27",
        "inverse-on-surface": "#f8f5f1",
        "surface-tint": "#0f2e4d",

        // Outlines & Borders
        "outline": "#6b6460",
        "outline-variant": "#a89f96",

        // Statutory Errors & Warnings
        "error": "#b3261e",
        "error-container": "#f9dedc",
        "on-error": "#ffffff",
        "on-error-container": "#8c0000",

        // Backward compatibility
        canvas: {
          950: "#1a1410",
          900: "#2f2b27",
          850: "#3a3531",
          800: "#4a4540",
          700: "#6b6460",
        },
        accent: {
          cyan: "#00796b",
          sky: "#0277bd",
          blue: "#0f2e4d",
          cobalt: "#1a4a73",
          emerald: "#1b4d2e",
          amber: "#8b6914",
          rose: "#a52747",
        },
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.5rem",
        xl: "1rem",
      },
      spacing: {
        "unit-2xs": "0.25rem",
        "unit-xs": "0.5rem",
        "unit-sm": "0.75rem",
        "unit-md": "1rem",
        "unit-lg": "1.5rem",
        "unit-xl": "2rem",
        "unit-2xl": "2.5rem",
        "unit-3xl": "3rem",
        "gutter-mobile": "0.75rem",
        "gutter-desktop": "1.5rem",
        "container-margin-mobile": "1rem",
        "container-margin-desktop": "2rem",
      },
      fontFamily: {
        sans: ['"Times New Roman"', 'Times', 'serif'],
        serif: ['"Times New Roman"', 'Times', 'serif'],
        mono: ['"Courier New"', 'monospace'],
        "headline-lg": ['"Times New Roman"', 'Times', 'serif'],
        "body-sm": ['"Times New Roman"', 'Times', 'serif'],
        "label-sm": ['"Times New Roman"', 'Times', 'serif'],
        "display-lg-mobile": ['"Times New Roman"', 'Times', 'serif'],
        "label-eyebrow": ['"Times New Roman"', 'Times', 'serif'],
        "headline-md": ['"Times New Roman"', 'Times', 'serif'],
        "code-sm": ['"Courier New"', 'monospace'],
        "body-lg": ['"Times New Roman"', 'Times', 'serif'],
        "display-lg": ['"Times New Roman"', 'Times', 'serif'],
        "headline-xl": ['"Times New Roman"', 'Times', 'serif'],
        "label-md": ['"Times New Roman"', 'Times', 'serif'],
        "body-md": ['"Times New Roman"', 'Times', 'serif'],
      },
      fontSize: {
        // Display/Headings
        "display-lg": ["36px", { lineHeight: "1.3", letterSpacing: "0.3px", fontWeight: "700" }],
        "display-lg-mobile": ["28px", { lineHeight: "1.35", letterSpacing: "0.2px", fontWeight: "700" }],
        "headline-xl": ["26px", { lineHeight: "1.35", letterSpacing: "0.15px", fontWeight: "700" }],
        "headline-lg": ["22px", { lineHeight: "1.4", letterSpacing: "0.1px", fontWeight: "700" }],
        "headline-md": ["18px", { lineHeight: "1.45", letterSpacing: "0.05px", fontWeight: "600" }],
        "headline-sm": ["16px", { lineHeight: "1.5", letterSpacing: "0px", fontWeight: "600" }],
        
        // Body text
        "body-lg": ["18px", { lineHeight: "1.65", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.65", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.6", fontWeight: "400" }],
        
        // Labels
        "label-md": ["14px", { lineHeight: "1.4", letterSpacing: "0.3px", fontWeight: "600" }],
        "label-sm": ["13px", { lineHeight: "1.35", letterSpacing: "0.2px", fontWeight: "600" }],
        "label-eyebrow": ["12px", { lineHeight: "1.3", letterSpacing: "0.5px", fontWeight: "700", textTransform: "uppercase" }],
        
        // Code
        "code-sm": ["13px", { lineHeight: "1.5", fontWeight: "400", fontFamily: '"Courier New", monospace' }],
      },
    },
  },
  plugins: [],
};

export default config;

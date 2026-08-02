/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "#F9F8F6",
        background: "#fbf9f5",
        surface: "#fbf9f5",
        primary: "#051912",
        "deep-forest": "#1A2E26",
        onyx: "#22211F",
        secondary: "#605e5b",
        "moss-muted": "#675E55",
        concrete: "#EAE8E4",
        "surface-container-low": "#f5f3ef",
        "surface-container": "#f0eeea",
        "surface-container-high": "#eae8e4",
        "surface-container-highest": "#e4e2de",
        "surface-variant": "#e4e2de",
        outline: "#727874",
        "outline-variant": "#c2c8c3",
        "inverse-primary": "#b5ccc0",
      },
      fontFamily: {
        display: ['var(--font-literata)', 'Literata', 'Georgia', 'serif'],
        serif: ['var(--font-literata)', 'Literata', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      borderRadius: {
        'full': '9999px',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

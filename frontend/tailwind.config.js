/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Deep Matte Black
        surface: "#18181b",    // Card Background
        border: "#27272a",     // Subtle Borders
        primary: "#06b6d4",    // Electric Cyan
        bull: "#10b981",       // Muted Green
        bear: "#ef4444",       // Muted Red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
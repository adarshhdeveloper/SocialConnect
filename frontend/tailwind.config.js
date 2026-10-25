/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0F19",
        cardBg: "#111827",
        borderSubtle: "#1F2937",
        accentNeon: "#A855F7",
        accentCyan: "#06B6D4",
      }
    },
  },
  plugins: [],
}


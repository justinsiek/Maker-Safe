/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px"
      },
      boxShadow: {
        elev: "0 4px 12px rgba(0,0,0,0.08)"
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms"
      }
    }
  },
  plugins: []
};
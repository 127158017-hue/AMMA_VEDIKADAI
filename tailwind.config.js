/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fff9ee",
        paper: "#fffdf8",
        ember: "#f97316",
        flame: "#dc2626",
        gold: "#d9a321",
        leaf: "#16a34a"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(146, 64, 14, 0.12)"
      }
    }
  },
  plugins: []
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        // Verdict palette (ordinal, best -> worst)
        loved: "#e11d48", // rose-600
        liked: "#16a34a", // green-600
        disliked: "#78716c", // stone-500
        dnf: "#a1a1aa", // zinc-400
        reading: "#2563eb", // blue-600
      },
    },
  },
  plugins: [],
};

export default config;

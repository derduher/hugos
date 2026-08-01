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
        // Intent palette
        want: "#7c3aed", // violet-600
        skip: "#64748b", // slate-500
        // Verdict palette (ordinal, best -> worst)
        reading: "#2563eb", // blue-600
        loved: "#e11d48", // rose-600
        liked: "#16a34a", // green-600
        disliked: "#78716c", // stone-500
        dnf: "#a1a1aa", // zinc-400
      },
    },
  },
  plugins: [],
};

export default config;

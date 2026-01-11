import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tremor wymaga specyficznych definicji kolorów, jeśli używasz niestandardowych motywów
      },
    },
  },
  plugins: [],
};
export default config;

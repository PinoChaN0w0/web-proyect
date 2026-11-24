import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    include: ["src/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "src/main.jsx",
        "src/**/*.spec.{js,jsx}",
        "src/**/*.test.{js,jsx}",
        "src/test/**",
      ],
      reporter: ["text", "html"],
      thresholds: { statements: 60, branches: 60, functions: 60, lines: 60 },
    },
  },
});
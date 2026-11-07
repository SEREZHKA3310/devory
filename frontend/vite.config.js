import { defineConfig } from "vite";
import eslint from "@nabla/vite-plugin-eslint";

export default defineConfig({
  plugins: [
    eslint({
      fix: true,
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
  },
});

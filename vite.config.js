import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from 'path';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"),
        "content": resolve(
          __dirname,
          "src/content/content.js"
        ),
        "content-fallback": resolve(
          __dirname,
          "src/content/content-fallback.js"
        ),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        manualChunks: {
          react: ['react', 'react-dom'],
        }
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false, // не стирать попап, собранный первым проходом
    lib: {
      entry: resolve(__dirname, "src/content/content-script.ts"),
      formats: ["iife"],
      name: "SFFContent",
      fileName: () => "content/content-script.js",
    },
    rollupOptions: {
      output: {
        // iife + inlineDynamicImports = один файл, никаких import
        inlineDynamicImports: true,
      },
    },
    minify: false, // читаемость в DevTools; можно true для прод
    target: "chrome110",
  },
  publicDir: false, // не копировать public второй раз
});
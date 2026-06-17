import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// The demo imports the library by name; alias it to the TS source so changes
// are picked up instantly without a build step.
export default defineConfig({
  root: "demo",
  base: "/kritzelei/",
  plugins: [react()],
  resolve: {
    alias: {
      kritzelei: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
    },
  },
});

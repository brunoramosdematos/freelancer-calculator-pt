import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const parsedPort = Number(process.env.PORT);
const serverPort =
  Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535
    ? parsedPort
    : undefined;

export default defineConfig({
  base: "/",
  plugins: [vue()],
  build: {
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
  },
  ...(serverPort === undefined ? {} : { server: { port: serverPort } }),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

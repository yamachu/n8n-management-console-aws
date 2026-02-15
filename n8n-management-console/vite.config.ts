import build from "@hono/vite-build/node";
import adapter from "@hono/vite-dev-server/node";
import tailwindcss from "@tailwindcss/vite";
import honox from "honox/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    honox({
      devServer: { adapter },
      client: { input: ["/app/client.ts", "/app/style.css"] },
      entry: "/app/server.tsx", // TODO: localでの開発は /app/server.local.tsx に向けるようにする
    }),
    tailwindcss(),
    build(),
  ],
});

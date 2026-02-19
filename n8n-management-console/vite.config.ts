import build from "@hono/vite-build/node";
import devServer from "@hono/vite-dev-server";
import adapter from "@hono/vite-dev-server/node";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    command === "serve"
      ? devServer({
          entry: "/app/server.local.tsx",
          adapter,
        })
      : undefined,
    // TODO: Node.jsにするか、AWS Lambdaにするかは別の方法で切り替えられるようにする
    command === "build"
      ? build({
          entry: "/app/server.tsx",
        })
      : undefined,
  ],
}));

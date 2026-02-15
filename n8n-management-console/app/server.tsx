import { Hono, type Env } from "hono";
import { showRoutes } from "hono/dev";
import { createApp } from "honox/server";

import { UnauthorizedError } from "./exceptions";
import { requireAuth } from "./middlewares/auth/cognito";

export const createComposeMiddlewareApp = (args?: {
  authArgs?: Parameters<typeof requireAuth>;
}) => {
  return new Hono<Env>()
    .use("*", requireAuth(...(args?.authArgs || [undefined, undefined])))
    .onError((err, c) => {
      if (err instanceof UnauthorizedError) {
        return c.newResponse(
          JSON.stringify({
            type: "about:blank",
            status: 401,
            title: "Unauthorized",
            detail: err.message || "認証が必要です",
          }),
          401,
          {
            "Content-Type": "application/problem+json",
          },
        );
      }

      console.error("Unexpected error:", err);
      return c.newResponse(
        JSON.stringify({
          type: "about:blank",
          status: 500,
          title: "Internal Server Error",
          detail: "予期せぬエラーが発生しました",
        }),
        500,
        {
          "Content-Type": "application/problem+json",
        },
      );
    });
};

const app = createApp<Env>({
  app: createComposeMiddlewareApp(),
});

showRoutes(app);

export default app;

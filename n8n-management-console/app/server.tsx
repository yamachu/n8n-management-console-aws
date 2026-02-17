import { Hono, type Env } from "hono";
import { showRoutes } from "hono/dev";
import { createApp } from "honox/server";

import { ForbiddenError, UnauthorizedError } from "./exceptions";
import { createUserRepository } from "./infrastructures/userRepository";
import { requireAccount } from "./middlewares/account";
import { requireAuth } from "./middlewares/auth/cognito";

export const createComposeMiddlewareApp = (args?: {
  authArgs?: Parameters<typeof requireAuth>;
  userRepositoryImplArgs?: Parameters<typeof createUserRepository>;
}) => {
  return new Hono<Env>()
    .use("*", async (c, next) => {
      c.set(
        "userRepository",
        createUserRepository(...(args?.userRepositoryImplArgs || [])),
      );
      await next();
    })
    .use("*", requireAuth(...(args?.authArgs || [undefined, undefined])))
    .use("*", (c, next) =>
      requireAccount(c.get("userRepository"), c.get("USER_EMAIL"))(c, next),
    )
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
      if (err instanceof ForbiddenError) {
        return c.newResponse(
          JSON.stringify({
            type: "about:blank",
            status: 403,
            title: "Forbidden",
            detail: err.message || "アクセスが禁止されています",
          }),
          403,
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

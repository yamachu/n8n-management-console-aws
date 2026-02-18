import { Hono, type Env } from "hono";
import { showRoutes } from "hono/dev";
import { createApp } from "honox/server";

import { ForbiddenError, UnauthorizedError } from "./exceptions";
import { createUserQueryRepository } from "./infrastructures/userQueryRepository";
import { requireAccount } from "./middlewares/account";
import { requireAuth } from "./middlewares/auth/cognito";

export const createComposeMiddlewareApp = (args?: {
  authArgs?: Parameters<typeof requireAuth>;
  userRepositoryImplArgs?: Parameters<typeof createUserQueryRepository>;
}) => {
  return new Hono<Env>()
    .use("*", async (c, next) => {
      c.set(
        "userQueryRepository",
        createUserQueryRepository(...(args?.userRepositoryImplArgs || [])),
      );
      await next();
    })
    .use("*", requireAuth(...(args?.authArgs || [undefined, undefined])))
    .use("*", (c, next) =>
      requireAccount(c.get("userQueryRepository"), c.get("USER_EMAIL"))(
        c,
        next,
      ),
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

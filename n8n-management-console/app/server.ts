import { Hono, type Context, type Env } from "hono";
import { env } from "hono/adapter";
import { showRoutes } from "hono/dev";

import type { RuntimeEnv } from "../env";
import { stringIsNullOrEmpty } from "./domains/utils";
import { ForbiddenError, UnauthorizedError } from "./exceptions";
import { createUserQueryRepository } from "./infrastructures/userQueryRepository";
import { requireAccount } from "./middlewares/account";
import { requireAuth } from "./middlewares/auth/cognito";
import { htmlRenderer } from "./middlewares/renderer";
import type { ProvidesMiddleware } from "./types/middleware";

import rootIndexGetHandler from "./routes/index";

export const createComposeMiddlewareApp = (args?: {
  authArgs?: Parameters<typeof requireAuth>;
  userRepositoryImplArgs?: Parameters<typeof createUserQueryRepository>;
}) =>
  new Hono()
    .use(
      "*",
      async (
        c: Context<ProvidesMiddleware<Env, "userQueryRepository">>,
        next,
      ) => {
        if (!args?.userRepositoryImplArgs) {
          const { N8N_API_KEY, N8N_BASE_ENDPOINT } = env<RuntimeEnv>(c);
          if (
            stringIsNullOrEmpty(N8N_API_KEY) ||
            stringIsNullOrEmpty(N8N_BASE_ENDPOINT)
          ) {
            throw new Error(
              "N8N_API_KEY and N8N_BASE_ENDPOINT must be provided in environment variables when userRepositoryImplArgs is not provided",
            );
          }
          const { createClient } =
            await import("./infrastructures/userQueryRepository/client");

          c.set(
            "userQueryRepository",
            createUserQueryRepository(
              createClient(N8N_BASE_ENDPOINT, N8N_API_KEY),
            ),
          );
        } else {
          c.set(
            "userQueryRepository",
            createUserQueryRepository(...args.userRepositoryImplArgs),
          );
        }

        await next();
      },
    )
    .use("*", requireAuth(...(args?.authArgs || [undefined, undefined])))
    .use("*", requireAccount())
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
    })
    .use("*", htmlRenderer())
    .get("/", ...rootIndexGetHandler);

const app = createComposeMiddlewareApp();

showRoutes(app);

export default app;

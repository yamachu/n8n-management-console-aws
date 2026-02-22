import { Hono, type Context, type Env } from "hono";
import { env } from "hono/adapter";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";

import type { RuntimeEnv } from "../env";
import { stringIsNullOrEmpty } from "./domains/utils";
import { ForbiddenError, UnauthorizedError } from "./exceptions";
import { createCredentialQueryRepository } from "./infrastructures/credentialQueryRepository";
import { createUserQueryRepository } from "./infrastructures/userQueryRepository";
import { requireAccount } from "./middlewares/account";
import { requireAuth } from "./middlewares/auth/cognito";
import { htmlRenderer } from "./middlewares/renderer";
import type {
  ProvidesMiddleware,
  RequiresMiddleware,
} from "./types/middleware";

import rootIndexGetHandler from "./routes/index";

export const createComposeMiddlewareApp = (args?: {
  authArgs?: Parameters<typeof requireAuth>;
  userRepositoryImplArgs?: Parameters<typeof createUserQueryRepository>;
  credentialRepositoryImplArgs?: Parameters<
    typeof createCredentialQueryRepository
  >;
}) =>
  new Hono()
    .use(logger())
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
    .use(
      "*",
      async (c: Context<ProvidesMiddleware<Env, "n8nBackendDB">>, next) => {
        if (!args?.credentialRepositoryImplArgs?.[0]) {
          const { N8N_BACKEND_DB_TYPE, N8N_BACKEND_DB_CONNECTION_STRING } =
            env<RuntimeEnv>(c);

          if (N8N_BACKEND_DB_TYPE === "postgresql") {
            const { default: pg } = await import("postgres");

            c.set("n8nBackendDB", {
              type: "postgresql",
              client: pg(N8N_BACKEND_DB_CONNECTION_STRING),
            });
          } else {
            throw new Error(
              `Unsupported N8N_BACKEND_DB_TYPE: ${N8N_BACKEND_DB_TYPE}`,
            );
          }
        }

        await next();
      },
    )
    .use(
      "*",
      async (
        c: Context<
          RequiresMiddleware<Env, "n8nBackendDB" | "CURRENT_USER"> &
            ProvidesMiddleware<Env, "credentialQueryRepository">
        >,
        next,
      ) => {
        if (!args?.credentialRepositoryImplArgs?.[0]) {
          const { N8N_BACKEND_DB_TYPE } = env<RuntimeEnv>(c);
          if (N8N_BACKEND_DB_TYPE === "postgresql") {
            const { createClient } =
              await import("./infrastructures/credentialQueryRepository/client.postgresql");
            const n8nBackendDB = c.get("n8nBackendDB");
            if (n8nBackendDB.type !== "postgresql") {
              throw new Error(
                `Expected n8nBackendDB type to be postgresql, but got ${n8nBackendDB.type}`,
              );
            }

            c.set(
              "credentialQueryRepository",
              createCredentialQueryRepository(
                createClient(n8nBackendDB),
                c.get("CURRENT_USER"),
              ),
            );
          }
        } else {
          c.set(
            "credentialQueryRepository",
            createCredentialQueryRepository(
              args.credentialRepositoryImplArgs[0],
              args.credentialRepositoryImplArgs[1] ?? c.get("CURRENT_USER"),
            ),
          );
        }

        await next();
      },
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
    })
    .use("*", htmlRenderer())
    .get("/", ...rootIndexGetHandler);

const app = createComposeMiddlewareApp();

showRoutes(app);

export default app;

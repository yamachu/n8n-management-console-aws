import type { Context, Env } from "hono";
import { createMiddleware } from "hono/factory";

import type { AuthClient } from "..";
import { UnauthorizedError } from "../../../exceptions";
import {
  defineMiddleware,
  type ProvidesMiddleware,
  type RequiresMiddleware,
} from "../../../types/middleware";
import { createAuthClient } from "./client";

export const requireAuth = (
  authClient?: AuthClient,
  handlerFilter?: (c: Context) => boolean,
) =>
  defineMiddleware<
    RequiresMiddleware<Env, never>,
    ProvidesMiddleware<Env, "USER_EMAIL">
  >(
    createMiddleware(async (c, next) => {
      if (handlerFilter) {
        const shouldAuthenticate = handlerFilter(c);
        if (!shouldAuthenticate) {
          await next();
          return;
        }
      }
      const client = authClient || (await createAuthClient({}));

      try {
        const accessToken = await client.extractToken(c.req.header());
        const user = await client.fetchUser(accessToken);
        c.set("USER_EMAIL", user.email);
      } catch (error) {
        throw new UnauthorizedError(
          "トークンの検証に失敗しました。再度ログインしてください。",
          {
            cause: error,
          },
        );
      }

      await next();
    }),
  );

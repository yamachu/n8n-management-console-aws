import type { Env } from "hono";
import { createMiddleware } from "hono/factory";

import { ForbiddenError } from "../../exceptions";
import {
  defineMiddleware,
  type ProvidesMiddleware,
  type RequiresMiddleware,
} from "../../types/middleware";

export const requireAccount = () =>
  defineMiddleware<
    RequiresMiddleware<Env, "USER_EMAIL" | "userQueryRepository">,
    ProvidesMiddleware<Env, "CURRENT_USER">
  >(
    createMiddleware(async (c, next) => {
      const email = c.get("USER_EMAIL");
      const userRepository = c.get("userQueryRepository");

      const currentUser = await userRepository.fetchUserByEmail(email);
      if (!currentUser) {
        throw new ForbiddenError("ログインユーザが見つかりません");
      }
      c.set("CURRENT_USER", currentUser);
      await next();
    }),
  );

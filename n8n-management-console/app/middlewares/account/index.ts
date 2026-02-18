import type { Env } from "hono";
import { createMiddleware } from "hono/factory";

import { ForbiddenError } from "../../exceptions";
import type { UserQueryRepository } from "../../infrastructures/userQueryRepository";

export const requireAccount = (
  userRepository: UserQueryRepository,
  email: string,
) =>
  createMiddleware<Env>(async (c, next) => {
    const currentUser = await userRepository.fetchUserByEmail(email);
    if (!currentUser) {
      throw new ForbiddenError("ログインユーザが見つかりません");
    }
    c.set("CURRENT_USER", currentUser);
    await next();
  });

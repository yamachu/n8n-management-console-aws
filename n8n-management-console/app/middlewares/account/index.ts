import type { Env, MiddlewareHandler } from "hono";

import { ForbiddenError } from "../../exceptions";
import type { UserRepository } from "../../infrastructures/userRepository";

export const requireAccount: (
  userRepository: UserRepository,
  email: string,
) => MiddlewareHandler<Env> = (userRepository, email) => async (c, next) => {
  const currentUser = await userRepository.fetchUserByEmail(email);
  if (!currentUser) {
    throw new ForbiddenError("ログインユーザが見つかりません");
  }
  c.set("CURRENT_USER", currentUser);
  await next();
};

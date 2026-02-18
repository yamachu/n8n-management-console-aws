import type {} from "hono";
import type { User } from "./domains/User";
import type { UserQueryRepository } from "./infrastructures/userQueryRepository";

declare module "hono" {
  interface Env {
    Variables: {
      USER_EMAIL: string;
      CURRENT_USER: User;

      userQueryRepository: UserQueryRepository;
    };
    Bindings: {};
  }
}

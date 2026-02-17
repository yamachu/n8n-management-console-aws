import type {} from "hono";
import type { User } from "./domains/User";
import type { UserRepository } from "./infrastructures/userRepository";

declare module "hono" {
  interface Env {
    Variables: {
      USER_EMAIL: string;
      CURRENT_USER: User;

      userRepository: UserRepository;
    };
    Bindings: {};
  }
}

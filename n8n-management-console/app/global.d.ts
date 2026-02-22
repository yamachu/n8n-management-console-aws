import type {} from "hono";
import type { BackendDB } from "./domains/BackendDB";
import type { User } from "./domains/User";
import type { CredentialQueryRepository } from "./infrastructures/credentialQueryRepository";
import type { UserQueryRepository } from "./infrastructures/userQueryRepository";

declare module "hono" {
  interface Env {
    Variables: {
      USER_EMAIL: string;
      CURRENT_USER: User;

      userQueryRepository: UserQueryRepository;
      credentialQueryRepository: CredentialQueryRepository;
      n8nBackendDB: BackendDB;
    };
    Bindings: {};
  }
}

import type { User, UserId } from "../../domains/User";
import type { CredentialQueryRepository } from "./types";

const credentialQueryRepositoryImplSymbol = Symbol(
  "CredentialQueryRepositoryImpl",
);
type CredentialQueryRepositoryImpl = CredentialQueryRepository & {
  [credentialQueryRepositoryImplSymbol]: never;
};

export const createCredentialQueryRepository = (
  impl: CredentialQueryRepository,
  user: User,
): CredentialQueryRepositoryImpl => {
  return {
    fetchCredentials: async () => {
      if (user.role === "global:member") {
        return impl
          .fetchCredentialsByUserId(user.id)
          .then((credentials) => new Map([[user.id, credentials]]));
      }
      return impl.fetchCredentials();
    },
    fetchCredentialsByUserId: async (userId: UserId) => {
      if (user.role === "global:owner" || user.id === userId) {
        return impl.fetchCredentialsByUserId(userId);
      }
      return [];
    },
  } satisfies CredentialQueryRepository as CredentialQueryRepositoryImpl;
};

export type { CredentialQueryRepositoryImpl as CredentialQueryRepository };

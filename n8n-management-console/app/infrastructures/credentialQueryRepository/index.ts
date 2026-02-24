import { toCredentialId } from "../../domains/Credential";
import { toUserId, type User, type UserId } from "../../domains/User";
import type {
  CredentialQueryRepository,
  PlainCredentialQueryRepository,
} from "./types";

declare const credentialQueryRepositoryImplSymbol: unique symbol;
type CredentialQueryRepositoryImpl = CredentialQueryRepository & {
  [credentialQueryRepositoryImplSymbol]: never;
};

export const createCredentialQueryRepository = (
  impl: PlainCredentialQueryRepository,
  user: User,
): CredentialQueryRepositoryImpl => {
  return {
    fetchCredentials: async () => {
      if (user.role === "global:member") {
        return impl.fetchCredentialsByUserId(user.id).then(
          (credentials) =>
            new Map([
              [
                user.id,
                credentials.map((credential) => ({
                  ...credential,
                  id: toCredentialId(credential.id),
                })),
              ],
            ]),
        );
      }

      return impl.fetchCredentials().then((grouped) => {
        return new Map(
          grouped.entries().map(([userId, credentials]) => {
            return [
              toUserId(userId),
              credentials.map((credential) => {
                return { ...credential, id: toCredentialId(credential.id) };
              }),
            ];
          }),
        );
      });
    },
    fetchCredentialsByUserId: async (userId: UserId) => {
      if (user.role === "global:owner" || user.id === userId) {
        return impl.fetchCredentialsByUserId(userId).then((credentials) =>
          credentials.map((credential) => ({
            ...credential,
            id: toCredentialId(credential.id),
          })),
        );
      }
      return [];
    },
  } satisfies CredentialQueryRepository as CredentialQueryRepositoryImpl;
};

export type { CredentialQueryRepositoryImpl as CredentialQueryRepository };

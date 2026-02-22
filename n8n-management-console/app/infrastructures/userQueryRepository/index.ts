import { toUserId } from "../../domains/User";
import type { PlainUserQueryRepository, UserQueryRepository } from "./types";

const userQueryRepositoryImplSymbol = Symbol("UserQueryRepositoryImpl");
type UserQueryRepositoryImpl = UserQueryRepository & {
  [userQueryRepositoryImplSymbol]: never;
};

export const createUserQueryRepository = (
  impl: PlainUserQueryRepository,
): UserQueryRepositoryImpl => {
  return {
    fetchUsers: async () => {
      return impl.fetchUsers().then((users) => {
        return users.map((user) => ({
          ...user,
          id: toUserId(user.id),
        }));
      });
    },
    fetchUserByEmail: async (email: string) => {
      return impl.fetchUserByEmail(email).then((user) => {
        if (!user) {
          return null;
        }
        return {
          ...user,
          id: toUserId(user.id),
        };
      });
    },
  } satisfies UserQueryRepository as UserQueryRepositoryImpl;
};

export type { UserQueryRepositoryImpl as UserQueryRepository };

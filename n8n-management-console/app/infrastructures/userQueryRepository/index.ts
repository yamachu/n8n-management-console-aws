import type { UserQueryRepository } from "./types";

const userQueryRepositoryImplSymbol = Symbol("UserQueryRepositoryImpl");
type UserQueryRepositoryImpl = UserQueryRepository & {
  [userQueryRepositoryImplSymbol]: never;
};

export const createUserQueryRepository = (
  impl: UserQueryRepository,
): UserQueryRepositoryImpl => {
  return {
    fetchUsers: async () => {
      return impl.fetchUsers();
    },
    fetchUserByEmail: async (email: string) => {
      return impl.fetchUserByEmail(email);
    },
  } satisfies UserQueryRepository as UserQueryRepositoryImpl;
};

export type { UserQueryRepositoryImpl as UserQueryRepository };

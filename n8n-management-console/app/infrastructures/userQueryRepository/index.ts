import type { UserQueryRepository } from "./types";

export const createUserQueryRepository = (
  impl: UserQueryRepository,
): UserQueryRepository => {
  return {
    fetchUsers: async () => {
      return impl.fetchUsers();
    },
    fetchUserByEmail: async (email: string) => {
      return impl.fetchUserByEmail(email);
    },
  };
};

export type { UserQueryRepository };

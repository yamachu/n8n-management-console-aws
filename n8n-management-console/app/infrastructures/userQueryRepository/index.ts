import { createClient } from "./client";
import type { UserQueryRepository } from "./types";

export const createUserQueryRepository = (
  impl?: UserQueryRepository,
): UserQueryRepository => {
  const r = impl || createClient();

  return {
    fetchUsers: async () => {
      return r.fetchUsers();
    },
    fetchUserByEmail: async (email: string) => {
      return r.fetchUserByEmail(email);
    },
  };
};

export type { UserQueryRepository };

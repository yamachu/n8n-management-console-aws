import { createClient } from "./client";
import type { UserRepository } from "./types";

export const createUserRepository = (impl?: UserRepository): UserRepository => {
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

import { type User } from "../../domains/User";

export type UserRepository = {
  fetchUsers: () => Promise<User[]>;
  fetchUserByEmail: (email: string) => Promise<User | null>;
};

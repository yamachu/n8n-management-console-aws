import { type User } from "../../domains/User";

export type UserQueryRepository = {
  fetchUsers: () => Promise<User[]>;
  fetchUserByEmail: (email: string) => Promise<User | null>;
};

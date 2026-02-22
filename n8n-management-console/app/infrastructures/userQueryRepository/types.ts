import { type User } from "../../domains/User";
import type { ValueReplace } from "../../types/utils";

export type UserQueryRepository = {
  fetchUsers: () => Promise<User[]>;
  fetchUserByEmail: (email: string) => Promise<User | null>;
};

export type PlainUserQueryRepository = {
  fetchUsers: () => Promise<ValueReplace<User, { id: string }>[]>;
  fetchUserByEmail: (
    email: string,
  ) => Promise<ValueReplace<User, { id: string }> | null>;
};

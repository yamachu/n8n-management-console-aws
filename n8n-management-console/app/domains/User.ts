const userIdSymbol = Symbol();

export type UserId = string & { [userIdSymbol]: never }; // UUIDv4
export const toUserId = (id: string): UserId => id as UserId;

export interface User {
  id: UserId;
  email: string;
  firstName: string;
  lastName: string;
  role: "global:owner" | "global:member";
}

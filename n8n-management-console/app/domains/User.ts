export interface User {
  id: string; // UUIDv4
  email: string;
  firstName: string;
  lastName: string;
  role: "global:owner" | "global:member";
}

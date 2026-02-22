import type { Credential } from "../../domains/Credential";
import type { UserId } from "../../domains/User";

export type CredentialQueryRepository = {
  fetchCredentials: () => Promise<Map<UserId, Credential[]>>;
  fetchCredentialsByUserId: (userId: UserId) => Promise<Credential[]>;
};

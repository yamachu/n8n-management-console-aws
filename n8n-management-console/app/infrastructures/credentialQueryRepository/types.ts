import type { Credential } from "../../domains/Credential";
import type { UserId } from "../../domains/User";
import type { ValueReplace } from "../../types/utils";

export type CredentialQueryRepository = {
  fetchCredentials: () => Promise<Map<UserId, Credential[]>>;
  fetchCredentialsByUserId: (userId: UserId) => Promise<Credential[]>;
};

export type PlainCredentialQueryRepository = {
  fetchCredentials: () => Promise<
    Map<string, ValueReplace<Credential, { id: string }>[]>
  >;
  fetchCredentialsByUserId: (
    userId: UserId,
  ) => Promise<ValueReplace<Credential, { id: string }>[]>;
};

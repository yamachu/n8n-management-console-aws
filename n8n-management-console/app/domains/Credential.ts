import type { Mutable } from "../types/utils";
import { generateId } from "./nanoid";

declare const credentialIdSymbol: unique symbol;
declare const clonableCredentialSymbol: unique symbol;

export type CredentialId = string & { [credentialIdSymbol]: never }; // nanoid
export const toCredentialId = (id: string): CredentialId => id as CredentialId;
export const createCredentialId = (): CredentialId =>
  toCredentialId(generateId());

export interface Credential {
  id: CredentialId;
  /** Format: ISO 8601 */
  updatedAt: string;
  /** Format: ISO 8601 */
  createdAt: string;
  name: string;
  // DO NOT modify below fields directly.
  // These are managed by n8n and may have specific formats or requirements.
  data: string; // Encrypted data
  type: string;
  isManaged: boolean;
  isGlobal: boolean;
  isResolvable: boolean;
  resolvableAllowFallback: boolean;
  resolverId: string | null;
}

export type ClonableCredential = Mutable<
  Credential,
  "name" | "createdAt" | "updatedAt"
> & {
  [clonableCredentialSymbol]: never;
};

export const cloneCredential = (
  credential: Credential,
  newId?: CredentialId,
): ClonableCredential =>
  ({
    ...credential,
    id: newId ?? createCredentialId(),
  }) as ClonableCredential;

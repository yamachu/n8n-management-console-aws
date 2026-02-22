import type { BackendDB } from "../../domains/BackendDB";
import { toCredentialId } from "../../domains/Credential";
import { toUserId } from "../../domains/User";
import type { CredentialQueryRepository } from "./types";

type CredentialFromDB = {
  name: string;
  data: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  isManaged: boolean;
  isGlobal: boolean;
  isResolvable: boolean;
  resolvableAllowFallback: boolean;
  resolverId: string | null;
};

export const createClient = (
  dbClient: Extract<BackendDB, { type: "postgresql" }>,
): CredentialQueryRepository => {
  const sql = dbClient.client;

  return {
    fetchCredentials: async () => {
      const query = sql<
        (CredentialFromDB & { userId: string })[]
      >`SELECT ce.*, u."id" AS "userId" FROM "credentials_entity" AS ce
      JOIN "shared_credentials" AS sc ON ce."id" = sc."credentialsId"
      JOIN "project" AS p ON sc."projectId" = p."id"
      JOIN "project_relation" AS pr ON p."id" = pr."projectId"
      JOIN "user" AS u ON pr."userId" = u."id";
      `;

      const result = (await query).map((row) => ({
        ...row,
        userId: toUserId(row.userId),
        id: toCredentialId(row.id),
      }));
      const grouped = new Map(
        Map.groupBy(result, (item) => item.userId)
          .entries()
          .map(([userId, items]) => [
            userId,
            items.map((item) => {
              const { userId: _, ...credential } = item;
              return credential;
            }),
          ]),
      );

      return grouped;
    },
    fetchCredentialsByUserId: async (userId) => {
      const query = sql<
        CredentialFromDB[]
      >`SELECT ce.* FROM "credentials_entity" AS ce
      JOIN "shared_credentials" AS sc ON ce."id" = sc."credentialsId"
      JOIN "project" AS p ON sc."projectId" = p."id"
      JOIN "project_relation" AS pr ON p."id" = pr."projectId"
      JOIN "user" AS u ON pr."userId" = u."id"
      WHERE u."id" = ${userId as string}::uuid;
      `;

      return (await query).map((row) => ({
        ...row,
        id: toCredentialId(row.id),
      }));
    },
  };
};

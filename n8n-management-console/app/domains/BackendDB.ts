import type { Sql } from "postgres";

export type BackendDB =
  | {
      type: "postgresql";
      client: Sql;
    }
  | {
      type: "mock";
      client: unknown;
    };

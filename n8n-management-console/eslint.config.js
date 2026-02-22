import safeql from "@ts-safeql/eslint-plugin/config";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

import { enableSafeQL, safeQLDatabaseUrl } from "./.env.eslint.mjs";

export default defineConfig(
  globalIgnores(["dist/**", "*.js", "*.mjs"]),
  {
    files: [
      "vite.config.ts" /** enableSafeQL===falseの時に対象がなくなってしまうため */,
    ],
  },
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...(enableSafeQL
    ? [
        {
          files: ["**/infrastructures/**/*.ts"],
          ...safeql.configs.connections({
            databaseUrl: safeQLDatabaseUrl,
            targets: [{ tag: "sql", transform: "{type}[]" }],
            overrides: {
              types: {
                // createdAt, updatedAtなど
                timestamptz: "string",
                // userIdとか
                uuid: {
                  parameter: "string",
                  return: "string",
                },
              },
            },
          }),
        },
      ]
    : []),
);

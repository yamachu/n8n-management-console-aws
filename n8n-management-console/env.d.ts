export type RuntimeEnv = {
  COGNITO_REGION: string;
  COGNITO_CLIENT_ID: string;
  AWS_CREDENTIALS: "inherit" | string;

  N8N_API_KEY: string;
  N8N_BASE_ENDPOINT: string;

  N8N_BACKEND_DB_TYPE: "postgresql" | "none";
  N8N_BACKEND_DB_CONNECTION_STRING: string;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends RuntimeEnv {}
  }
}

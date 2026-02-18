export type RuntimeEnv = {
  COGNITO_REGION: string;
  COGNITO_CLIENT_ID: string;
  AWS_CREDENTIALS: "inherit" | string;

  N8N_API_KEY: string;
  N8N_BASE_ENDPOINT: string;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends RuntimeEnv {}
  }
}

export const COGNITO_ENDPOINT = import.meta.env.VITE_COGNITO_ENDPOINT;
export const REGION = process.env.COGNITO_REGION;
export const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
export const COOKIE_PREFIX = `CognitoIdentityServiceProvider.${CLIENT_ID}`;
export const AWS_CREDENTIALS:
  | { accessKeyId: string; secretAccessKey: string }
  | "inherit" = JSON.parse(process.env.AWS_CREDENTIALS);

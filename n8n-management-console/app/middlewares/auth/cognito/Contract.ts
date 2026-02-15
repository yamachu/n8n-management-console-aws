export const COGNITO_ENDPOINT = import.meta.env.VITE_COGNITO_ENDPOINT;
export const REGION = import.meta.env.VITE_COGNITO_REGION;
export const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
export const COOKIE_PREFIX = `CognitoIdentityServiceProvider.${CLIENT_ID}`;
export const AWS_CREDENTIALS: { accessKeyId: string; secretAccessKey: string } | "inherit" =
  JSON.parse(import.meta.env.VITE_AWS_CREDENTIALS);

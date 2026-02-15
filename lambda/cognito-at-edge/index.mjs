import { Authenticator } from "cognito-at-edge";

const authenticator = new Authenticator({
  // Required configuration
  region: process.env.AWS_REGION,
  userPoolId: process.env.USER_POOL_ID,
  userPoolAppId: process.env.USER_POOL_APP_ID,
  userPoolDomain: process.env.USER_POOL_DOMAIN,

  // Optional configuration
  cookieExpirationDays: 1,
  httpOnly: true,
  logLevel: "info",
});

export const handler = async (request) => authenticator.handle(request);

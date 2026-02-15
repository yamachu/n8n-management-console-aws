import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { UnauthorizedError } from "../../../exceptions";
import type { AuthClient } from "..";
import { cookieStringToMap } from "../domain";
import { AWS_CREDENTIALS, COGNITO_ENDPOINT, REGION } from "./Contract";
import { useProductionCognito } from "./Contract.production";
import { fetchAccessTokenFromCookie } from "./domain";

type UnwrapClient<T> = {
  [K in keyof T]: T[K] extends (client: CognitoIdentityProviderClient) => infer R ? R : never;
};

export const createAuthClient = <
  T extends Record<string, (client: CognitoIdentityProviderClient) => unknown>,
>(
  customHandler: T,
): Promise<AuthClient & UnwrapClient<T>> => {
  const cognitoClient = new CognitoIdentityProviderClient({
    endpoint: COGNITO_ENDPOINT === useProductionCognito ? undefined : COGNITO_ENDPOINT,
    region: REGION,
    credentials: AWS_CREDENTIALS === useProductionCognito ? undefined : AWS_CREDENTIALS,
  });

  const handlers = Object.fromEntries(
    Object.entries(customHandler).map(([key, fn]) => [key, fn(cognitoClient)]),
  ) as UnwrapClient<T>;

  return Promise.resolve({
    fetchUser: async (token: string) => {
      const command = new GetUserCommand({
        AccessToken: token,
      });
      const result = await cognitoClient.send(command);
      const maybeEmail = result.UserAttributes?.find((attr) => attr.Name === "email")?.Value;
      if (maybeEmail === undefined) {
        throw new UnauthorizedError("ユーザーのメールアドレスが見つかりません");
      }
      return { email: maybeEmail };
    },

    extractToken: async (headers: Record<string, string>) => {
      const cookies = headers["cookie"];
      const mappedCookies = cookieStringToMap(cookies);
      return fetchAccessTokenFromCookie(mappedCookies);
    },

    ...handlers,
  });
};

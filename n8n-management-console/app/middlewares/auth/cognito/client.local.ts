import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

import { UnauthorizedError } from "../../../exceptions";
import { createAuthClient } from "./client";
import { CLIENT_ID } from "./Contract";

export const localAuthClient = await createAuthClient({
  authenticateUser: (client) => async (username: string, password: string) => {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    const response = await client.send(command);

    if (!response.AuthenticationResult) {
      throw new UnauthorizedError();
    }

    return {
      accessToken: response.AuthenticationResult.AccessToken || "",
      idToken: response.AuthenticationResult.IdToken || "",
      refreshToken: response.AuthenticationResult.RefreshToken || "",
    };
  },
});

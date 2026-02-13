import {
  CognitoIdentityProviderClient,
  CreateUserPoolCommand,
  CreateUserPoolClientCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const MOTO_ENDPOINT = process.env.MOTO_ENDPOINT || "http://127.0.0.1:5001";
const REGION = "us-east-1";
const USER_POOL_NAME = "local-test-pool";
const APP_CLIENT_NAME = "local-test-client";
const TEST_USER_EMAIL = "test@example.com";
const TEST_USER_PASSWORD = "TestPassword123!";

const client = new CognitoIdentityProviderClient({
  endpoint: MOTO_ENDPOINT,
  region: REGION,
  credentials: {
    accessKeyId: "testing",
    secretAccessKey: "testing",
  },
});

async function initCognito() {
  try {
    console.log("Creating User Pool...");
    const userPoolResponse = await client.send(
      new CreateUserPoolCommand({
        PoolName: USER_POOL_NAME,
        Policies: {
          PasswordPolicy: {
            MinimumLength: 8,
            RequireUppercase: false,
            RequireLowercase: false,
            RequireNumbers: false,
            RequireSymbols: false,
          },
        },
        AutoVerifiedAttributes: ["email"],
      }),
    );

    const userPoolId = userPoolResponse.UserPool?.Id;
    if (!userPoolId) {
      throw new Error("Failed to create User Pool");
    }
    console.log(`    User Pool ID: ${userPoolId}\n`);

    console.log("Creating App Client...");
    const appClientResponse = await client.send(
      new CreateUserPoolClientCommand({
        UserPoolId: userPoolId,
        ClientName: APP_CLIENT_NAME,
        ExplicitAuthFlows: [
          "ALLOW_USER_PASSWORD_AUTH",
          "ALLOW_REFRESH_TOKEN_AUTH",
        ],
        GenerateSecret: false,
      }),
    );

    const clientId = appClientResponse.UserPoolClient?.ClientId;
    if (!clientId) {
      throw new Error("Failed to get Client ID");
    }
    console.log(`    Client ID: ${clientId}\n`);

    // 3. Create Test User
    console.log("Creating Test User...");
    await client.send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: TEST_USER_EMAIL,
        UserAttributes: [
          {
            Name: "email",
            Value: TEST_USER_EMAIL,
          },
          {
            Name: "email_verified",
            Value: "true",
          },
        ],
        MessageAction: "SUPPRESS",
      }),
    );
    console.log(`    Created User: ${TEST_USER_EMAIL}\n`);

    // 4. Set Password
    console.log("Setting Password...");
    await client.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: TEST_USER_EMAIL,
        Password: TEST_USER_PASSWORD,
        Permanent: true,
      }),
    );
    console.log(`    Password Set\n`);

    // Output information to be saved as environment variables
    console.log("=".repeat(80));
    console.log(`COGNITO_USER_POOL_ID=${userPoolId}`);
    console.log(`COGNITO_CLIENT_ID=${clientId}`);
    console.log(`COGNITO_REGION=${REGION}`);
    console.log(`MOTO_ENDPOINT=${MOTO_ENDPOINT}`);
    console.log(`\nTest User:`);
    console.log(`    Email: ${TEST_USER_EMAIL}`);
    console.log(`    Password: ${TEST_USER_PASSWORD}`);
    console.log("\n");
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

initCognito();

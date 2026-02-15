declare namespace NodeJS {
  interface ProcessEnv {
    AWS_REGION: string;
    USER_POOL_ID: string;
    USER_POOL_APP_ID: string;
    USER_POOL_DOMAIN: string;
    TARGET_LAMBDA_REGION: string;
  }
}

import { Sha256 } from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { HttpRequest } from "@smithy/protocol-http";
import { SignatureV4 } from "@smithy/signature-v4";
import { parseUrl } from "@smithy/url-parser";
import type {
  CloudFrontRequestEvent,
  CloudFrontRequestHandler,
} from "aws-lambda";
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

export const handler: CloudFrontRequestHandler = async (
  event: CloudFrontRequestEvent,
  _context,
) => {
  // https://github.com/awslabs/cognito-at-edge
  const authResponse = await authenticator.handle(event);
  if ("status" in authResponse && authResponse.status !== "success") {
    return authResponse;
  }

  // 以下参考: https://dev.classmethod.jp/articles/cloudfront-lambda-url-sigv4-signer/
  const request = event.Records.at(0)?.cf.request!;
  const targetHost = request.headers.host?.at(0)?.value!;
  const url = `https://${targetHost}${request.uri}`;

  const body = request.body?.data || "";
  const decodedBody = Buffer.from(body, "base64").toString("utf-8");

  const parsedUrl = parseUrl(url);

  const httpRequest = new HttpRequest({
    headers: {
      host: parsedUrl.hostname || "",
      ...Object.fromEntries(
        Object.entries(request.headers)
          .filter(([k, v]) => k.toLowerCase() !== "x-forwarded-for")
          .map(([k, v]) => [k.toLowerCase(), v.at(0)?.value]),
      ),
    },
    hostname: parsedUrl.hostname || "",
    method: request.method,
    path: parsedUrl.path,
    body: decodedBody,
  });

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: process.env.TARGET_LAMBDA_REGION,
    service: "lambda",
    sha256: Sha256,
  });

  const signedRequest = await signer.sign(httpRequest);

  for (const key of [
    "authorization",
    "x-amz-date",
    "x-amz-security-token",
    "x-amz-content-sha256",
  ]) {
    request.headers[key] = [{ key: key, value: signedRequest.headers[key]! }];
  }

  return request;
};

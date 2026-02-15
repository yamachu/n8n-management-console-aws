import { UnauthorizedError } from "../../../exceptions";
import { COOKIE_PREFIX } from "./Contract";

export const fetchAccessTokenFromCookie = (cookieMap: Map<string, string>): Promise<string> => {
  const maybeAuthCookies = Array.from(cookieMap.entries()).filter(([key]) => {
    return key.toLocaleLowerCase().startsWith(COOKIE_PREFIX.toLocaleLowerCase());
  });

  if (maybeAuthCookies.length === 0) {
    throw new UnauthorizedError("Cognitoの認証クッキーが見つかりません。");
  }
  const maybeAccessTokenCookie = maybeAuthCookies.find(([key]) => {
    return key.toLocaleLowerCase().endsWith(".accessToken".toLocaleLowerCase());
  });

  if (!maybeAccessTokenCookie) {
    throw new UnauthorizedError("Cognitoのアクセストークンクッキーが見つかりません。");
  }

  return Promise.resolve(maybeAccessTokenCookie[1]);
};

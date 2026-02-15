export const cookieStringToMap = (cookieString: string): Map<string, string> => {
  const mappedCookies = cookieString
    .split(";")
    .map((v) => v.trim())
    .map((cookieStr) => {
      const [key, ...rest] = cookieStr.split("=");
      return [key, rest.join("=")] as const;
    });
  return new Map(mappedCookies);
};

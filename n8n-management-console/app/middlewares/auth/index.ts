export interface AuthClient {
  fetchUser: (token: string) => Promise<{ email: string }>;
  extractToken: (headers: Record<string, string>) => Promise<string>;
}

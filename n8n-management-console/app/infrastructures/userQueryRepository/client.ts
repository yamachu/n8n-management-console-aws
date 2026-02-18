import { toUserId } from "../../domains/User";
import type { UserQueryRepository } from "./types";

type UserFromAPI = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isPending: boolean;
  role: "global:owner" | "global:member";
};

type UsersResponse = {
  data: UserFromAPI[];
  nextCursor: string | null;
};

const apiKey = import.meta.env.VITE_N8N_API_KEY;
const baseEndpoint = import.meta.env.VITE_N8N_BASE_ENDPOINT;

export const createClient = (): UserQueryRepository => {
  return {
    fetchUsers: async () => {
      return (await fetchUsersRecursively()).map((user) => ({
        id: toUserId(user.id),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }));
    },
    fetchUserByEmail: async (email: string) => {
      const found = await fetchUserByEmailRecursively(email);
      if (!found) {
        return null;
      }
      return {
        id: toUserId(found.id),
        email: found.email,
        firstName: found.firstName,
        lastName: found.lastName,
        role: found.role,
      };
    },
  } satisfies UserQueryRepository;
};

const fetchUsers = async (cursor?: string): Promise<UsersResponse> => {
  const url = new URL("/api/v1/users", baseEndpoint);
  url.searchParams.append("limit", "100");
  url.searchParams.append("includeRole", "true");
  if (cursor) {
    url.searchParams.append("cursor", cursor);
  }

  const res = await fetch(url, {
    headers: {
      "X-N8N-API-KEY": apiKey,
    },
  });

  if (res.status !== 200) {
    throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as UsersResponse;
  return data;
};

const fetchUsersRecursively = async (
  cursor?: string,
  acc: UserFromAPI[] = [],
): Promise<UserFromAPI[]> => {
  const { data, nextCursor } = await fetchUsers(cursor);
  const newAcc = [...acc, ...data];
  if (nextCursor) {
    return fetchUsersRecursively(nextCursor, newAcc);
  }
  return newAcc;
};

const fetchUserByEmailRecursively = async (
  email: string,
  cursor?: string,
): Promise<UserFromAPI | null> => {
  const { data, nextCursor } = await fetchUsers(cursor);
  const foundUser = data.find((user) => user.email === email);
  if (foundUser) {
    return foundUser;
  }
  if (nextCursor) {
    return fetchUserByEmailRecursively(email, nextCursor);
  }
  return null;
};

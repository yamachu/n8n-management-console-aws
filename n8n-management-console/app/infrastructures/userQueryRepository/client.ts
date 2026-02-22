import type { PlainUserQueryRepository } from "./types";

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

type FetchParams = {
  endpoint: string;
  apiKey: string;
};

export const createClient = (
  endpoint: string,
  apiKey: string,
): PlainUserQueryRepository => {
  const fetchParams: FetchParams = {
    endpoint,
    apiKey,
  };

  return {
    fetchUsers: async () => {
      return (await fetchUsersRecursively(fetchParams)).map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }));
    },
    fetchUserByEmail: async (email: string) => {
      const found = await fetchUserByEmailRecursively(fetchParams, email);
      if (!found) {
        return null;
      }
      return {
        id: found.id,
        email: found.email,
        firstName: found.firstName,
        lastName: found.lastName,
        role: found.role,
      };
    },
  } satisfies PlainUserQueryRepository;
};

const fetchUsers = async (
  fetchParams: FetchParams,
  cursor?: string,
): Promise<UsersResponse> => {
  const url = new URL("/api/v1/users", fetchParams.endpoint);
  url.searchParams.append("limit", "100");
  url.searchParams.append("includeRole", "true");
  if (cursor) {
    url.searchParams.append("cursor", cursor);
  }

  const res = await fetch(url, {
    headers: {
      "X-N8N-API-KEY": fetchParams.apiKey,
    },
  });

  if (res.status !== 200) {
    throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as UsersResponse;
  return data;
};

const fetchUsersRecursively = async (
  fetchParams: FetchParams,
  cursor?: string,
  acc: UserFromAPI[] = [],
): Promise<UserFromAPI[]> => {
  const { data, nextCursor } = await fetchUsers(fetchParams, cursor);
  const newAcc = [...acc, ...data];
  if (nextCursor) {
    return fetchUsersRecursively(fetchParams, nextCursor, newAcc);
  }
  return newAcc;
};

const fetchUserByEmailRecursively = async (
  fetchParams: FetchParams,
  email: string,
  cursor?: string,
): Promise<UserFromAPI | null> => {
  const { data, nextCursor } = await fetchUsers(fetchParams, cursor);
  const foundUser = data.find((user) => user.email === email);
  if (foundUser) {
    return foundUser;
  }
  if (nextCursor) {
    return fetchUserByEmailRecursively(fetchParams, email, nextCursor);
  }
  return null;
};

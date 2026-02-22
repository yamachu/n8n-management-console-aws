import { type Context } from "hono";
import { setCookie } from "hono/cookie";
import { showRoutes } from "hono/dev";

import { localAuthClient } from "./middlewares/auth/cognito/client.local";
import {
  COOKIE_MAX_AGE,
  LOCAL_TESTING_COOKIE_NAME,
} from "./middlewares/auth/cognito/Contract.local";
import { createComposeMiddlewareApp } from "./server";

const localAuthPath = "/_testing/login" as const;

const app = createComposeMiddlewareApp({
  authArgs: [
    localAuthClient,
    (c) => {
      const passthroughPaths = [localAuthPath];
      return !passthroughPaths.some((path) => c.req.path.startsWith(path));
    },
  ],
  userRepositoryImplArgs: [
    {
      fetchUsers: async () => [],
      fetchUserByEmail: async (email) => {
        return {
          id: "6c151317-c84b-41e9-8ddf-12b2689cdb3a" /** Random uuid v4 formatted value */,
          email,
          firstName: "Test",
          lastName: "User",
          role: "global:owner",
        };
      },
    },
  ],
})
  .use(
    localAuthPath,
    async (
      c: Context<{ Variables: { authClient: typeof localAuthClient } }>,
      next,
    ) => {
      c.set("authClient", localAuthClient);
      await next();
    },
  )
  .get(localAuthPath, async (c) => {
    return c.render(
      <form method={"post"}>
        <input name="username" placeholder="Username" />
        <input name="password" placeholder="Password" type="password" />
        <button type="submit">Login</button>
      </form>,
    );
  })
  .post(localAuthPath, async (c) => {
    try {
      const body = await c.req.formData();
      const username = body.get("username");
      const password = body.get("password");

      if (!username || !password) {
        return c.json(
          { error: "Bad Request", message: "usernameとpasswordが必要です" },
          400,
        );
      }

      const tokens = await c.var.authClient.authenticateUser(
        username.toString(),
        password!.toString(),
      );

      // Lambda@Edgeでの動作を模倣
      setCookie(c, LOCAL_TESTING_COOKIE_NAME, tokens.accessToken, {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        secure: true,
      });

      return c.json({
        success: true,
        message: "ログイン成功",
        user: { username },
      });
    } catch (error) {
      console.error("ログインエラー:", error);
      return c.json(
        {
          error: "Authentication Failed",
          message:
            "認証に失敗しました。ユーザー名とパスワードを確認してください。",
        },
        401,
      );
    }
  })
  .get("/about", async (c) => {
    return c.render(
      <>
        <title>About - n8n Management Console</title>
        <div>
          <h1>About Page</h1>
          <p>This is the about page of the n8n Management Console.</p>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: 'console.log("This is about page.");',
          }}
        />
      </>,
    );
  });

showRoutes(app);

export default app;

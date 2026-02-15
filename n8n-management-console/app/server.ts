import { Hono, type Env } from "hono";
import { showRoutes } from "hono/dev";
import { createApp } from "honox/server";

const composeMiddlewareApp = new Hono<Env>();
composeMiddlewareApp.use("*", async (c, next) => {
  console.log(`Received request: ${c.req.method} ${c.req.url}`);
  await next();
});

const app = createApp<Env>({
  app: composeMiddlewareApp,
});

showRoutes(app);

export default app;

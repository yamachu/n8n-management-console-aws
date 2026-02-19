import type { Env } from "hono";
import { createFactory } from "hono/factory";

const factory = createFactory<Env>();

export default factory.createHandlers((c) => {
  const name = c.req.query("name") ?? "Hono";
  return c.render(
    <div class="py-8 text-center">
      <title>{name}</title>
      <h1 class="text-3xl font-bold">Hello, {name}!</h1>
    </div>,
  );
});

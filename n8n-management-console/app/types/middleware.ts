import type { createMiddleware } from "hono/factory";
import type { Env } from "hono/types";

type MiddlewareFactory<Requires extends Env, Provides extends Env> = ReturnType<
  typeof createMiddleware<Requires & Provides>
>;

export const defineMiddleware = <R extends Env, P extends Env>(
  handler: ReturnType<typeof createMiddleware<R & P>>,
): MiddlewareFactory<R, P> => handler;

export type RequiresMiddleware<
  T extends Env,
  K extends keyof T["Variables"],
> = {
  Variables: Pick<T["Variables"], K>;
  Bindings: T["Bindings"];
};

export type ProvidesMiddleware<
  T extends Env,
  K extends keyof T["Variables"],
> = {
  Variables: Pick<T["Variables"], K>;
  Bindings: T["Bindings"];
};
